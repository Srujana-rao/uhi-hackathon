// backend/src/middleware/errorHandler.js
// Central error handler middleware for Express

function errorHandler(err, req, res, next) {
  // log to console for dev
  console.error('✖ errorHandler:', err && err.stack ? err.stack : err);

  // if headers already sent, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  const status = err && err.status ? err.status : 500;
  const message = err && err.message ? err.message : 'Internal Server Error';

  // minimal error payload; expand as needed for debugging (but avoid leaking secrets)
  res.status(status).json({
    error: message,
    // include stack only in development
    ...(process.env.NODE_ENV === 'development' ? { stack: err && err.stack } : {})
  });
}

module.exports = { errorHandler };
