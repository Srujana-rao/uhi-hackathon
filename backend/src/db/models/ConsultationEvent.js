// backend/src/db/models/ConsultationEvent.js
const mongoose = require('mongoose');

const SoapVersionSchema = new mongoose.Schema({
  subjective: String,
  objective: String,
  assessment: String,
  plan: String,
  editedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  editedByRole: String,
  editedAt: Date
}, { _id: false });

const ConsultationEventSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  createdByRole: { type: String },
  createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  audioPath: { type: String },
  transcript: { type: String },
  soap: {
    current: SoapVersionSchema,
    history: [SoapVersionSchema]
  },
  status: { type: String, default: 'UNVERIFIED' }, // UNVERIFIED | VERIFIED_DOCTOR | VERIFIED_STAFF | IGNORED_BY_DOCTOR
  prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'PrescriptionEvent' }
}, { timestamps: true });

module.exports = mongoose.models.ConsultationEvent || mongoose.model('ConsultationEvent', ConsultationEventSchema);
