// backend/src/modules/users/users.controller.js
const service = require('./users.service');

// -----------------------
// Redaction Helper
// -----------------------
function redactForRequester(targetUser, requester) {
  if (!requester) {
    return { _id: targetUser._id, role: targetUser.role, name: targetUser.name || null };
  }

  // ADMIN → full access
  if (requester.role === 'admin') return targetUser;

  // SELF → full access
  if (String(requester.sub) === String(targetUser._id)) return targetUser;

  // DOCTOR accessing PATIENT
  if (requester.role === 'doctor' && targetUser.role === 'patient') {
    return {
      _id: targetUser._id,
      role: targetUser.role,
      name: targetUser.name,
      patientId: targetUser.patientId,
      phone: targetUser.phone || null,
      gender: targetUser.gender || null,
      age: targetUser.age || null,
      createdAt: targetUser.createdAt
    };
  }

  // STAFF → very limited info
  if (requester.role === 'staff') {
    return {
      _id: targetUser._id,
      role: targetUser.role,
      name: targetUser.name || null
    };
  }

  // DEFAULT
  return { _id: targetUser._id, role: targetUser.role, name: targetUser.name };
}

// -----------------------
// LIST USERS (ADMIN ONLY)
// -----------------------
exports.listUsers = async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin only' });
  }

  const items = await service.list();
  res.json({ count: items.length, items });
};

// -----------------------
// GET USER (Role Safe)
// -----------------------
exports.getUser = async (req, res) => {
  const target = await service.getById(req.params.id);
  if (!target) return res.status(404).json({ error: 'User not found' });

  const safe = redactForRequester(target, req.user);
  return res.json(safe);
};

// -----------------------
// CREATE USER (ADMIN)
// -----------------------
exports.createUser = async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin only' });
  }

  try {
    const out = await service.create(req.body);
    res.status(201).json(out);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// -----------------------
// UPDATE USER (admin or self)
// -----------------------
exports.updateUser = async (req, res) => {
  const isSelf = req.user && String(req.user.sub) === String(req.params.id);

  if (!req.user || (req.user.role !== 'admin' && !isSelf)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const updated = await service.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// -----------------------
// DELETE USER (Admin only)
// -----------------------
exports.deleteUser = async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  await service.remove(req.params.id);
  res.status(204).end();
};
