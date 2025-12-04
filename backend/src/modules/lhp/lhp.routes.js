// backend/src/modules/lhp/lhp.routes.js
const express = require('express');
const router = express.Router();
const controller = require('./lhp.controller');
const { requireAuth } = require('../../middleware/authMiddleware');

router.get('/:patientId', requireAuth, controller.getLhpForPatient);
router.post('/:patientId/suggestions', requireAuth, controller.createSuggestion);

module.exports = router;
