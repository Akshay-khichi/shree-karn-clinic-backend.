const { body, validationResult } = require('express-validator');

// Validation rules for appointment booking
const appointmentValidation = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  
  body('phoneNumber')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[\d\s-]{10,15}$/).withMessage('Please enter a valid phone number'),
  
  body('service')
    .trim()
    .notEmpty().withMessage('Service selection is required')
    .isIn([
      'GENERAL CHECKUP',
      'VIDEO X-RAY',
      'ECG TESTING',
      'MATERNITY / DELIVERY CHECKUP',
      'OPD',
      'USG',
      'LAB DIAGNOSTICS',
      'PHARMACY',
      'AMBULANCE SERVICE',
      'OTHER'
    ]).withMessage('Invalid service selection'),
  
  body('appointmentDate')
    .notEmpty().withMessage('Appointment date is required')
    .isISO8601().withMessage('Invalid date format')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Appointment date cannot be in the past');
      }
      return true;
    }),
  
  body('preferredTime')
    .trim()
    .notEmpty().withMessage('Preferred time is required')
    .isIn([
      '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
    ]).withMessage('Invalid time selection'),
  
  body('additionalDetails')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Details cannot exceed 500 characters')
];

//  VALIDATION ERROR HANDLER - MUST HAVE next()
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
 
  next();
};

module.exports = { appointmentValidation, validate };