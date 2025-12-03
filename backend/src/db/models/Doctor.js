// backend/src/db/models/Doctor.js
const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String },
  registrationNumber: { type: String },
}, { timestamps: true });

module.exports = mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema);
