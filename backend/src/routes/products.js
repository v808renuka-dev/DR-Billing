const router = require('express').Router();
const db = require('../db');

const SELECT = `SELECT p.*, c.name AS category_name FROM Products p JOIN ProductCategories c ON c.id=p.category_id`;

router.get('/', async (req, res, next) => {
  try {
    const params = [];
    let where = '';
    if (req.query.categoryId) { where += ' AND p.category_id=?'; params.push(req.query.categoryId); }
    if (req.query.search) { where += ' AND p.name LIKE ?'; params.push(`%${req.query.search}%`); }
    const [r] = await db.query(`${SELECT} WHERE 1=1${where} ORDER BY p.name`, params);
    res.json(r);
  } catch (e) { next(e); }
});

function validate(b) {
  if (!b.name?.trim()) return 'Product name is required';
  if (!b.category_id) return 'Category is required';
  if (b.price === '' || b.price == null || !(Number(b.price) >= 0)) return 'A valid price is required';
  return null;
}

router.post('/', async (req, res, next) => {
  try {
    const b = req.body || {};
    const err = validate(b);
    if (err) return res.status(400).json({ message: err });
    const [r] = await db.query('INSERT INTO Products (category_id,name,unit,price,description) VALUES (?,?,?,?,?)',
      [b.category_id, b.name.trim(), b.unit || 'Piece', b.price, b.description || '']);
    res.status(201).json({ id: r.insertId });
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const b = req.body || {};
    const err = validate(b);
    if (err) return res.status(400).json({ message: err });
    const [r] = await db.query('UPDATE Products SET category_id=?, name=?, unit=?, price=?, description=? WHERE id=?',
      [b.category_id, b.name.trim(), b.unit || 'Piece', b.price, b.description || '', req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ message: 'Product not found' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// Past bills keep their own copy of name/price, so deleting is safe (product_id becomes NULL).
router.delete('/:id', async (req, res, next) => {
  try {
    await db.query('DELETE FROM Products WHERE id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
