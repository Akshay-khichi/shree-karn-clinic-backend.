const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+?[\d\s-]{10,15}$/, 'Please enter a valid phone number']
  },
  service: {
    type: String,
    required: [true, 'Service selection is required'],
    enum: [
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
    ]
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required'],
    validate: {
      validator: function(value) {
        return value >= new Date();
      },
      message: 'Appointment date cannot be in the past'
    }
  },
  preferredTime: {
    type: String,
    required: [true, 'Preferred time is required'],
    enum: [
      '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
      '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
    ]
  },
  additionalDetails: {
    type: String,
    trim: true,
    maxlength: [500, 'Details cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
appointmentSchema.index({ appointmentDate: 1, preferredTime: 1 });

// Pre-save middleware to send confirmation
appointmentSchema.pre('save', async function(next) {
  if (this.isNew) {
    console.log(`New appointment booked: ${this.fullName} - ${this.appointmentDate}`);    
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);