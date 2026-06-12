const Incident = require('../models/Incident');
const User = require('../models/User');
const Resource = require('../models/Resource');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const createAlertAndEmit = require('../utils/createAlert');

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

  // Create alert for admin
  try {
    const io = req.app.get('io');
    await createAlertAndEmit({
      io,
      title: 'New Incident Reported',
      message: `Incident "${incident.title}" (${incident.type}) reported at ${incident.location.address}.`,
      type: 'incident_created',
      priority: incident.severity,
      targetRoles: ['admin'],
      relatedIncident: incident._id,
      createdBy: req.user._id
    });
  } catch (alertErr) {
    console.error('Failed to create/emit alert for incident creation:', alertErr.message);
  }

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
    .populate('assignedResponder', 'name email')
    .populate('assignedResources', 'name type status capacity currentLocation.address');

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
    .populate('assignedResponder', 'name email')
    .populate('assignedResources', 'name type status capacity currentLocation.address');

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
  incident = await incident.populate('assignedResources', 'name type status capacity currentLocation.address');

  res.status(200).json(
    new ApiResponse(200, { incident }, 'Incident updated successfully')
  );
});

// Helper function to release all resources for an incident
const releaseAllResourcesForIncident = async (incident, userId) => {
  const resources = await Resource.find({ assignedIncident: incident._id });
  if (resources.length === 0) {
    return false;
  }

  const releasedNames = [];
  for (const resource of resources) {
    resource.assignedIncident = undefined;
    resource.status = 'available';
    await resource.save();
    releasedNames.push(resource.name);
  }

  incident.assignedResources = [];
  incident.statusHistory.push({
    status: incident.status,
    changedBy: userId,
    note: `Automatic resource release: ${releasedNames.join(', ')}`
  });

  return true;
};

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

  // Auto release resources if status is resolved or closed
  if (['resolved', 'closed'].includes(status)) {
    await releaseAllResourcesForIncident(incident, req.user._id);
  }

  await incident.save();

  incident = await incident.populate('reportedBy', 'name email');
  incident = await incident.populate('assignedResponder', 'name email');
  incident = await incident.populate('assignedResources', 'name type status capacity currentLocation.address');

  // Create status update alerts
  try {
    const io = req.app.get('io');
    const targetUsers = [];
    const targetRoles = [];

    // Add citizen reporter
    if (incident.reportedBy) {
      targetUsers.push(incident.reportedBy._id);
    }

    if (req.user.role === 'responder') {
      targetRoles.push('admin');
    } else if (req.user.role === 'admin') {
      if (incident.assignedResponder) {
        targetUsers.push(incident.assignedResponder._id);
      }
    }

    await createAlertAndEmit({
      io,
      title: 'Incident Status Updated',
      message: `Incident "${incident.title}" status updated to "${status}" by ${req.user.name}. Note: ${note || 'None'}`,
      type: 'status_updated',
      priority: incident.severity,
      targetRoles,
      targetUsers,
      relatedIncident: incident._id,
      createdBy: req.user._id
    });
  } catch (alertErr) {
    console.error('Failed to create/emit alert for status update:', alertErr.message);
  }

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
  incident = await incident.populate('assignedResources', 'name type status capacity currentLocation.address');

  // Create alert for responder
  try {
    const io = req.app.get('io');
    await createAlertAndEmit({
      io,
      title: 'New Incident Assignment',
      message: `You have been assigned to the incident: "${incident.title}".`,
      type: 'incident_assigned',
      priority: incident.severity,
      targetUsers: [responderId],
      relatedIncident: incident._id,
      createdBy: req.user._id
    });
  } catch (alertErr) {
    console.error('Failed to create/emit alert for incident assignment:', alertErr.message);
  }

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

// @desc    Assign resource to incident
// @route   PATCH /api/incidents/:id/resources/assign
// @access  Private (Admin only)
const assignResourceToIncident = asyncHandler(async (req, res, next) => {
  const { resourceId } = req.body;

  if (!resourceId) {
    return next(new AppError(400, 'Please provide the resourceId.'));
  }

  let incident = await Incident.findById(req.params.id);
  if (!incident) {
    return next(new AppError(404, 'Incident not found.'));
  }

  const resource = await Resource.findById(resourceId);
  if (!resource) {
    return next(new AppError(404, 'Resource not found.'));
  }

  if (resource.status !== 'available') {
    return next(new AppError(400, `Resource status is '${resource.status}' but must be 'available' to assign.`));
  }

  if (resource.assignedIncident) {
    return next(new AppError(400, 'Resource is already assigned to an active incident.'));
  }

  if (!incident.assignedResources) {
    incident.assignedResources = [];
  }

  const isAlreadyAssigned = incident.assignedResources.some(
    (id) => id.toString() === resource._id.toString()
  );

  if (!isAlreadyAssigned) {
    incident.assignedResources.push(resource._id);
  }

  resource.assignedIncident = incident._id;
  resource.status = 'assigned';
  await resource.save();

  incident.statusHistory.push({
    status: incident.status,
    changedBy: req.user._id,
    note: `Resource assigned: ${resource.name}`
  });

  await incident.save();

  incident = await Incident.findById(incident._id)
    .populate('reportedBy', 'name email')
    .populate('assignedResponder', 'name email')
    .populate('assignedResources', 'name type status capacity currentLocation.address');

  try {
    const io = req.app.get('io');
    const targetUsers = [];
    if (incident.assignedResponder) {
      targetUsers.push(incident.assignedResponder._id || incident.assignedResponder);
    }

    await createAlertAndEmit({
      io,
      title: 'Resource Assigned',
      message: `Resource "${resource.name}" has been assigned to incident "${incident.title}".`,
      type: 'resource_updated',
      priority: incident.severity || 'medium',
      targetRoles: ['admin'],
      targetUsers,
      relatedIncident: incident._id,
      relatedResource: resource._id,
      createdBy: req.user._id
    });
  } catch (alertErr) {
    console.error('Failed to create/emit alert for resource assignment:', alertErr.message);
  }

  res.status(200).json(
    new ApiResponse(200, { incident }, 'Resource assigned to incident successfully')
  );
});

// @desc    Release resource from incident
// @route   PATCH /api/incidents/:id/resources/:resourceId/release
// @access  Private (Admin only)
const releaseResourceFromIncident = asyncHandler(async (req, res, next) => {
  const { resourceId } = req.params;

  let incident = await Incident.findById(req.params.id);
  if (!incident) {
    return next(new AppError(404, 'Incident not found.'));
  }

  const resource = await Resource.findById(resourceId);
  if (!resource) {
    return next(new AppError(404, 'Resource not found.'));
  }

  const isAssigned = incident.assignedResources && incident.assignedResources.some(
    (id) => id.toString() === resource._id.toString()
  );
  if (!isAssigned && (!resource.assignedIncident || resource.assignedIncident.toString() !== incident._id.toString())) {
    return next(new AppError(400, 'Resource is not assigned to this incident.'));
  }

  if (incident.assignedResources) {
    incident.assignedResources = incident.assignedResources.filter(
      (id) => id.toString() !== resource._id.toString()
    );
  }

  resource.assignedIncident = undefined;
  resource.status = 'available';
  await resource.save();

  incident.statusHistory.push({
    status: incident.status,
    changedBy: req.user._id,
    note: `Resource released: ${resource.name}`
  });

  await incident.save();

  incident = await Incident.findById(incident._id)
    .populate('reportedBy', 'name email')
    .populate('assignedResponder', 'name email')
    .populate('assignedResources', 'name type status capacity currentLocation.address');

  try {
    const io = req.app.get('io');
    const targetUsers = [];
    if (incident.assignedResponder) {
      targetUsers.push(incident.assignedResponder._id || incident.assignedResponder);
    }

    await createAlertAndEmit({
      io,
      title: 'Resource Released',
      message: `Resource "${resource.name}" has been released from incident "${incident.title}".`,
      type: 'resource_updated',
      priority: incident.severity || 'medium',
      targetRoles: ['admin'],
      targetUsers,
      relatedIncident: incident._id,
      relatedResource: resource._id,
      createdBy: req.user._id
    });
  } catch (alertErr) {
    console.error('Failed to create/emit alert for resource release:', alertErr.message);
  }

  res.status(200).json(
    new ApiResponse(200, { incident }, 'Resource released from incident successfully')
  );
});

module.exports = {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncident,
  updateIncidentStatus,
  assignResponder,
  deleteIncident,
  assignResourceToIncident,
  releaseResourceFromIncident,
  releaseAllResourcesForIncident
};
