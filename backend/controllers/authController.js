const jwt = require('jsonwebtoken');
const User = require('../models/User');

const Admin = User;

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password required' });
    
    const admin = await Admin.findOne({ username });
    if (!admin) {
      console.log('❌ User not found:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const ok = await admin.compare(password);
    if (!ok) {
      console.log('❌ Password mismatch for user:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: admin._id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' });
    console.log('✅ Login successful:', username);
    res.json({ token, username: admin.username });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
