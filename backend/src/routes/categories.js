const router = require('express').Router();
const db = require('../db');

function dup(e, res, next) {
  if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Category name already exists' });
  next(e);
}

router.get('/', async (req, res, next) => {
  try {
    const [r] = await db.query(
      `SELECT c.*, (SELECT COUNT(*) FROM Products p WHERE p.category_id=c.id) AS product_count
       FROM ProductCategories c ORDER BY c.name`);
    res.json(r);
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body || {};
    if (!name?.trim()) return res.status(400).json({ message: 'Category name is required' });
    const [r] = await db.query('INSERT INTO ProductCategories (name,description) VALUES (?,?)', [name.trim(), description || '']);
    res.status(201).json({ id: r.insertId });
  } catch (e) { dup(e, res, next); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { name, description } = req.body || {};
    if (!name?.trim()) return res.status(400).json({ message: 'Category name is required' });
    const [r] = await db.query('UPDATE ProductCategories SET name=?, description=? WHERE id=?', [name.trim(), description || '', req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ message: 'Category not found' });
    res.json({ ok: true });
  } catch (e) { dup(e, res, next); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const [c] = await db.query('SELECT COUNT(*) n FROM Products WHERE category_id=?', [req.params.id]);
    if (c[0].n) return res.status(409).json({ message: 'Cannot delete a category that has products' });
    await db.query('DELETE FROM ProductCategories WHERE id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
