const mongoose = require('mongoose');
const mockDatabase = require('./mock-db');

let cachedClient = null;
let cachedDb = null;
let isMockMode = false;

async function connectToDatabase() {
  // If already connected, return cached connection
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    // Use mock database if explicitly requested or if no URI provided
    if (process.env.USE_MOCK_DB === 'true' || !mongoUri) {
      console.log('🔄 Starting mock in-memory database...');
      isMockMode = true;
      await mockDatabase.connect();
      cachedClient = mockDatabase;
      cachedDb = mockDatabase;
      console.log('✅ Mock Database Ready (no external connection needed)');
      return { client: cachedClient, db: cachedDb };
    }

    // Try to connect to MongoDB Atlas
    console.log('🔄 Connecting to MongoDB Atlas...');
    const client = await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      w: 'majority',
      appName: 'feesportal-api'
    });

    cachedClient = client;
    cachedDb = client.connection;

    console.log('✅ MongoDB Connected (MongoDB Atlas)');
    return { client: cachedClient, db: cachedDb };
  } catch (error) {
    console.warn('⚠️  MongoDB Atlas connection failed:', error.message);
    console.log('💡 Falling back to mock database for local development...\n');
    
    isMockMode = true;
    await mockDatabase.connect();
    cachedClient = mockDatabase;
    cachedDb = mockDatabase;
    
    return { client: cachedClient, db: cachedDb };
  }
}

// Graceful shutdown
async function disconnectDatabase() {
  if (isMockMode) {
    await mockDatabase.disconnect();
  } else if (cachedClient) {
    await require('mongoose').disconnect();
  }
  cachedClient = null;
  cachedDb = null;
}

module.exports = connectToDatabase;
module.exports.disconnect = disconnectDatabase;
module.exports.isMockMode = () => isMockMode;
