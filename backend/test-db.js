require('dotenv').config();
const mongoose = require('mongoose');

async function testMongoConnection() {
  try {
    console.log('🔍 Testing MongoDB Atlas connection...\n');
    console.log('Connection String:', process.env.MONGO_URI ? '✓ Found' : '✗ Not found');
    
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI not defined in .env file');
      process.exit(1);
    }

    const startTime = Date.now();
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      w: 'majority',
      appName: 'feesportal-test'
    });

    const connectionTime = Date.now() - startTime;

    console.log('\n✅ Connected to MongoDB Atlas!\n');
    console.log('Connection Details:');
    console.log('- Host:', conn.connection.host);
    console.log('- Port:', conn.connection.port);
    console.log('- Database:', conn.connection.name);
    console.log('- Connection Time:', connectionTime + 'ms');
    console.log('- Ready State:', conn.connection.readyState === 1 ? '✓ Connected' : '✗ Not connected');

    // Test basic operation
    console.log('\n🧪 Testing basic operations...');
    const db = conn.connection.db;
    const adminStatus = await db.admin().ping();
    console.log('- Ping:', adminStatus.ok === 1 ? '✓ Success' : '✗ Failed');

    // List collections
    const collections = await db.listCollections().toArray();
    console.log('- Collections found:', collections.length);
    if (collections.length > 0) {
      console.log('  Collections:', collections.map(c => c.name).join(', '));
    }

    console.log('\n🎉 MongoDB Atlas is properly connected and working!\n');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection Failed!\n');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Verify MONGO_URI in .env file is correct');
    console.error('2. Check MongoDB Atlas IP whitelist includes your IP');
    console.error('3. Ensure database user credentials are correct');
    console.error('4. Check network connectivity to MongoDB servers');
    process.exit(1);
  }
}

testMongoConnection();
