// backend/src/modules/lhp/lhp.controller.js
const svc = require('./lhp.service');
const ConsultationEvent = require('../../db/models/ConsultationEvent');

exports.getLhpForPatient = async (req, res) => {
  const patientId = req.params.patientId;
  const requester = req.user || null;

  // require auth
  if (!requester) return res.status(401).json({ error: 'Unauthorized' });

  // If doctor, ensure they have consulted the patient before allowing access to full LHP
  if (requester.role === 'doctor') {
    // require doctorId is present on the token
    if (!requester.doctorId) return res.status(403).json({ error: 'Forbidden' });

    const consulted = await ConsultationEvent.findOne({
      doctorId: requester.doctorId,
      patientId
    }).lean();

    if (!consulted) {
      // deny full LHP access — but you may allow limited/basic LHP fields here if desired
      return res.status(403).json({ error: 'Doctor cannot access this LHP' });
    }
  }

  // For admin/staff/self or verified doctor, return data
  const data = await svc.getForPatient(patientId);
  res.json(data);
};

exports.createSuggestion = async (req, res) => {
  const patientId = req.params.patientId;
  const requester = req.user || null;
  if (!requester) return res.status(401).json({ error: 'Unauthorized' });

  // only doctor/staff/admin can create suggestion — doctor must be treating this patient
  if (requester.role === 'doctor') {
    if (!requester.doctorId) return res.status(403).json({ error: 'Forbidden' });
    const consulted = await ConsultationEvent.findOne({
      doctorId: requester.doctorId,
      patientId
    }).lean();
    if (!consulted) return res.status(403).json({ error: 'Doctor cannot add suggestion for this patient' });
  } else if (requester.role !== 'staff' && requester.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const s = await svc.createSuggestion(patientId, req.body);
  res.status(201).json(s);
};
