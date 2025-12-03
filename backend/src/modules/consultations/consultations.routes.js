const express = require('express');
const router = express.Router();
const ctrl = require('./consultations.controller');

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', ctrl.create);
router.post('/:id/upload-audio', ctrl.uploadAudio); // placeholder
router.put('/:id/verify', ctrl.verify);

module.exports = router;
