const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || 'change-this-secret');
    if (user.role !== 'ADMIN') return res.status(403).json({ message: 'Admin access only' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
