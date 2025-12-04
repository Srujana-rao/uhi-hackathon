// backend/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

function parseTokenFromHeader(req) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return null;
  return h.slice(7).trim();
}

/**
 * requireAuth middleware
 * - verifies JWT
 * - attaches req.user = { sub, role, name, doctorId, patientId, staffId }
 * - sends 401 on invalid/missing token
 */
function requireAuth(req, res, next) {
  try {
    const token = parseTokenFromHeader(req);
    if (!token) return res.status(401).json({ error: 'Unauthorized: no token' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // payload should contain sub, role, name, maybe doctorId/patientId/staffId
    const user = {
      sub: payload.sub,
      role: payload.role,
      name: payload.name,
      doctorId: payload.doctorId,
      patientId: payload.patientId,
      staffId: payload.staffId
    };
    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: invalid token' });
  }
}

/**
 * requireRole(roleOrArray)
 * returns middleware that ensures req.user.role === role (or included in array)
 */
function requireRole(roleOrArray) {
  const roles = Array.isArray(roleOrArray) ? roleOrArray : [roleOrArray];
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return next();
  };
}

module.exports = { requireAuth, requireRole };
