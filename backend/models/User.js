const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
}, { timestamps: true });

// Hash password before saving (only if plain text)
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  // Avoid double hashing if already bcrypt hashed
  if (this.password.startsWith('$2')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
UserSchema.methods.compare = function (pwd) {
  return bcrypt.compare(pwd, this.password);
};

module.exports = mongoose.model('User', UserSchema);
