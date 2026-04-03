const Appointment = require('../models/Appointment');

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Public
const createAppointment = async (req, res) => {
  try {
    const { fullName, phoneNumber, service, appointmentDate, preferredTime, additionalDetails } = req.body;

    // Check for existing appointment at same time
    const existingAppointment = await Appointment.findOne({
      appointmentDate: new Date(appointmentDate).setHours(0, 0, 0, 0),
      preferredTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked. Please choose another time.'
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      fullName,
      phoneNumber,
      service,
      appointmentDate,
      preferredTime,
      additionalDetails
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      data: {
        id: appointment._id,
        fullName: appointment.fullName,
        service: appointment.service,
        appointmentDate: appointment.appointmentDate,
        preferredTime: appointment.preferredTime,
        status: appointment.status,
        createdAt: appointment.createdAt
      }
    });

  } catch (error) {
    console.error('Create Appointment Error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error while booking appointment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Public
const getAllAppointments = async (req, res) => {
  try {
    const { status, date, service } = req.query;
    
    const filter = {};
    
    if (status) filter.status = status;
    if (service) filter.service = service;
    if (date) {
      filter.appointmentDate = {
        $gte: new Date(date),
        $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1))
      };
    }

    const appointments = await Appointment.find(filter)
      .sort({ appointmentDate: 1, preferredTime: 1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: { appointments }
    });

  } catch (error) {
    console.error('Get Appointments Error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching appointments'
    });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Public
const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { appointment }
    });

  } catch (error) {
    console.error('Get Appointment Error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching appointment'
    });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id
// @access  Public
const updateAppointment = async (req, res) => {
  try {
    const { status } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Appointment ${status}`,
      data: { appointment }
    });

  } catch (error) {
    console.error('Update Appointment Error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating appointment'
    });
  }
};

// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Public
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: { appointment }
    });

  } catch (error) {
    console.error('Cancel Appointment Error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling appointment'
    });
  }
};

module.exports = {
  createAppointment,
  getAllAppointments,
  getAppointment,
  updateAppointment,
  cancelAppointment
};