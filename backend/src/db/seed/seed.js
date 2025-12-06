/**
 * backend/src/db/seed/seed.js
 * Robust seeder for the UHI hackathon.
 *
 * - Converts 24-hex string _id and reference fields to ObjectId
 * - Hashes plaintext passwords
 * - Uses ordered:false for resilience
 */

require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const { mongoUri } = require('../../config'); // ensure this file exports mongoUri

// Models
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Staff = require('../models/Staff');
const ConsultationEvent = require('../models/ConsultationEvent');
const PrescriptionEvent = require('../models/PrescriptionEvent'); // your existing line
const LhpChronicCondition = require('../models/LhpChronicCondition');
const LhpAllergy = require('../models/LhpAllergy');
const LhpCurrentMedication = require('../models/LhpCurrentMedication');
const LhpPastProcedure = require('../models/LhpPastProcedure');
const LhpSuggestion = require('../models/LhpSuggestion');


const seedDir = __dirname;
const BCRYPT_SALT_ROUNDS = 10;

/** load seed JSON file (safe) */
function loadSeed(name) {
  try {
    const filePath = path.join(seedDir, `${name}.seed.json`);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Seed file not found: ${name}.seed.json (skipping)`);
      return [];
    }
    const raw = fs.readFileSync(filePath, 'utf-8').trim();
    if (!raw) {
      console.warn(`⚠️  Seed file empty: ${name}.seed.json (skipping)`);
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn(`⚠️  Seed file ${name}.seed.json doesn't contain an array (skipping)`);
      return [];
    }
    console.log(`📄 Loaded ${parsed.length} records from ${name}.seed.json`);
    return parsed;
  } catch (err) {
    console.error(`❌ Error loading ${name}.seed.json: ${err.message}`);
    return [];
  }
}

/** Detect 24-hex ObjectId-like string */
function looksLikeObjectId(s) {
  return typeof s === 'string' && /^[0-9a-fA-F]{24}$/.test(s);
}

// -------- FIXED castIds FUNCTION (replace the old one completely) --------

function looksLikeObjectId(s) {
  return typeof s === 'string' && /^[0-9a-fA-F]{24}$/.test(s);
}

function toObjectId(val) {
  // Already an ObjectId? return as-is
  if (val && typeof val === 'object' && (val._bsontype === 'ObjectID' || (val.constructor && val.constructor.name === 'ObjectId'))) {
    return val;
  }
  // If it looks like a string ObjectId, convert properly using new
  if (looksLikeObjectId(val)) {
    return new mongoose.Types.ObjectId(val);
  }
  return val;
}

function castIds(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  const idFields = [
    '_id', 'patientId', 'doctorId', 'staffId', 'createdByUserId',
    'linkedConsultationId', 'prescriptionId', 'dispensedByStaffId'
  ];

  const copy = { ...obj };

  // top-level ids
  for (const f of idFields) {
    if (copy[f]) {
      copy[f] = toObjectId(copy[f]);
    }
  }

  // SOAP current
  if (copy.soap?.current?.editedByUserId) {
    copy.soap.current.editedByUserId = toObjectId(copy.soap.current.editedByUserId);
  }

  // SOAP history
  if (Array.isArray(copy.soap?.history)) {
    copy.soap.history = copy.soap.history.map(h => ({
      ...h,
      editedByUserId: h.editedByUserId ? toObjectId(h.editedByUserId) : h.editedByUserId
    }));
  }

  // meds current
  if (copy.meds?.current?.editedByUserId) {
    copy.meds.current.editedByUserId = toObjectId(copy.meds.current.editedByUserId);
  }

  // meds history
  if (Array.isArray(copy.meds?.history)) {
    copy.meds.history = copy.meds.history.map(h => ({
      ...h,
      editedByUserId: h.editedByUserId ? toObjectId(h.editedByUserId) : h.editedByUserId
    }));
  }

  // LHP: source.eventId on LHP entries
  if (copy.source && copy.source.eventId) {
    copy.source.eventId = toObjectId(copy.source.eventId);
  }

  // LHP: sourceEventId on suggestions
  if (copy.sourceEventId) {
    copy.sourceEventId = toObjectId(copy.sourceEventId);
  }

  return copy;
}


async function prepareUsers(users, { doctors = [], patients = [], staff = [] } = {}) {
  // Build quick lookup maps by _id (string)
  const doctorMap = new Map(doctors.map(d => [String(d._id), d]));
  const patientMap = new Map(patients.map(p => [String(p._id), p]));
  const staffMap = new Map(staff.map(s => [String(s._id), s]));

  return Promise.all(
    users.map(async (u) => {
      const copy = { ...u };

      // Convert _id if necessary (use toObjectId which uses `new`)
      if (copy._id) {
        copy._id = toObjectId(copy._id);
      }

      // Convert role-specific id refs to ObjectId too
      if (copy.doctorId) copy.doctorId = toObjectId(copy.doctorId);
      if (copy.patientId) copy.patientId = toObjectId(copy.patientId);
      if (copy.staffId) copy.staffId = toObjectId(copy.staffId);

      // 🔎 Derive `name` from linked role doc if missing
      if (!copy.name) {
        const role = (copy.role || '').toString().toLowerCase();

        if (role === 'doctor' && copy.doctorId) {
          const d = doctorMap.get(String(copy.doctorId));
          if (d && d.name) {
            copy.name = d.name;
          }
        } else if (role === 'patient' && copy.patientId) {
          const p = patientMap.get(String(copy.patientId));
          if (p && p.name) {
            copy.name = p.name;
          }
        } else if (role === 'staff' && copy.staffId) {
          const s = staffMap.get(String(copy.staffId));
          if (s && s.name) {
            copy.name = s.name;
          }
        }
      }

      // If passwordHash looks like plain text (short), hash it
      if (copy.passwordHash && typeof copy.passwordHash === 'string') {
        const isProbablyPlain = copy.passwordHash.length < 30; // bcrypt hashes ~60 chars
        if (isProbablyPlain) {
          const hashed = await bcrypt.hash(copy.passwordHash, BCRYPT_SALT_ROUNDS);
          copy.passwordHash = hashed;
        }
      }

      return copy;
    })
  );
}



async function run() {
  try {
    if (!mongoUri && !process.env.MONGO_URI) {
      console.error('❌ No MONGO_URI in config or env. Set it and retry.');
      process.exit(1);
    }
    const uri = mongoUri || process.env.MONGO_URI;
    console.log('🔌 Connecting to MongoDB:', uri);
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    // Clear collections we will seed
    console.log('🧹 Clearing target collections (User, Patient, Doctor, Staff, ConsultationEvent, PrescriptionEvent, LHP*)');
    await Promise.all([
      User.deleteMany({}),
      Patient.deleteMany({}),
      Doctor.deleteMany({}),
      Staff.deleteMany({}),
      ConsultationEvent.deleteMany({}),
      PrescriptionEvent.deleteMany({}),
      LhpChronicCondition.deleteMany({}),
      LhpAllergy.deleteMany({}),
      LhpCurrentMedication.deleteMany({}),
      LhpPastProcedure.deleteMany({}),
      LhpSuggestion.deleteMany({})
    ]);
    console.log('🧼 Cleared.');

    // Load seed files
    const patientsRaw = loadSeed('patients');
    const doctorsRaw = loadSeed('doctors');
    const staffRaw = loadSeed('staff');
    const usersRaw = loadSeed('users');
    const consultationsRaw = loadSeed('consultations');
    const prescriptionsRaw = loadSeed('prescriptions');

    // LHP

    const lhpChronicRaw = loadSeed('lhpChronicConditions');
    const lhpAllergyRaw = loadSeed('lhpAllergies');
    const lhpCurrentMedsRaw = loadSeed('lhpCurrentMedications');
    const lhpPastProceduresRaw = loadSeed('lhpPastProcedures');
    const lhpSuggestionsRaw = loadSeed('lhpSuggestions');


    // Cast and prepare documents
    const patients = patientsRaw.map(p => castIds(p));
    const doctors = doctorsRaw.map(d => castIds(d));
    const staff = staffRaw.map(s => castIds(s));
    const users = await prepareUsers(usersRaw, { doctors, patients, staff });
    const consultations = consultationsRaw.map(c => castIds(c));
    const prescriptions = prescriptionsRaw.map(p => castIds(p));

    const lhpChronic = lhpChronicRaw.map(c => castIds(c));
    const lhpAllergies = lhpAllergyRaw.map(a => castIds(a));
    const lhpCurrentMeds = lhpCurrentMedsRaw.map(m => castIds(m));
    const lhpPastProcedures = lhpPastProceduresRaw.map(pp => castIds(pp));
    const lhpSuggestions = lhpSuggestionsRaw.map(s => castIds(s));


    // Insert with ordered:false so one bad doc doesn't stop the rest
    if (patients.length) {
      await Patient.insertMany(patients, { ordered: false });
      console.log(`✅ Inserted ${patients.length} patients`);
    }
    if (doctors.length) {
      await Doctor.insertMany(doctors, { ordered: false });
      console.log(`✅ Inserted ${doctors.length} doctors`);
    }
    if (staff.length) {
      await Staff.insertMany(staff, { ordered: false });
      console.log(`✅ Inserted ${staff.length} staff`);
    }
    if (users.length) {
      await User.insertMany(users, { ordered: false });
      console.log(`✅ Inserted ${users.length} users`);
    }
    if (consultations.length) {
      await ConsultationEvent.insertMany(consultations, { ordered: false });
      console.log(`✅ Inserted ${consultations.length} consultations`);
    }
    if (prescriptions.length) {
      await PrescriptionEvent.insertMany(prescriptions, { ordered: false });
      console.log(`✅ Inserted ${prescriptions.length} prescriptions`);
    }

    if (lhpChronic.length) {
      await LhpChronicCondition.insertMany(lhpChronic, { ordered: false });
      console.log(`✅ Inserted ${lhpChronic.length} LHP chronic conditions`);
    }
    if (lhpAllergies.length) {
      await LhpAllergy.insertMany(lhpAllergies, { ordered: false });
      console.log(`✅ Inserted ${lhpAllergies.length} LHP allergies`);
    }
    if (lhpCurrentMeds.length) {
      await LhpCurrentMedication.insertMany(lhpCurrentMeds, { ordered: false });
      console.log(`✅ Inserted ${lhpCurrentMeds.length} LHP current medications`);
    }
    if (lhpPastProcedures.length) {
      await LhpPastProcedure.insertMany(lhpPastProcedures, { ordered: false });
      console.log(`✅ Inserted ${lhpPastProcedures.length} LHP past procedures`);
    }
    if (lhpSuggestions.length) {
      await LhpSuggestion.insertMany(lhpSuggestions, { ordered: false });
      console.log(`✅ Inserted ${lhpSuggestions.length} LHP suggestions`);
    }

    console.log('🌱 Seed completed');


    console.log('🌱 Seed completed');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

run();
