const router = require('express').Router();
const db = require('../db');

const round = n => Math.round((n + Number.EPSILON) * 100) / 100;

// Create bill. Totals are recalculated server-side from DB prices.
router.post('/', async (req, res, next) => {
  const { customer_name, customer_phone, items, discount_percent } = req.body || {};
  if (!Array.isArray(items) || !items.length) return res.status(400).json({ message: 'Add at least one product' });
  const disc = Number(discount_percent || 0);
  if (!(disc >= 0 && disc <= 100)) return res.status(400).json({ message: 'Discount must be between 0 and 100' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    let subtotal = 0;
    const lines = [];
    for (const it of items) {
      const qty = Number(it.quantity);
      if (!(qty > 0)) throw Object.assign(new Error('Quantity must be greater than 0'), { status: 400 });
      const [p] = await conn.query('SELECT * FROM Products WHERE id=?', [it.product_id]);
      if (!p[0]) throw Object.assign(new Error('Product not found'), { status: 400 });
      const amount = round(p[0].price * qty);
      subtotal += amount;
      lines.push([p[0].id, p[0].name, p[0].unit, p[0].price, qty, amount]);
    }
    subtotal = round(subtotal);
    const discount_amount = round(subtotal * disc / 100);
    const total = round(subtotal - discount_amount);

    const [r] = await conn.query(
      `INSERT INTO Bills (bill_number,customer_name,customer_phone,subtotal,discount_percent,discount_amount,total,created_by)
       VALUES (?,?,?,?,?,?,?,?)`,
      ['TMP-' + Date.now(), customer_name || '', customer_phone || '', subtotal, disc, discount_amount, total, req.user.id]);
    const billNo = 'DR-' + String(r.insertId).padStart(6, '0');
    await conn.query('UPDATE Bills SET bill_number=? WHERE id=?', [billNo, r.insertId]);
    await conn.query('INSERT INTO BillItems (bill_id,product_id,product_name,unit,price,quantity,amount) VALUES ?',
      [lines.map(l => [r.insertId, ...l])]);
    await conn.commit();
    res.status(201).json({ id: r.insertId, bill_number: billNo, total });
  } catch (e) {
    await conn.rollback();
    if (e.status) return res.status(e.status).json({ message: e.message });
    next(e);
  } finally { conn.release(); }
});

// List / report with optional date range (YYYY-MM-DD) and search
router.get('/', async (req, res, next) => {
  try {
    const params = [];
    let where = '';
    if (req.query.from) { where += ' AND DATE(created_at) >= ?'; params.push(req.query.from); }
    if (req.query.to) { where += ' AND DATE(created_at) <= ?'; params.push(req.query.to); }
    if (req.query.search) {
      where += ' AND (bill_number LIKE ? OR customer_name LIKE ?)';
      params.push(`%${req.query.search}%`, `%${req.query.search}%`);
    }
    const [bills] = await db.query(`SELECT * FROM Bills WHERE 1=1${where} ORDER BY created_at DESC, id DESC`, params);
    const summary = {
      count: bills.length,
      subtotal: round(bills.reduce((s, b) => s + b.subtotal, 0)),
      discount: round(bills.reduce((s, b) => s + b.discount_amount, 0)),
      total: round(bills.reduce((s, b) => s + b.total, 0)),
    };
    res.json({ bills, summary });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [b] = await db.query('SELECT * FROM Bills WHERE id=?', [req.params.id]);
    if (!b[0]) return res.status(404).json({ message: 'Bill not found' });
    const [items] = await db.query('SELECT * FROM BillItems WHERE bill_id=? ORDER BY id', [req.params.id]);
    res.json({ ...b[0], items });
  } catch (e) { next(e); }
});

module.exports = router;
