/**
 * prescriptions.controller.js
 * verify endpoint enforces:
 *  - if doctor: only the doctor assigned to the prescription can verify
 *  - if staff: staff can verify/dispense and will be recorded
 *  - admin allowed (optional)
 */
const svc = require('./prescriptions.service');

exports.list = async (req, res, next) => {
  try {
    const q = {};
    if (req.user?.role === 'doctor' && req.user.doctorId) q.doctorId = req.user.doctorId;
    if (req.user?.role === 'patient' && req.user.patientId) q.patientId = req.user.patientId;
    const data = await svc.list(q);
    return res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.get = async (req, res, next) => {
  try {
    const p = await svc.getById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Prescription not found' });
    if (req.user?.role === 'doctor' && String(p.doctorId) !== String(req.user.doctorId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (req.user?.role === 'patient' && String(p.patientId) !== String(req.user.patientId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return res.json({ success: true, data: p });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const payload = req.body || {};
    payload.createdByRole = req.user?.role || payload.createdByRole;
    payload.createdByUserId = req.user?.userId || req.user?.sub || payload.createdByUserId;
    const created = await svc.create(payload);
    return res.status(201).json({ success: true, data: created });
  } catch (err) { next(err); }
};

exports.uploadImage = async (req, res) => {
  return res.json({ message: 'image upload placeholder' });
};

/**
 * Verify prescription:
 * - doctor: only the same doctor can verify
 * - staff: can verify & record dispensing
 * - admin: allowed (optional)
 */
exports.verify = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = req.user || {};
    if (!user.role) return res.status(401).json({ error: 'Unauthorized' });

    const presc = await svc.getById(id);
    if (!presc) return res.status(404).json({ error: 'Prescription not found' });

    // Doctor ownership check
    if (user.role === 'doctor') {
      if (!user.doctorId) return res.status(400).json({ error: 'Doctor context missing' });
      if (String(presc.doctorId) !== String(user.doctorId)) {
        return res.status(403).json({ error: 'Forbidden: not your prescription' });
      }
      const updated = await svc.update(id, {
        status: 'VERIFIED_DOCTOR',
        verifiedBy: user.userId || user.sub,
        verifiedAt: new Date()
      });
      return res.json({ success: true, data: updated });
    }

    // Staff can verify/dispense
    if (user.role === 'staff') {
      const updated = await svc.update(id, {
        status: 'VERIFIED_STAFF',
        dispensedByStaffId: user.userId || user.sub,
        dispensedAt: new Date()
      });
      return res.json({ success: true, data: updated });
    }

    // Admin behavior (optional)
    if (user.role === 'admin') {
      const updated = await svc.update(id, {
        status: 'VERIFIED_ADMIN',
        verifiedBy: user.userId || user.sub,
        verifiedAt: new Date()
      });
      return res.json({ success: true, data: updated });
    }

    return res.status(403).json({ error: 'Forbidden' });

  } catch (err) {
    return next(err);
  }
};
