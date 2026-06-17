require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('../config/db');
const errorHandler = require('../middleware/errorMiddleware');

const app = express();

// Trust proxy (important for Vercel)
app.set('trust proxy', 1);

// Call connectDB after setting trust proxy
connectDB();

// Build allowed origins list - with fallback for production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://feesportal.vercel.app',
  process.env.FRONTEND_URL
].map(url => url?.trim().replace(/\/$/, '')).filter(Boolean);

console.log('✅ CORS Allowed Origins:', allowedOrigins);

// Enhanced CORS configuration for Vercel production
const corsOptions = {
  origin: function (origin, callback) {
    // Log for debugging
    if (!origin) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      return callback(null, true);
    }

    const isAllowed = allowedOrigins.includes(origin);
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn('🚫 CORS rejected origin:', origin);
      console.warn('Allowed origins:', allowedOrigins);
      callback(new Error('CORS not allowed'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-JSON-Response'],
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Body parser middleware
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
