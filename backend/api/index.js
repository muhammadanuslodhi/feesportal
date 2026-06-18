require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('../middleware/errorMiddleware');

const app = express();

// Trust proxy (important for Vercel)
app.set('trust proxy', 1);

// Database connection
let dbConnected = false;
let dbConnecting = false;
const connectToDatabase = require('../lib/mongodb');

const ensureDbConnection = async () => {
  if (dbConnected) return true;

  if (dbConnecting) {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (dbConnected) {
          clearInterval(checkInterval);
          resolve(true);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Database connection timeout'));
      }, 10000);
    });
  }

  dbConnecting = true;
  try {
    await connectToDatabase();
    dbConnected = true;
    dbConnecting = false;
    console.log('✅ Database connected');
    return true;
  } catch (error) {
    console.warn('⚠️  Database connection failed:', error.message);
    dbConnecting = false;
    return false;
  }
};

// Attempt DB connection on requests (except health/root)
app.use(async (req, res, next) => {
  if (req.path === '/' || req.path === '/health') {
    return next();
  }
  if (!dbConnected && !dbConnecting) {
    await ensureDbConnection().catch(() => {});
  }
  next();
});

// CORS - allow all Vercel URLs + localhost
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean).map(url => url.trim().replace(/\/$/, ''));

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    // Allow any vercel.app subdomain dynamically
    const isVercel = /^https:\/\/.*\.vercel\.app$/.test(origin);
    const isAllowed = allowedOrigins.includes(origin) || isVercel;
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn('🚫 CORS rejected origin:', origin);
      callback(new Error('CORS not allowed'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body parser
app.use(express.json({ limit: '10mb' }));

// NOTE: /uploads static files will NOT work on Vercel (serverless = no persistent disk)
// Remove or skip this in production
if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    database: dbConnected ? 'connected' : 'not connected',
    timestamp: new Date().toISOString()
  });
});

// Root
app.get('/', (req, res) => {
  res.json({
    ok: true,
    name: 'Fees Portal API',
    database: dbConnected ? 'connected' : 'connecting',
    time: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api/areas', require('../routes/areaRoutes'));
app.use('/api/students', require('../routes/studentRoutes'));
app.use('/api/fees', require('../routes/feeRoutes'));
app.use('/api/reports', require('../routes/reportRoutes'));

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
