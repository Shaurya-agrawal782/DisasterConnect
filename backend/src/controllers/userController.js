const User = require('../models/User');
const Incident = require('../models/Incident');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all responders
// @route   GET /api/users/responders
// @access  Private (Admin only)
const getResponders = asyncHandler(async (req, res, next) => {
  const query = { role: 'responder' };
  
  // If not explicitly requesting all, filter by active & verified only (e.g. for assignment)
  if (req.query.all !== 'true') {
    query.isActive = true;
    query.$or = [
      { 'responderProfile.verificationStatus': 'verified' },
      { responderProfile: { $exists: false } },
      { 'responderProfile.verificationStatus': { $exists: false } }
    ];
  }

  const responders = await User.find(query)
    .select('name email phone role isActive responderProfile createdAt updatedAt')
    .sort('-createdAt');

  res.status(200).json(
    new ApiResponse(200, { responders }, 'Responders retrieved successfully')
  );
});

// @desc    Create a new responder account
// @route   POST /api/users/responders
// @access  Private (Admin only)
const createResponder = asyncHandler(async (req, res, next) => {
  const { 
    name, 
    email, 
    password, 
    phone,
    responderId,
    department,
    specialization,
    serviceZone,
    shift,
    emergencyContactName,
    emergencyContactPhone,
    certifications,
    adminNotes
  } = req.body;

  // Enforce required fields validation
  if (!name || !email || !password || !phone || !responderId || !department || !specialization || !serviceZone) {
    return next(new AppError(400, 'Please provide all required fields: Name, Email, Password, Phone, Responder ID, Department, Specialization, and Service Zone.'));
  }

  // Prevent duplicate email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError(400, 'An account with this email address already exists.'));
  }

  // Build the responder profile subdocument
  const responderProfile = {
    responderId,
    phone,
    department,
    specialization,
    serviceZone,
    shift: shift || '',
    emergencyContactName: emergencyContactName || '',
    emergencyContactPhone: emergencyContactPhone || '',
    verificationStatus: 'verified',
    certifications: typeof certifications === 'string'
      ? certifications.split(',').map(c => c.trim()).filter(Boolean)
      : (Array.isArray(certifications) ? certifications : []),
    adminNotes: adminNotes || '',
    verifiedAt: new Date(),
    verifiedBy: req.user._id
  };

  // Create and save responder
  const responder = await User.create({
    name,
    email,
    password,
    phone,
    role: 'responder',
    isActive: true,
    createdBy: req.user._id,
    responderProfile
  });

  const responderResponse = responder.toObject();
  delete responderResponse.password;

  res.status(201).json(
    new ApiResponse(201, { responder: responderResponse }, 'Responder created successfully')
  );
});

// @desc    Update a responder's active status
// @route   PATCH /api/users/responders/:id/status
// @access  Private (Admin only)
const updateResponderStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { isActive } = req.body;

  if (isActive === undefined) {
    return next(new AppError(400, 'Please provide isActive status.'));
  }

  // Prevent deactivating self
  if (req.user._id.toString() === id.toString()) {
    return next(new AppError(400, 'You cannot change your own active status.'));
  }

  const targetUser = await User.findById(id);
  if (!targetUser) {
    return next(new AppError(404, 'Responder not found.'));
  }

  if (targetUser.role !== 'responder') {
    return next(new AppError(400, 'Only responder accounts can be managed.'));
  }

  targetUser.isActive = isActive;
  await targetUser.save();

  const responderResponse = targetUser.toObject();
  delete responderResponse.password;

  let warning = null;
  if (!isActive) {
    // Check if the responder has active assigned incidents (status not resolved or closed)
    const activeIncidentsCount = await Incident.countDocuments({
      assignedResponder: id,
      status: { $nin: ['resolved', 'closed'] }
    });
    if (activeIncidentsCount > 0) {
      warning = 'This responder is currently assigned to active incidents.';
    }
  }

  res.status(200).json(
    new ApiResponse(200, { responder: responderResponse, warning }, 'Responder status updated successfully.')
  );
});

// @desc    Update a responder's safety profile details
// @route   PATCH /api/users/responders/:id/profile
// @access  Private (Admin only)
const updateResponderProfile = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const {
    phone,
    responderId,
    department,
    specialization,
    serviceZone,
    shift,
    emergencyContactName,
    emergencyContactPhone,
    verificationStatus,
    certifications,
    adminNotes
  } = req.body;

  const responder = await User.findById(id);
  if (!responder) {
    return next(new AppError(404, 'Responder not found.'));
  }
  if (responder.role !== 'responder') {
    return next(new AppError(400, 'Only responder accounts can have safety profiles.'));
  }

  // Initialize responderProfile subdocument if it's missing
  if (!responder.responderProfile) {
    responder.responderProfile = {};
  }

  // Keep phone in sync
  if (phone !== undefined) {
    responder.phone = phone;
    responder.responderProfile.phone = phone;
  }

  if (responderId !== undefined) responder.responderProfile.responderId = responderId;
  if (department !== undefined) responder.responderProfile.department = department;
  if (specialization !== undefined) responder.responderProfile.specialization = specialization;
  if (serviceZone !== undefined) responder.responderProfile.serviceZone = serviceZone;
  if (shift !== undefined) responder.responderProfile.shift = shift;
  if (emergencyContactName !== undefined) responder.responderProfile.emergencyContactName = emergencyContactName;
  if (emergencyContactPhone !== undefined) responder.responderProfile.emergencyContactPhone = emergencyContactPhone;
  if (adminNotes !== undefined) responder.responderProfile.adminNotes = adminNotes;

  if (certifications !== undefined) {
    responder.responderProfile.certifications = typeof certifications === 'string'
      ? certifications.split(',').map(c => c.trim()).filter(Boolean)
      : (Array.isArray(certifications) ? certifications : []);
  }

  if (verificationStatus !== undefined) {
    const previousStatus = responder.responderProfile.verificationStatus;
    responder.responderProfile.verificationStatus = verificationStatus;

    // Record verification details when transitioning to verified state
    if (verificationStatus === 'verified' && previousStatus !== 'verified') {
      responder.responderProfile.verifiedAt = new Date();
      responder.responderProfile.verifiedBy = req.user._id;
    }
  }

  await responder.save();

  const responderResponse = responder.toObject();
  delete responderResponse.password;

  res.status(200).json(
    new ApiResponse(200, { responder: responderResponse }, 'Responder profile updated successfully.')
  );
});

// @desc    Safely delete a responder account
// @route   DELETE /api/users/responders/:id
// @access  Private (Admin only)
const deleteResponder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const targetUser = await User.findById(id);
  if (!targetUser) {
    return next(new AppError(404, 'Responder not found.'));
  }

  if (targetUser.role !== 'responder') {
    return next(new AppError(400, 'Only responder accounts can be deleted.'));
  }

  // Block delete if responder has assigned/active incidents
  const activeIncidentsCount = await Incident.countDocuments({
    assignedResponder: id,
    status: { $nin: ['resolved', 'closed'] }
  });

  if (activeIncidentsCount > 0) {
    return next(new AppError(409, 'Responder cannot be deleted because they are linked to active incidents. Deactivate instead.'));
  }

  await User.findByIdAndDelete(id);

  res.status(200).json(
    new ApiResponse(200, null, 'Responder deleted successfully.')
  );
});

module.exports = {
  getResponders,
  createResponder,
  updateResponderStatus,
  updateResponderProfile,
  deleteResponder
};
