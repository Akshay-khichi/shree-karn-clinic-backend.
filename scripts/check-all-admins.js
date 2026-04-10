require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

async function checkAllAdmins() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
    console.log(`Database: ${mongoose.connection.name}`);
    
    const admins = await Admin.find({}).select('username role createdAt');
    
    console.log(`\n📊 Total admins found: ${admins.length}`);
    
    if (admins.length === 0) {
      console.log('❌ NO ADMINS IN DATABASE');
    } else {
      console.log('\n=== All Admins ===');
      admins.forEach((admin, i) => {
        console.log(`${i + 1}. Username: "${admin.username}"`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Created: ${admin.createdAt}`);
      });
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAllAdmins();
