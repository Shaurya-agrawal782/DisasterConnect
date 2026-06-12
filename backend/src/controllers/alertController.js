const Alert = require('../models/Alert');
const AppError = require('../utils/AppError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get current user's alerts (role-scoped or direct-user targeted)
// @route   GET /api/alerts
// @access  Private
const getMyAlerts = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, unreadOnly = 'false' } = req.query;

  // Build target query filter
  const targetFilter = {
    $or: [
      { targetUsers: req.user._id },
      { targetRoles: req.user.role }
    ]
  };

  // Build unread filter if requested
  if (unreadOnly === 'true' || unreadOnly === true) {
    targetFilter['readBy.user'] = { $ne: req.user._id };
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Execute query sorted by newest first
  const alerts = await Alert.find(targetFilter)
    .sort('-createdAt')
    .skip(skip)
    .limit(limitNum)
    .populate('createdBy', 'name email')
    .populate('relatedIncident', 'title status')
    .populate('relatedResource', 'name type');

  const totalAlerts = await Alert.countDocuments(targetFilter);

  res.status(200).json(
    new ApiResponse(200, {
      alerts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalAlerts / limitNum),
        totalItems: totalAlerts
      }
    }, 'Alerts retrieved successfully')
  );
});

// @desc    Mark a specific alert as read
// @route   PATCH /api/alerts/:id/read
// @access  Private
const markAlertRead = asyncHandler(async (req, res, next) => {
  let alert = await Alert.findById(req.params.id);

  if (!alert) {
    return next(new AppError(404, 'Alert not found.'));
  }

  // Authorize: Ensure the alert is targeted to this user or role
  const isTarget = alert.targetUsers.some(id => id.toString() === req.user._id.toString()) || alert.targetRoles.includes(req.user.role);
  if (!isTarget) {
    return next(new AppError(403, 'Access denied. You are not authorized to read this alert.'));
  }

  // Push user to readBy array if not already present
  const alreadyRead = alert.readBy.some(entry => entry.user.toString() === req.user._id.toString());
  if (!alreadyRead) {
    alert.readBy.push({
      user: req.user._id,
      readAt: new Date()
    });
    await alert.save();
  }

  alert = await Alert.findById(alert._id)
    .populate('createdBy', 'name email')
    .populate('relatedIncident', 'title status')
    .populate('relatedResource', 'name type');

  res.status(200).json(
    new ApiResponse(200, { alert }, 'Alert marked as read successfully')
  );
});

// @desc    Mark all unread alerts targeting the user as read
// @route   PATCH /api/alerts/read-all
// @access  Private
const markAllAlertsRead = asyncHandler(async (req, res, next) => {
  const filter = {
    $or: [
      { targetUsers: req.user._id },
      { targetRoles: req.user.role }
    ],
    'readBy.user': { $ne: req.user._id }
  };

  await Alert.updateMany(filter, {
    $push: {
      readBy: {
        user: req.user._id,
        readAt: new Date()
      }
    }
  });

  res.status(200).json(
    new ApiResponse(200, null, 'All alerts marked as read successfully')
  );
});

module.exports = {
  getMyAlerts,
  markAlertRead,
  markAllAlertsRead
};
