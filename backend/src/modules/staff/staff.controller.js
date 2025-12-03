const service = require('./staff.service');

exports.listStaff = async (req, res) => {
  const items = await service.list();
  res.json({ count: items.length, items });
};

exports.getStaff = async (req, res) => {
  const item = await service.getById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Staff not found' });
  res.json(item);
};

exports.createStaff = async (req, res) => {
  const created = await service.create(req.body);
  res.status(201).json(created);
};

exports.updateStaff = async (req, res) => {
  const updated = await service.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Staff not found' });
  res.json(updated);
};

exports.deleteStaff = async (req, res) => {
  await service.remove(req.params.id);
  res.status(204).end();
};
