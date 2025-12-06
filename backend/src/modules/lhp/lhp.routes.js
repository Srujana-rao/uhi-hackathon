// backend/src/modules/lhp/lhp.routes.js
const express = require('express');
const router = express.Router();
const controller = require('./lhp.controller');

const { requireAuth } = require('../../middleware/authMiddleware');
const { requireRole } = require('../../middleware/roleMiddleware');

// Get full LHP for a patient
router.get('/:patientId', requireAuth, controller.getLhp);

// List suggestions for current doctor
router.get(
  '/suggestions/list',
  requireAuth,
  requireRole(['doctor']),
  controller.listSuggestions
);

// Create suggestion (AI/backend/manual)
router.post(
  '/suggestions',
  requireAuth,
  controller.createSuggestion
);

// Doctor acts on suggestion (accept / reject)
router.post(
  '/suggestions/:id/action',
  requireAuth,
  requireRole(['doctor']),
  controller.actOnSuggestion
);

module.exports = router;
