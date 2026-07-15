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

// Protected routes
router.get('/', protect, getAllAppointments);
router.get('/stats', protect, getAppointmentStats);
router.get('/:id', protect, getAppointment);
router.put('/:id', protect, updateAppointment);
router.delete('/:id', protect, cancelAppointment);

//  CORRECT EXPORT
module.exports = router;
