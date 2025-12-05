const express = require('express');
const router = express.Router();
const prescriptionsController = require('./prescriptions.controller');
const { requireAuth, requireRole } = require('../../middleware/authMiddleware');

// requireAuth should decode JWT and attach req.user
router.use(requireAuth);

// list
router.get('/', prescriptionsController.list);

// create
router.post('/', prescriptionsController.create);

// verify (staff/doctor)
router.patch('/:id/verify', requireRole(['doctor','staff']), prescriptionsController.verify);

// get
router.get('/:id', prescriptionsController.get);

module.exports = router;
