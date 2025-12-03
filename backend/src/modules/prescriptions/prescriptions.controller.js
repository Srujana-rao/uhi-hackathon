const svc = require('./prescriptions.service');
exports.list = async (req,res) => res.json(await svc.list());
exports.get = async (req,res) => {
  const p = await svc.getById(req.params.id);
  if (!p) return res.status(404).json({ error: 'Prescription not found' });
  res.json(p);
};
exports.create = async (req,res) => res.status(201).json(await svc.create(req.body));
exports.uploadImage = async (req,res) => res.json({ message: 'image upload placeholder' });
