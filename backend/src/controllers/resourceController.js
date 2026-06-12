const Resource = require('../models/Resource');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create a new resource
// @route   POST /api/resources
// @access  Private (Admin only)
const createResource = asyncHandler(async (req, res, next) => {
  const { 
    name, 
    type, 
    status, 
    capacity, 
    currentLocation, 
    contactPerson, 
    contactNumber, 
    description 
  } = req.body;

  if (!name || !type || !currentLocation) {
    return next(new AppError(400, 'Please provide all required fields (name, type, currentLocation).'));
  }

  // Validate coordinates
  const { coordinates, address } = currentLocation;
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2 || !address) {
    return next(new AppError(400, 'Please provide valid location details: coordinates as [longitude, latitude] and address.'));
  }

  const [lng, lat] = coordinates;
  if (typeof lng !== 'number' || typeof lat !== 'number') {
    return next(new AppError(400, 'Location coordinates must be numeric values.'));
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return next(new AppError(400, 'Invalid coordinate values. Latitude must be [-90, 90] and Longitude [-180, 180].'));
  }

  let resource = await Resource.create({
    name,
    type,
    status: status || 'available',
    capacity: capacity !== undefined ? capacity : 1,
    currentLocation: {
      type: 'Point',
      coordinates: [lng, lat],
      address
    },
    contactPerson,
    contactNumber,
    description,
    createdBy: req.user._id
  });

  resource = await resource.populate('createdBy', 'name email');

  res.status(201).json(
    new ApiResponse(201, { resource }, 'Resource created successfully')
  );
});

// @desc    Get all resources with filters and pagination
// @route   GET /api/resources
// @access  Private (Admin/Responder only)
const getResources = asyncHandler(async (req, res, next) => {
  const { status, type, search, page = 1, limit = 10, sort = '-createdAt' } = req.query;

  const query = {};

  if (status) query.status = status;
  if (type) query.type = type;

  // Search keyword in name or description
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination parameters
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const resources = await Resource.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limitNum)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .populate('assignedIncident', 'title type severity status location.address');

  const totalResources = await Resource.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, {
      resources,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalResources / limitNum),
        totalItems: totalResources
      }
    }, 'Resources retrieved successfully')
  );
});

// @desc    Get a single resource by ID
// @route   GET /api/resources/:id
// @access  Private (Admin/Responder only)
const getResourceById = asyncHandler(async (req, res, next) => {
  const resource = await Resource.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .populate('assignedIncident', 'title type severity status location.address');

  if (!resource) {
    return next(new AppError(404, 'Resource not found.'));
  }

  res.status(200).json(
    new ApiResponse(200, { resource }, 'Resource retrieved successfully')
  );
});

// @desc    Update resource details
// @route   PATCH /api/resources/:id
// @access  Private (Admin only)
const updateResource = asyncHandler(async (req, res, next) => {
  const { 
    name, 
    type, 
    status, 
    capacity, 
    currentLocation, 
    contactPerson, 
    contactNumber, 
    description 
  } = req.body;

  let resource = await Resource.findById(req.params.id);

  if (!resource) {
    return next(new AppError(404, 'Resource not found.'));
  }

  if (name) resource.name = name;
  if (type) resource.type = type;
  if (status) resource.status = status;
  if (capacity !== undefined) resource.capacity = capacity;
  if (contactPerson !== undefined) resource.contactPerson = contactPerson;
  if (contactNumber !== undefined) resource.contactNumber = contactNumber;
  if (description !== undefined) resource.description = description;

  if (currentLocation) {
    const { coordinates, address } = currentLocation;
    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2 && address) {
      const [lng, lat] = coordinates;
      if (typeof lng === 'number' && typeof lat === 'number') {
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          return next(new AppError(400, 'Invalid coordinates range.'));
        }
        resource.currentLocation = {
          type: 'Point',
          coordinates: [lng, lat],
          address
        };
      }
    }
  }

  resource.updatedBy = req.user._id;

  await resource.save();

  resource = await resource.populate('createdBy', 'name email');
  resource = await resource.populate('updatedBy', 'name email');
  resource = await resource.populate('assignedIncident', 'title type severity status location.address');

  res.status(200).json(
    new ApiResponse(200, { resource }, 'Resource updated successfully')
  );
});

// @desc    Update resource status only
// @route   PATCH /api/resources/:id/status
// @access  Private (Admin only)
const updateResourceStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return next(new AppError(400, 'Please provide the status parameter.'));
  }

  const validStatuses = ['available', 'assigned', 'busy', 'maintenance', 'offline'];
  if (!validStatuses.includes(status)) {
    return next(new AppError(400, `Invalid status option. Must be one of: ${validStatuses.join(', ')}`));
  }

  let resource = await Resource.findById(req.params.id);

  if (!resource) {
    return next(new AppError(404, 'Resource not found.'));
  }

  resource.status = status;
  resource.updatedBy = req.user._id;

  await resource.save();

  resource = await resource.populate('createdBy', 'name email');
  resource = await resource.populate('updatedBy', 'name email');
  resource = await resource.populate('assignedIncident', 'title type severity status location.address');

  res.status(200).json(
    new ApiResponse(200, { resource }, 'Resource status updated successfully')
  );
});

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
// @access  Private (Admin only)
const deleteResource = asyncHandler(async (req, res, next) => {
  const resource = await Resource.findById(req.params.id);

  if (!resource) {
    return next(new AppError(404, 'Resource not found.'));
  }

  if (resource.assignedIncident) {
    return next(new AppError(400, 'Cannot delete resource because it is currently assigned to an active incident.'));
  }

  await Resource.findByIdAndDelete(req.params.id);

  res.status(200).json(
    new ApiResponse(200, null, 'Resource deleted successfully')
  );
});

module.exports = {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  updateResourceStatus,
  deleteResource
};
