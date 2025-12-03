const svc = require('./consultations.service');

exports.list = async (req, res) => res.json(await svc.list());
exports.get = async (req, res) => {
  const item = await svc.getById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
};
exports.create = async (req, res) => res.status(201).json(await svc.create(req.body));
exports.uploadAudio = async (req, res) => {
  // placeholder: actual file handling via uploadMiddleware
  res.json({ message: 'audio received (placeholder)' });
};
exports.verify = async (req, res) => res.json({ message: 'verified (placeholder)' });
