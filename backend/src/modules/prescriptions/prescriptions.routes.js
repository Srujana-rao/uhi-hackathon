const express = require('express');
const router = express.Router();
const ctrl = require('./prescriptions.controller');

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', ctrl.create);
router.post('/:id/upload-image', ctrl.uploadImage);

module.exports = router;
