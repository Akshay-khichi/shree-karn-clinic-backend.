const express = require('express');
const router = express.Router();

const {
  createAppointment,
  getAllAppointments,
  getAppointment,
  getAppointmentByPhone,
  getAppointmentStats,
  updateAppointment,
  cancelAppointment,
  cancelAppointmentByPatient
} = require('../controllers/appointmentController');

const { appointmentValidation, validate } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

// ==========================================
// Public routes
// ==========================================
router.post('/', appointmentValidation, validate, createAppointment);
router.get('/phone/:phoneNumber', getAppointmentByPhone);
router.patch('/:id/cancel', cancelAppointmentByPatient);

// ==========================================
// Protected routes (Admin only)
// Note: Specific routes like /stats must be defined before generic /:id
// ==========================================
router.get('/stats', protect, getAppointmentStats);
router.get('/', protect, getAllAppointments);
router.get('/:id', protect, getAppointment);
router.put('/:id', protect, updateAppointment);
router.delete('/:id', protect, cancelAppointment);

//  CORRECT EXPORT
module.exports = router;
