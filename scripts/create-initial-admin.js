require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const createInitialAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(' MongoDB connected');
    
    // Check if superadmin already exists
    const existing = await Admin.findOne({ username: process.env.INITIAL_ADMIN_USERNAME });
    if (existing) {
      console.log('  Superadmin already exists');
      console.log(`Username: ${existing.username}`);
      console.log(`Role: ${existing.role}`);
      process.exit(0);
    }
    
    // Create superadmin
    const superadmin = await Admin.create({
      username: process.env.INITIAL_ADMIN_USERNAME,
      password: process.env.INITIAL_ADMIN_PASSWORD,
      role: 'superadmin'
    });
    
    console.log(' Superadmin created successfully');
    console.log(`Username: ${superadmin.username}`);
    console.log(`Role: ${superadmin.role}`);
    console.log('\n IMPORTANT: Change this password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error(' Error creating initial admin:', error.message);
    process.exit(1);
  }
};

createInitialAdmin();