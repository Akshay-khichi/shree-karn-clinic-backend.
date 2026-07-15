const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Never return password in queries
  },
  role: {
    type: String,
    enum: ['superadmin', 'admin', 'receptionist'],
    default: 'admin'
  },
  lastLogin: {
    type: Date,
    default: null
  },
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  lockedUntil: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT
adminSchema.methods.generateAuthToken = function() {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: this._id, username: this.username, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Static method to find admin and check lockout
adminSchema.statics.findByCredentials = async function(username, password) {
  const Admin = this;
  
  // Find admin with password included (since we set select: false)
  const admin = await Admin.findOne({ username }).select('+password');
  
  if (!admin) {
    throw new Error('Invalid credentials');
  }
  
  // Check if account is locked
  if (admin.lockedUntil && admin.lockedUntil > new Date()) {
    const minutes = Math.ceil((admin.lockedUntil - new Date()) / 60000);
    throw new Error(`Account locked. Try again in ${minutes} minute(s)`);
  }
  
  // Verify password
  const isMatch = await admin.comparePassword(password);
  
  if (!isMatch) {
    // Increment failed attempts
    admin.failedLoginAttempts += 1;
    
    // Lock account after 5 failed attempts for 15 minutes
    if (admin.failedLoginAttempts >= 5) {
      admin.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    
    await admin.save();
    throw new Error('Invalid credentials');
  }
  
  // Reset failed attempts on successful login
  admin.failedLoginAttempts = 0;
  admin.lockedUntil = null;
  admin.lastLogin = new Date();
  await admin.save();
  
  return admin;
};

module.exports = mongoose.model('Admin', adminSchema);