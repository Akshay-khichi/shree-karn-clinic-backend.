require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();

// Connect to MongoDB
connectDB();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware (simple version that works)
app.use((req, res, next) => {
  const allowedOrigin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5000',
    'https://shreekarnclinic.netlify.app',
     'https://shreekarnclinic.com',          // new 
    'https://www.shreekarnclinic.com',    // new
    process.env.FRONTEND_URL
  ].filter(Boolean);

  if (!allowedOrigin || allowedOrigins.includes(allowedOrigin) || allowedOrigin?.includes('localhost')) {
    res.header('Access-Control-Allow-Origin', allowedOrigin || '*');
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Import routes AFTER middleware setup
const appointmentRoutes = require('./routes/appointments');
const authRoutes = require('./routes/auth');

//  Register routes (these MUST be routers, not objects)
app.use('/api/appointments', appointmentRoutes);
app.use('/api/auth', authRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Shree Karn Clinic API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler (must be after all routes)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler (always last)
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});