const express = require('express');
const router = express.Router();
const ctrl = require('./timeline.controller');

router.get('/patient/:patientId', ctrl.getTimelineForPatient);

module.exports = router;
