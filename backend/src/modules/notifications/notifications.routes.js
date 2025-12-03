const express = require('express');
const router = express.Router();
const ctrl = require('./notifications.controller');

router.get('/user/:userId', ctrl.listForUser);
router.post('/send', ctrl.sendNotification);

module.exports = router;
