const express = require('express');
const {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncident,
  updateIncidentStatus,
  assignResponder,
  deleteIncident
} = require('../controllers/incidentController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// General protected routes
router.post('/', protect, createIncident);
router.get('/', protect, getIncidents);
router.get('/:id', protect, getIncidentById);

// Admin-only updates / deletions
router.patch('/:id', protect, authorizeRoles('admin'), updateIncident);
router.delete('/:id', protect, authorizeRoles('admin'), deleteIncident);
router.patch('/:id/assign', protect, authorizeRoles('admin'), assignResponder);

// Status updates (both admin and responder have path controls in the controller)
router.patch('/:id/status', protect, authorizeRoles('admin', 'responder'), updateIncidentStatus);

module.exports = router;
