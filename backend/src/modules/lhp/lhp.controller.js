const svc = require('./lhp.service');

exports.getLhpForPatient = async (req, res) => {
  const data = await svc.getForPatient(req.params.patientId);
  res.json(data);
};

exports.createSuggestion = async (req, res) => {
  const s = await svc.createSuggestion(req.params.patientId, req.body);
  res.status(201).json(s);
};
