// backend/src/modules/users/users.service.js
const mongoose = require('mongoose');
const User = require('../../db/models/User');
const bcrypt = require('bcryptjs');

// domain models
const Doctor = require('../../db/models/Doctor');
const Patient = require('../../db/models/Patient');
const Staff = require('../../db/models/Staff');

async function createDoctorIfNeeded(data, session) {
  if (data.doctorId) return { id: data.doctorId, created: false };

  if (data.doctor && typeof data.doctor === 'object') {
    const doc = {
      name: data.doctor.name,
      specialization: data.doctor.specialization || undefined,
      registrationNumber: data.doctor.registrationNumber || undefined
    };
    if (!doc.name) throw new Error('doctor.name is required when creating a doctor');

    const created = await Doctor.create([doc], session ? { session } : undefined);
    const createdId = Array.isArray(created) ? created[0]._id : created._id;
    return { id: createdId, created: true };
  }

  throw new Error('doctorId or doctor object required for role doctor');
}

async function createPatientIfNeeded(data, session) {
  if (data.patientId) return { id: data.patientId, created: false };

  if (data.patient && typeof data.patient === 'object') {
    const doc = {
      patientCode: data.patient.patientCode || `P-${Date.now().toString().slice(-6)}`,
      name: data.patient.name,
      age: data.patient.age,
      gender: data.patient.gender,
      phone: data.patient.phone
    };
    if (!doc.patientCode || !doc.name) throw new Error('patient.patientCode and patient.name are required when creating a patient');

    const created = await Patient.create([doc], session ? { session } : undefined);
    const createdId = Array.isArray(created) ? created[0]._id : created._id;
    return { id: createdId, created: true };
  }

  throw new Error('patientId or patient object required for role patient');
}

async function createStaffIfNeeded(data, session) {
  if (data.staffId) return { id: data.staffId, created: false };

  if (data.staff && typeof data.staff === 'object') {
    const doc = {
      name: data.staff.name,
      roleDescription: data.staff.roleDescription || undefined
    };
    if (!doc.name) throw new Error('staff.name is required when creating staff');

    const created = await Staff.create([doc], session ? { session } : undefined);
    const createdId = Array.isArray(created) ? created[0]._id : created._id;
    return { id: createdId, created: true };
  }

  throw new Error('staffId or staff object required for role staff');
}

exports.list = async () => {
  // Admin-only usage expected. Returns users without passwordHash.
  return await User.find({}, '-passwordHash').lean();
};

exports.getById = async (id) => {
  return await User.findById(id, '-passwordHash').lean();
};

exports.create = async (data) => {
  if (!data || !data.email || !data.password) {
    throw new Error('email and password are required');
  }

  // Prevent creation of additional admins unless explicitly allowed
  if (data.role && data.role === 'admin' && process.env.ALLOW_ADMIN_CREATE !== 'true') {
    throw new Error('Creating admin users via API is disabled. Use env ALLOW_ADMIN_CREATE=true to allow.');
  }

  // ensure unique email
  const existing = await User.findOne({ email: data.email });
  if (existing) throw new Error('email already exists');

  const role = data.role || 'patient';

  // Attempt to use a mongoose session/transaction where possible
  let session = null;
  let usingTransaction = false;
  try {
    session = await mongoose.startSession();
    try {
      session.startTransaction();
      usingTransaction = true;
    } catch (txErr) {
      usingTransaction = false;
    }
  } catch (sessErr) {
    session = null;
    usingTransaction = false;
  }

  const createdDomain = { doctorId: null, patientId: null, staffId: null };

  try {
    let doctorInfo, patientInfo, staffInfo;
    if (role === 'doctor') {
      doctorInfo = await createDoctorIfNeeded(data, usingTransaction ? session : null);
      if (doctorInfo.created) createdDomain.doctorId = doctorInfo.id;
    } else if (role === 'patient') {
      patientInfo = await createPatientIfNeeded(data, usingTransaction ? session : null);
      if (patientInfo.created) createdDomain.patientId = patientInfo.id;
    } else if (role === 'staff') {
      staffInfo = await createStaffIfNeeded(data, usingTransaction ? session : null);
      if (staffInfo.created) createdDomain.staffId = staffInfo.id;
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const userDoc = {
      email: data.email,
      passwordHash,
      role,
      name: data.name || '',
      doctorId: doctorInfo?.id || undefined,
      patientId: patientInfo?.id || undefined,
      staffId: staffInfo?.id || undefined
    };

    const createdUsers = await User.create([userDoc], usingTransaction ? { session } : undefined);
    const createdUser = Array.isArray(createdUsers) ? createdUsers[0] : createdUsers;

    if (usingTransaction && session) {
      await session.commitTransaction();
    }

    const out = createdUser.toObject();
    delete out.passwordHash;
    return out;
  } catch (err) {
    if (usingTransaction && session) {
      try { await session.abortTransaction(); } catch (e) { /* ignore */ }
    } else {
      try {
        if (createdDomain.doctorId) await Doctor.findByIdAndDelete(createdDomain.doctorId).exec();
        if (createdDomain.patientId) await Patient.findByIdAndDelete(createdDomain.patientId).exec();
        if (createdDomain.staffId) await Staff.findByIdAndDelete(createdDomain.staffId).exec();
      } catch (rbErr) {
        console.error('Rollback error:', rbErr);
      }
    }
    throw err;
  } finally {
    if (session) session.endSession();
  }
};

exports.update = async (id, data) => {
  if (data.role === 'admin' && process.env.ALLOW_ADMIN_CREATE !== 'true') {
    // disallow promoting to admin via update unless explicitly allowed
    throw new Error('Modifying role to admin via API is disabled.');
  }
  if (data.password) {
    data.passwordHash = await bcrypt.hash(data.password, 10);
    delete data.password;
  }
  const updated = await User.findByIdAndUpdate(id, data, { new: true, select: '-passwordHash' }).lean();
  return updated;
};

exports.remove = async (id) => {
  await User.findByIdAndDelete(id);
  return;
};
