require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('../middleware/errorMiddleware');

const app = express();

// Trust proxy (important for Vercel)
app.set('trust proxy', 1);

// Database connection flag
let dbConnected = false;
let dbConnecting = false;
const connectToDatabase = require('../lib/mongodb');

// Lazy database connection on first request (not on startup)
const ensureDbConnection = async () => {
  if (dbConnected) return true;
  
  if (dbConnecting) {
    // Already trying to connect, wait for it
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
    console.log('✅ Database connected on first request');
    return true;
  } catch (error) {
    console.warn('⚠️  Database connection failed:', error.message);
    dbConnecting = false;
    return false; // Fail gracefully, allow requests to continue
  }
};

// Middleware to attempt connection if not already done
app.use(async (req, res, next) => {
  // Don't block health check endpoints
  if (req.path === '/' || req.path === '/health') {
    return next();
  }
  
  // Try to connect to DB, but don't fail if it doesn't work
  if (!dbConnected && !dbConnecting) {
    await ensureDbConnection().catch(err => {
      console.warn('Database connection attempt failed for:', req.path);
    });
  }
  
  next();
});

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

// Health check endpoint (doesn't require DB)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    environment: process.env.NODE_ENV,
    database: dbConnected ? 'connected' : 'connecting or not connected',
    timestamp: new Date().toISOString()
  });
});

// Original root endpoint
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

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`\n🚀 Fees Portal API running on http://localhost:${PORT}\n`);
    console.log('📝 API Documentation:');
    console.log(`   - Health: GET  /health`);
    console.log(`   - Auth:   POST /api/auth/login`);
    console.log(`   - Areas:  GET  /api/areas`);
    console.log(`   - Students: GET /api/students`);
    console.log(`   - Fees:   GET  /api/fees`);
    console.log(`   - Reports: GET /api/reports\n`);
  });
}
