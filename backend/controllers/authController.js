const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: 'Username and password required' });

    const admin = await User.findOne({ username });
    if (!admin) {
      console.log('❌ User not found:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const ok = await admin.compare(password);
    if (!ok) {
      console.log('❌ Password mismatch for:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('❌ JWT_SECRET is not set in environment variables!');
      return res.status(500).json({ message: 'Server misconfiguration: JWT_SECRET missing' });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      secret,
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful:', username);
    res.json({ token, username: admin.username });

  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// One-time setup: create admin user if none exists
exports.createAdmin = async (req, res) => {
  try {
    const { setupKey, username, password } = req.body;

    // Security check - must match SETUP_KEY env variable
    if (!process.env.SETUP_KEY || setupKey !== process.env.SETUP_KEY) {
      return res.status(403).json({ message: 'Invalid setup key' });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password || 'admin123', 10);
    const user = await User.create({
      username: username || 'admin',
      password: hashed,
    });

    console.log('✅ Admin user created:', user.username);
    res.json({ message: 'Admin created successfully', username: user.username });

  } catch (error) {
    console.error('❌ Setup error:', error.message);
    res.status(500).json({ message: 'Setup failed', error: error.message });
  }
};
