// backend/src/db/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  // INCLUDE 'admin' here so we can have admin users
  role: { type: String, enum: ['admin', 'doctor', 'patient', 'staff'], required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  name: { type: String }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
