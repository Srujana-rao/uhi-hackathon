const svc = require('./doctors.service');
exports.list = async (req,res) => res.json(await svc.list());
exports.get = async (req,res) => {
  const d = await svc.getById(req.params.id);
  if (!d) return res.status(404).json({ error: 'Doctor not found' });
  res.json(d);
};
exports.create = async (req,res) => res.status(201).json(await svc.create(req.body));
