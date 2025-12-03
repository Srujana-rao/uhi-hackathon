// backend/src/db/models/PrescriptionEvent.js
const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
  name: String,
  dosage: String,
  frequency: String,
  route: String,
  duration: String,
  instructions: String,
  startDate: Date,
  endDate: Date,
  isCurrent: Boolean,
  dispensedByStaffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  dispensedAt: Date
}, { _id: false });

const MedsVersionSchema = new mongoose.Schema({
  medications: [MedicationSchema],
  editedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  editedByRole: String,
  editedAt: Date
}, { _id: false });

const PrescriptionEventSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  createdByRole: String,
  createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  linkedConsultationId: { type: mongoose.Schema.Types.ObjectId, ref: 'ConsultationEvent' },
  imagePath: String,
  rawOcrText: String,
  meds: {
    current: MedsVersionSchema,
    history: [MedsVersionSchema]
  },
  status: { type: String, default: 'UNVERIFIED' } // same statuses
}, { timestamps: true });

module.exports = mongoose.models.PrescriptionEvent || mongoose.model('PrescriptionEvent', PrescriptionEventSchema);
