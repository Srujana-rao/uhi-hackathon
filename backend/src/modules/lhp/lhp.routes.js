const express = require('express');
const router = express.Router();
const ctrl = require('./lhp.controller');

router.get('/patient/:patientId', ctrl.getLhpForPatient);
router.post('/patient/:patientId/suggestions', ctrl.createSuggestion);

module.exports = router;
