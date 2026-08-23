const express = require('express');
const router = express.Router();

const {
  createAppointment,
  getAllAppointments,
  getAppointment,
  getAppointmentByPhone,
  getAppointmentStats,
  updateAppointment,
  cancelAppointment
} = require('../controllers/appointmentController');

const { appointmentValidation, validate } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/', appointmentValidation, validate, createAppointment);
router.get('/phone/:phoneNumber', getAppointmentByPhone);
router.delete('/:id', cancelAppointment);

// Protected routes (Admin only)
router.get('/', protect, getAllAppointments);
router.get('/stats', protect, getAppointmentStats);
router.get('/:id', protect, getAppointment);
router.put('/:id', protect, updateAppointment);

//  CORRECT EXPORT
module.exports = router;
