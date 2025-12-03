const svc = require('./patients.service');
exports.list = async (req,res) => res.json(await svc.list());
exports.get = async (req,res) => {
  const p = await svc.getById(req.params.id);
  if (!p) return res.status(404).json({ error: 'Patient not found' });
  res.json(p);
};
exports.create = async (req,res) => res.status(201).json(await svc.create(req.body));
