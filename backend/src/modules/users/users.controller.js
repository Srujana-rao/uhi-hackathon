const service = require('./users.service');

exports.listUsers = async (req, res) => {
  const items = await service.list();
  res.json({ count: items.length, items });
};

exports.getUser = async (req, res) => {
  const item = await service.getById(req.params.id);
  if (!item) return res.status(404).json({ error: 'User not found' });
  res.json(item);
};

exports.createUser = async (req, res) => {
  const created = await service.create(req.body);
  res.status(201).json(created);
};

exports.updateUser = async (req, res) => {
  const updated = await service.update(req.params.id, req.body);
  res.json(updated);
};

exports.deleteUser = async (req, res) => {
  await service.remove(req.params.id);
  res.status(204).end();
};
