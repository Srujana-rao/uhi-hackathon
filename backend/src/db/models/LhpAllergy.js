// backend/src/db/models/LhpAllergy.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const AllergySchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  substance: { type: String, required: true },
  reaction: { type: String },
  severity: { type: String }, // mild/moderate/severe (optional)
  status: { type: String, enum: ['UNVERIFIED','VERIFIED_DOCTOR','VERIFIED_STAFF','IGNORED_BY_DOCTOR'], default: 'UNVERIFIED' },
  source: {
    type: { type: String, enum: ['CONSULTATION','PRESCRIPTION','MANUAL'], required: true },
    eventId: { type: Schema.Types.ObjectId, required: true }
  },
  createdByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LhpAllergy', AllergySchema);
