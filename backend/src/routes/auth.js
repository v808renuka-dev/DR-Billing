const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });
    const [rows] = await db.query('SELECT * FROM Users WHERE username=?', [username]);
    const u = rows[0];
    if (!u || u.role !== 'ADMIN' || !(await bcrypt.compare(password, u.password_hash)))
      return res.status(401).json({ message: 'Invalid username or password' });
    const token = jwt.sign({ id: u.id, username: u.username, role: u.role },
      process.env.JWT_SECRET || 'change-this-secret', { expiresIn: process.env.JWT_EXPIRES_IN || '12h' });
    res.json({ token, user: { id: u.id, username: u.username, fullName: u.full_name, role: u.role } });
  } catch (e) { next(e); }
});

// Forgot password: requires the recovery key stored in the server's .env (RECOVERY_KEY)
router.post('/reset-password', async (req, res, next) => {
  try {
    const { username, recoveryKey, newPassword } = req.body || {};
    const key = process.env.RECOVERY_KEY;
    if (!username || !recoveryKey || !newPassword) return res.status(400).json({ message: 'All fields are required' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (!key || recoveryKey !== key) return res.status(403).json({ message: 'Invalid recovery key' });
    const hash = await bcrypt.hash(newPassword, 10);
    const [r] = await db.query("UPDATE Users SET password_hash=? WHERE username=? AND role='ADMIN'", [hash, username]);
    if (!r.affectedRows) return res.status(404).json({ message: 'User not found' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
