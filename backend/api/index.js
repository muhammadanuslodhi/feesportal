require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('../config/db');
const errorHandler = require('../middleware/errorMiddleware');

const app = express();
connectDB();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api/areas', require('../routes/areaRoutes'));
app.use('/api/students', require('../routes/studentRoutes'));
app.use('/api/fees', require('../routes/feeRoutes'));
app.use('/api/reports', require('../routes/reportRoutes'));

app.get('/', (_, res) => res.json({ ok: true, name: 'Fees Portal API' }));

app.use(errorHandler);

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
}
