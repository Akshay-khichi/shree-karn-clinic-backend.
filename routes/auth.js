const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Admin = require('../models/Admin');
const { protect } = require('../middleware/auth');

const passwordRules = [
  body('password').notEmpty().withMessage('Password is required')
];

// Register route
router.post(
  '/register',
  protect,
  body('username').isLength({ min: 3 }).trim().toLowerCase(),
  ...passwordRules,
  async (req, res) => {
    try {
      // Only superadmin can create admin
      if (req.admin.role !== 'superadmin') {
        return res.status(403).json({
          success: false,
          message: 'Only superadmin can create admin accounts'
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { username, password, role } = req.body;

      // Check existing admin
      const existingAdmin = await Admin.findOne({ username });

      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Admin already exists'
        });
      }

      // Create admin
      const admin = await Admin.create({
        username,
        password,
        role: role || 'admin'
      });

      // Response
      res.status(201).json({
        success: true,
        message: 'Admin account created',
        admin: {
          id: admin._id,
          username: admin.username,
          role: admin.role
        }
      });

    } catch (error) {
      console.error('Register error:', error);

      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
);

// Login route
router.post(
  '/login',
  body('username')
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage('Username required'),

  body('password')
    .notEmpty()
    .withMessage('Password required'),

  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { username, password } = req.body;

      // Authenticate
      const admin = await Admin.findByCredentials(
        username,
        password
      );

      const token = admin.generateAuthToken();

      // Response
      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        admin: {
          id: admin._id,
          username: admin.username,
          role: admin.role
        }
      });

    } catch (error) {
      console.error('Login error:', error.message);

      res.status(401).json({
        success: false,
        message: error.message || 'Authentication failed'
      });
    }
  }
);

// Get current admin
router.get('/me', protect, async (req, res) => {

  res.status(200).json({
    success: true,
    admin: req.admin
  });

});

// Change password
router.put(
  '/change-password',
  protect,

  body('currentPassword')
    .notEmpty()
    .withMessage('Current password required'),

  ...passwordRules,

  async (req, res) => {
    try {

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { currentPassword, newPassword } = req.body;

      const admin = await Admin
        .findById(req.admin.id)
        .select('+password');

      const isMatch =
        await admin.comparePassword(currentPassword);

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password incorrect'
        });
      }

      admin.password = newPassword;

      await admin.save();

      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {

      console.error('Change password error:', error);

      res.status(500).json({
        success: false,
        message: 'Server error'
      });

    }
  }
);

module.exports = router;