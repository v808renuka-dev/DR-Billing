const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
  try {
    const [[p]] = await db.query('SELECT COUNT(*) n FROM Products');
    const [[c]] = await db.query('SELECT COUNT(*) n FROM ProductCategories');
    const [[all]] = await db.query('SELECT COUNT(*) n, COALESCE(SUM(total),0) revenue FROM Bills');
    const [[t]] = await db.query('SELECT COUNT(*) n, COALESCE(SUM(total),0) sales FROM Bills WHERE DATE(created_at)=CURDATE()');
    const [[m]] = await db.query(`SELECT COALESCE(SUM(total),0) sales FROM Bills
      WHERE YEAR(created_at)=YEAR(CURDATE()) AND MONTH(created_at)=MONTH(CURDATE())`);
    const [recent] = await db.query('SELECT id,bill_number,customer_name,total,created_at FROM Bills ORDER BY created_at DESC, id DESC LIMIT 6');
    const [daily] = await db.query(`SELECT DATE_FORMAT(created_at,'%Y-%m-%d') AS day, SUM(total) AS total FROM Bills
      WHERE created_at >= CURDATE() - INTERVAL 6 DAY GROUP BY day ORDER BY day`);
    res.json({
      products: p.n, categories: c.n, totalBills: all.n, totalRevenue: all.revenue,
      todayBills: t.n, todaySales: t.sales, monthSales: m.sales, recent, daily,
    });
  } catch (e) { next(e); }
});

module.exports = router;
