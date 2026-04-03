const express = require('express');
const router = express.Router();
const { appointmentValidation, validate } = require('../middleware/validation');
const {
  createAppointment,
  getAllAppointments,
  getAppointment,
  updateAppointment,
  cancelAppointment
} = require('../controllers/appointmentController');

// validate MUST be between appointmentValidation and createAppointment
router.post('/', appointmentValidation, validate, createAppointment);
router.get('/', getAllAppointments);
router.get('/:id', getAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', cancelAppointment);

module.exports = router;