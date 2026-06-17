const mongoose = require('mongoose');

// Create a cached connection to MongoDB
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  // If already connected, return cached connection
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    // Connect to MongoDB with optimized settings for serverless
    const client = await mongoose.connect(process.env.MONGO_URI, {
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

    console.log('MongoDB Connected Successfully');
    return { client: cachedClient, db: cachedDb };
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    throw error;
  }
}

module.exports = connectToDatabase;
