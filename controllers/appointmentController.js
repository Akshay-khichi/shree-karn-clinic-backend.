const Appointment = require('../models/Appointment');

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Public
const createAppointment = async (req, res) => {
  try {
    const { fullName, phoneNumber, service, appointmentDate, preferredTime, additionalDetails } = req.body;

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
      message: 'Server error while booking appointment'
    });
  }
};

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
const getAllAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = status ? { status } : {};
    
    const appointments = await Appointment.find(query)
      .sort({ createdAt: -1 })
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

// @desc    Get single appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).select('-__v');

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

// @desc    Get appointments by phone number
// @route   GET /api/appointments/phone/:phoneNumber
// @access  Public
const getAppointmentByPhone = async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    const appointments = await Appointment.find({ phoneNumber })
      .sort({ appointmentDate: -1 })
      .select('-__v');

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No appointments found for this phone number'
      });
    }

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: { appointments }
    });

  } catch (error) {
    console.error('Get Appointment by Phone Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching appointments'
    });
  }
};

// @desc    Get appointment statistics
// @route   GET /api/appointments/stats
// @access  Private
const getAppointmentStats = async (req, res) => {
  try {
    const total = await Appointment.countDocuments();
    const confirmed = await Appointment.countDocuments({ status: 'confirmed' });
    const pending = await Appointment.countDocuments({ status: 'pending' });
    const cancelled = await Appointment.countDocuments({ status: 'cancelled' });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: today, $lt: tomorrow }
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        confirmed,
        pending,
        cancelled,
        today: todayAppointments
      }
    });

  } catch (error) {
    console.error('Get Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res) => {
  try {
    const { status } = req.body;
    
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
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

// @desc    Cancel appointment (Admin delete/soft delete)
// @route   DELETE /api/appointments/:id
// @access  Private (Admin only)
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    ).select('-__v');

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

// @desc    Patient cancel appointment
// @route   PATCH /api/appointments/:id/cancel
// @access  Public
const cancelAppointmentByPatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { phoneNumber } = req.body;

    const query = { _id: id };
    if (phoneNumber) {
      query.phoneNumber = phoneNumber;
    }

    const appointment = await Appointment.findOne(query);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or phone number does not match'
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already cancelled'
      });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed appointments cannot be cancelled'
      });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: { appointment }
    });

  } catch (error) {
    console.error('Patient Cancel Appointment Error:', error);
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
  getAppointmentByPhone,
  getAppointmentStats,
  updateAppointment,
  cancelAppointment,
  cancelAppointmentByPatient
};
