// backend/src/db/models/LhpPastProcedure.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const PastProcedureSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  procedure: { type: String, required: true },
  date: { type: Date },
  notes: { type: String },
  status: { type: String, enum: ['UNVERIFIED','VERIFIED_DOCTOR','VERIFIED_STAFF','IGNORED_BY_DOCTOR'], default: 'UNVERIFIED' },
  source: {
    type: { type: String, enum: ['CONSULTATION','PRESCRIPTION','MANUAL'], required: true },
    eventId: { type: Schema.Types.ObjectId, required: true }
  },
  createdByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LhpPastProcedure', PastProcedureSchema);
