const jwt = require('jsonwebtoken');
const { getDB } = require('../config/db');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const usersCollection = getDB().collection('users');
    
    const user = await usersCollection.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password' });
    
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.register = async (req, res) => {
  try {
    const { email, password, role = 'user' } = req.body;
    const usersCollection = getDB().collection('users');
    
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const result = await usersCollection.insertOne({
      email,
      password: hashedPassword,
      role,
      createdAt: new Date()
    });
    
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.createAdminIfNotExists = async () => {
  try {
    const usersCollection = getDB().collection('users');
    const adminUser = await usersCollection.findOne({ role: 'admin' });
    
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await usersCollection.insertOne({
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date()
      });
      
      console.log('Default admin user created');
    }
  } catch (err) {
    console.error('Failed to create admin user:', err);
  }
};