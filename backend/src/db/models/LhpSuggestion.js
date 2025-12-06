// backend/src/db/models/LhpSuggestion.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const LhpSuggestionSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor' }, // who should verify
  sourceType: { type: String, enum: ['CONSULTATION','PRESCRIPTION'], required: true },
  sourceEventId: { type: Schema.Types.ObjectId, required: true },
  section: { type: String, enum: ['ALLERGY','CHRONIC_CONDITION','CURRENT_MED','PAST_PROCEDURE'], required: true },
  proposedEntry: { type: Schema.Types.Mixed, required: true }, // flexible
  status: { type: String, enum: ['PENDING','ACCEPTED','REJECTED'], default: 'PENDING' },
  actedByDoctorId: { type: Schema.Types.ObjectId, ref: 'User' },
  actedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LhpSuggestion', LhpSuggestionSchema);
