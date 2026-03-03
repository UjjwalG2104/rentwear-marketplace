const mongoose = require('mongoose');
const User = require('../server/models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clothes-rental');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }
    
    // Create admin user
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@rentwear.com',
      password: 'admin123', // This will be hashed
      phone: '+1234567890',
      role: 'admin',
      isVerified: true
    });
    
    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@rentwear.com');
    console.log('🔑 Password: admin123');
    console.log('🌐 Login at: http://localhost:3000/login');
    console.log('📊 Admin Dashboard: http://localhost:3000/dashboard');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
