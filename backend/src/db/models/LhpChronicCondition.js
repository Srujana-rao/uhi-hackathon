// backend/src/db/models/LhpChronicCondition.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const SourceSchema = new Schema({
  type: { type: String, enum: ['CONSULTATION','PRESCRIPTION','MANUAL'], required: true },
  eventId: { type: Schema.Types.ObjectId, required: true },
}, { _id: false });

const ChronicConditionSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  label: { type: String, required: true },
  notes: { type: String },
  status: { type: String, enum: ['UNVERIFIED','VERIFIED_DOCTOR','VERIFIED_STAFF','IGNORED_BY_DOCTOR'], default: 'UNVERIFIED' },
  source: { type: SourceSchema, required: true },
  createdByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LhpChronicCondition', ChronicConditionSchema);
