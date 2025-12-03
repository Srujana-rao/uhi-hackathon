// backend/src/db/models/Staff.js
const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roleDescription: { type: String },
}, { timestamps: true });

module.exports = mongoose.models.Staff || mongoose.model('Staff', StaffSchema);
