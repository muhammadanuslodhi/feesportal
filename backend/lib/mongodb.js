const mongoose = require('mongoose');

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  // Return cached connection if already connected
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('No MongoDB URI provided. Set MONGODB_URI environment variable.');
  }

  console.log('🔄 Connecting to MongoDB Atlas...');
  const client = await mongoose.connect(mongoUri, {
    maxPoolSize: 10,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 5000,
    maxIdleTimeMS: 30000,
    retryWrites: true,
    w: 'majority',
    appName: 'feesportal-api'
  });

  cachedClient = client;
  cachedDb = client.connection;
  console.log('✅ MongoDB Connected');
  return { client: cachedClient, db: cachedDb };
}

module.exports = connectToDatabase;
