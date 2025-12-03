const svc = require('./notifications.service');

exports.listForUser = async (req, res) => res.json(await svc.listForUser(req.params.userId));
exports.sendNotification = async (req, res) => res.json(await svc.send(req.body));
