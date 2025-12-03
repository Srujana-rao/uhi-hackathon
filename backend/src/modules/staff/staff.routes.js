const express = require('express');
const router = express.Router();
const controller = require('./staff.controller');

// GET /api/staff
router.get('/', controller.listStaff);

// GET /api/staff/:id
router.get('/:id', controller.getStaff);

// POST /api/staff
router.post('/', controller.createStaff);

// PUT /api/staff/:id
router.put('/:id', controller.updateStaff);

// DELETE /api/staff/:id
router.delete('/:id', controller.deleteStaff);

module.exports = router;
