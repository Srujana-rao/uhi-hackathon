// backend/src/modules/users/users.service.js
const User = require('../../db/models/User');
const bcrypt = require('bcryptjs');

exports.list = async () => {
  return await User.find({}, '-passwordHash').lean();
};

exports.getById = async (id) => {
  return await User.findById(id, '-passwordHash').lean();
};

exports.create = async (data) => {
  // data should include email, role, password (plain) optional name and refs
  if (!data.email || !data.password) {
    throw new Error('email and password are required');
  }

  const existing = await User.findOne({ email });
  if (existing) throw new Error('email already exists');

  const passwordHash = await bcrypt.hash(data.password, 10);
  const doc = {
    email: data.email,
    passwordHash,
    role: data.role || 'patient',
    name: data.name || '',
    doctorId: data.doctorId || undefined,
    patientId: data.patientId || undefined,
    staffId: data.staffId || undefined
  };

  const created = await User.create(doc);
  const out = created.toObject();
  delete out.passwordHash;
  return out;
};

exports.update = async (id, data) => {
  if (data.password) {
    data.passwordHash = await bcrypt.hash(data.password, 10);
    delete data.password;
  }
  const updated = await User.findByIdAndUpdate(id, data, { new: true, select: '-passwordHash' }).lean();
  return updated;
};

exports.remove = async (id) => {
  await User.findByIdAndDelete(id);
  return;
};
