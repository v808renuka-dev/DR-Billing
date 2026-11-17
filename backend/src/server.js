require('dotenv').config();
const express = require('express');
const cors = require('cors');
const auth = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' })); // logo is stored as a data URL

app.use('/api/auth', require('./routes/auth'));
app.use('/api/shop', require('./routes/shop'));
app.use('/api/categories', auth, require('./routes/categories'));
app.use('/api/products', auth, require('./routes/products'));
app.use('/api/bills', auth, require('./routes/bills'));
app.use('/api/dashboard', auth, require('./routes/dashboard'));

app.use((req, res) => res.status(404).json({ message: 'Not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`DR Billing API running on http://localhost:${port}`));
