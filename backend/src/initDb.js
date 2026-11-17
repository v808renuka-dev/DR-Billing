// Creates the database, tables and seed data. Run: npm run init-db
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

(async () => {
  const dbName = process.env.DB_NAME || 'dr_billing';
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: +(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });
  let sql = fs.readFileSync(path.join(__dirname, '../sql/schema.sql'), 'utf8');
  sql = sql.replace(/dr_billing/g, dbName);
  await conn.query(sql);
  await conn.query(`USE \`${dbName}\``);

  const [u] = await conn.query('SELECT id FROM Users LIMIT 1');
  if (!u.length) {
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
    await conn.query('INSERT INTO Users (username,password_hash,full_name,role) VALUES (?,?,?,?)',
      [process.env.ADMIN_USERNAME || 'admin', hash, 'Administrator', 'ADMIN']);
    console.log('Admin user created.');
  }
  const [s] = await conn.query('SELECT id FROM ShopDetails LIMIT 1');
  if (!s.length) {
    await conn.query(
      `INSERT INTO ShopDetails (id,shop_name,app_name,address,phone,email,gst_number,invoice_footer)
       VALUES (1,'Deshpande Ropes','DR Billing','Shop address, City, State - PIN','+91 00000 00000','info@deshpanderopes.com','','Thank you for shopping with Deshpande Ropes!')`);
    console.log('Shop details seeded.');
  }
  const [c] = await conn.query('SELECT id FROM ProductCategories LIMIT 1');
  if (!c.length) {
    await conn.query(`INSERT INTO ProductCategories (name,description) VALUES
      ('Nylon Ropes','Strong nylon ropes'),('Cotton Ropes','Soft cotton ropes'),('Jute Ropes','Natural jute ropes')`);
    await conn.query(`INSERT INTO Products (category_id,name,unit,price,description) VALUES
      (1,'Nylon Rope 8mm','Meter',25,''),(2,'Cotton Rope 10mm','Meter',30,''),(3,'Jute Rope 6mm','Kg',120,'')`);
    console.log('Sample categories/products seeded.');
  }
  await conn.end();
  console.log('Database ready.');
})().catch(e => { console.error(e.message); process.exit(1); });
