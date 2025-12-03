const svc = require('./timeline.service');

exports.getTimelineForPatient = async (req, res) => {
  const t = await svc.getForPatient(req.params.patientId);
  res.json(t);
};
