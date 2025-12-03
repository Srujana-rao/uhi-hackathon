const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static uploads (serve for demo)
app.use('/uploads', express.static('src/uploads'));

app.use('/api', routes);

// error handler last
app.use(errorHandler);

module.exports = app;
