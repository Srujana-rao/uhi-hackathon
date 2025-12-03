const express = require('express');
const router = express.Router();
const { adminLogin, login } = require('./auth.controller');

router.post('/login', login);

// export
module.exports = router;
