// backend/src/db/models/LhpCurrentMedication.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const MedicationSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  name: { type: String, required: true },
  dosage: { type: String },
  frequency: { type: String },
  route: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  isCurrent: { type: Boolean, default: true },
  status: { type: String, enum: ['UNVERIFIED','VERIFIED_DOCTOR','VERIFIED_STAFF','IGNORED_BY_DOCTOR'], default: 'UNVERIFIED' },
  source: {
    type: { type: String, enum: ['CONSULTATION','PRESCRIPTION','MANUAL'], required: true },
    eventId: { type: Schema.Types.ObjectId, required: true }
  },
  createdByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LhpCurrentMedication', MedicationSchema);
