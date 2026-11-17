const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Public: needed for login screen branding
router.get('/', async (req, res, next) => {
  try {
    const [r] = await db.query('SELECT * FROM ShopDetails WHERE id=1');
    res.json(r[0] || {});
  } catch (e) { next(e); }
});

router.put('/', auth, async (req, res, next) => {
  try {
    const b = req.body || {};
    if (!b.shop_name || !b.app_name) return res.status(400).json({ message: 'Shop name and app name are required' });
    await db.query(
      `UPDATE ShopDetails SET shop_name=?, app_name=?, address=?, phone=?, email=?, gst_number=?, logo=?, invoice_footer=? WHERE id=1`,
      [b.shop_name, b.app_name, b.address || '', b.phone || '', b.email || '', b.gst_number || '', b.logo || null, b.invoice_footer || '']);
    const [r] = await db.query('SELECT * FROM ShopDetails WHERE id=1');
    res.json(r[0]);
  } catch (e) { next(e); }
});

module.exports = router;
