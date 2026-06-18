const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Check if we're in mock mode
if (process.env.USE_MOCK_DB === 'true') {
  // Return mock User class instead of Mongoose model
  const MockUser = require('../lib/mock-db').User;
  module.exports = MockUser;
} else {
  // Normal Mongoose model
  const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
  }, { timestamps: true });

  UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  });

  UserSchema.methods.compare = function (pwd) {
    return bcrypt.compare(pwd, this.password);
  };

  module.exports = mongoose.model('User', UserSchema);
}
