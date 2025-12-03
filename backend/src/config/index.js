// backend/src/config/index.js
require('dotenv').config();

module.exports = {
  mongoUri: process.env.MONGO_URI || process.env.MONGOURL || null,
  frontEndUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
};
