const express = require('express');
const router = express.Router();
const controller = require('./users.controller');
const { requireRole } = require('../../middleware/roleMiddleware'); // adjust path if needed

router.get('/', controller.listUsers);
router.get('/:id', controller.getUser);
router.post('/', requireRole('admin'), controller.createUser); // <-- protect create
router.put('/:id', controller.updateUser);
router.delete('/:id', controller.deleteUser);

module.exports = router;
