const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer = null;
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  // If already connected, return cached connection
  if (cachedClient && cachedDb) {
    console.log('📦 Using cached MongoDB connection');
    return { client: cachedClient, db: cachedDb };
  }

  try {
    let mongoUri;

    // Check if using mock database for local development
    if (process.env.USE_MOCK_DB === 'true') {
      console.log('🔄 Starting in-memory MongoDB server...');
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log('✅ Mock MongoDB started (in-memory)');
    } else {
      mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
      if (!mongoUri) {
        throw new Error('MONGO_URI or MONGODB_URI not found in environment variables');
      }
    }

    // Connect to MongoDB with optimized settings for serverless
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

    const dbType = process.env.USE_MOCK_DB === 'true' ? 'Mock (In-Memory)' : 'MongoDB Atlas';
    console.log(`✅ MongoDB Connected (${dbType})`);
    
    return { client: cachedClient, db: cachedDb };
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    throw error;
  }
}

// Graceful shutdown
async function disconnectDatabase() {
  if (cachedClient) {
    await mongoose.disconnect();
    cachedClient = null;
    cachedDb = null;
  }
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
  console.log('📴 MongoDB disconnected');
}

module.exports = connectToDatabase;
module.exports.disconnect = disconnectDatabase;
module.exports.mongoServer = () => mongoServer;
