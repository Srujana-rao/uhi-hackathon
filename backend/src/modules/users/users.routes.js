// backend/src/modules/users/users.routes.js
const express = require('express');
const router = express.Router();
const controller = require('./users.controller');
const { requireAuth } = require('../../middleware/authMiddleware');
// const { requireRole } = require('../../middleware/roleMiddleware'); // optionally used elsewhere

router.use(requireAuth); // ensure all user routes are authenticated

router.get('/', controller.listUsers); // admin only inside controller
router.get('/:id', controller.getUser);
router.post('/', controller.createUser); // protected in controller (admin)
router.put('/:id', controller.updateUser);
router.delete('/:id', controller.deleteUser);

module.exports = router;
