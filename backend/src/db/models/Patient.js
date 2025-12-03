// backend/src/db/models/Patient.js
const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  patientCode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number },
  gender: { type: String },
  phone: { type: String },
}, { timestamps: true });

module.exports = mongoose.models.Patient || mongoose.model('Patient', PatientSchema);
