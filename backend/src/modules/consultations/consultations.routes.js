const express = require('express');
const router = express.Router();
const ctrl = require('./consultations.controller');
const { requireAuth } = require('../../middleware/authMiddleware');
const { uploadAudio } = require('../../middleware/uploadMiddleware');

// Protect all consultation endpoints
router.use(requireAuth);

// List consultations (role-filtered in controller)
router.get('/', ctrl.list);

// Get consultation by id
router.get('/:id', ctrl.getById);

// Create consultation
router.post('/', ctrl.create);

// Generic partial update (audioPath, transcript, flat SOAP, etc.)
router.patch('/:id', ctrl.update);

// Verify consultation (doctor action, with SOAP history)
router.put('/:id/verify', ctrl.verifySoap);

// Upload audio for consultation
router.post('/:id/upload-audio', uploadAudio, ctrl.uploadAudio);

module.exports = router;
