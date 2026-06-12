const Incident = require('../models/Incident');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Helper to validate status transitions
const isValidTransition = (current, target) => {
  const allowed = {
    'reported': ['verified', 'assigned', 'closed'],
    'verified': ['assigned', 'in-progress', 'closed'],
    'assigned': ['in-progress', 'resolved', 'closed'],
    'in-progress': ['resolved', 'closed'],
    'resolved': ['closed'],
    'closed': []
  };

  return allowed[current] ? allowed[current].includes(target) : false;
};

// @desc    Create a new incident
// @route   POST /api/incidents
// @access  Private (citizen, responder, admin)
const createIncident = asyncHandler(async (req, res, next) => {
  const { title, description, type, severity, location } = req.body;

  if (!title || !description || !type || !location) {
    return next(new AppError(400, 'Please provide all required fields (title, description, type, location).'));
  }

  // Validate coordinates
  const { coordinates, address } = location;
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2 || !address) {
    return next(new AppError(400, 'Please provide valid location details: coordinates as [longitude, latitude] and address.'));
  }

  const [lng, lat] = coordinates;
  if (typeof lng !== 'number' || typeof lat !== 'number') {
    return next(new AppError(400, 'Location coordinates must be numeric values.'));
  }

  // Create incident
  let incident = await Incident.create({
    title,
    description,
    type,
    severity: severity || 'medium',
    location: {
      type: 'Point',
      coordinates: [lng, lat],
      address
    },
    reportedBy: req.user._id
  });

  // Populate reportedBy info
  incident = await incident.populate('reportedBy', 'name email');

  res.status(201).json(
    new ApiResponse(201, { incident }, 'Incident created successfully')
  );
});

// @desc    Get all incidents with query filters and role-based visibility
// @route   GET /api/incidents
// @access  Private
const getIncidents = asyncHandler(async (req, res, next) => {
  const { status, severity, type, search, page = 1, limit = 10, sort = '-createdAt' } = req.query;

  // Initialize query filters based on user role
  let roleFilter = {};

  if (req.user.role === 'citizen') {
    roleFilter = { reportedBy: req.user._id };
  } else if (req.user.role === 'responder') {
    roleFilter = {
      $or: [
        { assignedResponder: req.user._id },
        { status: { $in: ['verified', 'assigned', 'in-progress'] } }
      ]
    };
  }
  // admin sees all, so roleFilter remains empty {}

  // Apply user-defined filters
  const query = { ...roleFilter };

  if (status) query.status = status;
  if (severity) query.severity = severity;
  if (type) query.type = type;

  // Search keyword in title or description
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination parameters
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Execute query with sorting and pagination
  const incidents = await Incident.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limitNum)
    .populate('reportedBy', 'name email')
    .populate('assignedResponder', 'name email');

  const totalIncidents = await Incident.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, {
      incidents,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalIncidents / limitNum),
        totalItems: totalIncidents
      }
    }, 'Incidents retrieved successfully')
  );
});

// @desc    Get a single incident by ID
// @route   GET /api/incidents/:id
// @access  Private
const getIncidentById = asyncHandler(async (req, res, next) => {
  const incident = await Incident.findById(req.params.id)
    .populate('reportedBy', 'name email')
    .populate('assignedResponder', 'name email');

  if (!incident) {
    return next(new AppError(404, 'Incident not found.'));
  }

  // Enforce role-based access limits
  if (req.user.role === 'citizen') {
    if (incident.reportedBy._id.toString() !== req.user._id.toString()) {
      return next(new AppError(403, 'Access denied. You can only view your own reported incidents.'));
    }
  } else if (req.user.role === 'responder') {
    const isAssigned = incident.assignedResponder && incident.assignedResponder._id.toString() === req.user._id.toString();
    const isVisibleStatus = ['verified', 'assigned', 'in-progress'].includes(incident.status);
    
    if (!isAssigned && !isVisibleStatus) {
      return next(new AppError(403, 'Access denied. Responders can only view assigned or active incidents.'));
    }
  }

  res.status(200).json(
    new ApiResponse(200, { incident }, 'Incident details retrieved successfully')
  );
});

// @desc    Update incident details
// @route   PATCH /api/incidents/:id
// @access  Private (Admin only)
const updateIncident = asyncHandler(async (req, res, next) => {
  const { title, description, type, severity, location } = req.body;

  let incident = await Incident.findById(req.params.id);

  if (!incident) {
    return next(new AppError(404, 'Incident not found.'));
  }

  // Update parameters
  if (title) incident.title = title;
  if (description) incident.description = description;
  if (type) incident.type = type;
  if (severity) incident.severity = severity;
  
  if (location) {
    const { coordinates, address } = location;
    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2 && address) {
      const [lng, lat] = coordinates;
      if (typeof lng === 'number' && typeof lat === 'number') {
        incident.location = {
          type: 'Point',
          coordinates: [lng, lat],
          address
        };
      }
    }
  }

  await incident.save();

  incident = await incident.populate('reportedBy', 'name email');
  incident = await incident.populate('assignedResponder', 'name email');

  res.status(200).json(
    new ApiResponse(200, { incident }, 'Incident updated successfully')
  );
});

// @desc    Update incident status
// @route   PATCH /api/incidents/:id/status
// @access  Private (Admin or assigned responder)
const updateIncidentStatus = asyncHandler(async (req, res, next) => {
  const { status, note } = req.body;

  if (!status) {
    return next(new AppError(400, 'Please provide the status parameter.'));
  }

  let incident = await Incident.findById(req.params.id);

  if (!incident) {
    return next(new AppError(404, 'Incident not found.'));
  }

  // Check permissions: Admin can update any. Responders can only update assigned incidents.
  if (req.user.role === 'responder') {
    const isAssigned = incident.assignedResponder && incident.assignedResponder.toString() === req.user._id.toString();
    if (!isAssigned) {
      return next(new AppError(403, 'Access denied. Responders can only update the status of incidents assigned to them.'));
    }
  }

  // Validate status transition
  if (!isValidTransition(incident.status, status)) {
    return next(new AppError(400, `Invalid status transition from '${incident.status}' to '${status}'.`));
  }

  // Push status transition history
  incident.statusHistory.push({
    status,
    changedBy: req.user._id,
    note: note || `Status transitioned to ${status}.`
  });

  // Apply new status
  incident.status = status;
  await incident.save();

  incident = await incident.populate('reportedBy', 'name email');
  incident = await incident.populate('assignedResponder', 'name email');

  res.status(200).json(
    new ApiResponse(200, { incident }, 'Incident status updated successfully')
  );
});

// @desc    Assign emergency responder to incident
// @route   PATCH /api/incidents/:id/assign
// @access  Private (Admin only)
const assignResponder = asyncHandler(async (req, res, next) => {
  const { responderId } = req.body;

  if (!responderId) {
    return next(new AppError(400, 'Please provide the responderId.'));
  }

  let incident = await Incident.findById(req.params.id);

  if (!incident) {
    return next(new AppError(404, 'Incident not found.'));
  }

  // Validate responder account
  const responder = await User.findById(responderId);
  if (!responder) {
    return next(new AppError(404, 'Responder account not found.'));
  }

  if (responder.role !== 'responder' || !responder.isActive) {
    return next(new AppError(400, 'The designated user must be an active responder.'));
  }

  // Update status automatically if required
  let targetStatus = incident.status;
  if (['reported', 'verified'].includes(incident.status)) {
    targetStatus = 'assigned';
  }

  // Push to history
  incident.statusHistory.push({
    status: targetStatus,
    changedBy: req.user._id,
    note: `Assigned responder ${responder.name}.`
  });

  incident.assignedResponder = responderId;
  incident.status = targetStatus;
  
  await incident.save();

  incident = await incident.populate('reportedBy', 'name email');
  incident = await incident.populate('assignedResponder', 'name email');

  res.status(200).json(
    new ApiResponse(200, { incident }, 'Responder assigned to incident successfully')
  );
});

// @desc    Delete incident
// @route   DELETE /api/incidents/:id
// @access  Private (Admin only)
const deleteIncident = asyncHandler(async (req, res, next) => {
  const incident = await Incident.findById(req.params.id);

  if (!incident) {
    return next(new AppError(404, 'Incident not found.'));
  }

  await Incident.findByIdAndDelete(req.params.id);

  res.status(200).json(
    new ApiResponse(200, null, 'Incident deleted successfully')
  );
});

module.exports = {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncident,
  updateIncidentStatus,
  assignResponder,
  deleteIncident
};
