const connectToDatabase = require("../lib/mongodb");

const connectDB = async () => {
  try {
    await connectToDatabase();
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
