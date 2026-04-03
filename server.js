require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const appointmentRoutes = require('./routes/appointments');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5000',
    'https://your-app.netlify.app',  // Add  Netlify URL 
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Shree Karn Clinic API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/appointments', appointmentRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV}`);
  console.log(` Frontend URL: ${process.env.FRONTEND_URL}`);
});