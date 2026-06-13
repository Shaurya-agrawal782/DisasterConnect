const express = require('express');
const {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncident,
  updateIncidentStatus,
  assignResponder,
  deleteIncident,
  assignResourceToIncident,
  releaseResourceFromIncident,
  regenerateAiTriage,
  getIncidentByTicket
} = require('../controllers/incidentController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// Public route to track report status by ticket
router.get('/track/:ticketNumber', getIncidentByTicket);

// General protected routes
router.post('/', protect, authorizeRoles('admin', 'citizen'), createIncident);
router.get('/', protect, getIncidents);
router.get('/:id', protect, getIncidentById);

// Admin-only updates / deletions
router.patch('/:id', protect, authorizeRoles('admin'), updateIncident);
router.delete('/:id', protect, authorizeRoles('admin'), deleteIncident);
router.patch('/:id/assign', protect, authorizeRoles('admin'), assignResponder);
router.patch('/:id/resources/assign', protect, authorizeRoles('admin'), assignResourceToIncident);
router.patch('/:id/resources/:resourceId/release', protect, authorizeRoles('admin'), releaseResourceFromIncident);
router.post('/:id/ai-triage', protect, authorizeRoles('admin'), regenerateAiTriage);

// Status updates (both admin and responder have path controls in the controller)
router.patch('/:id/status', protect, authorizeRoles('admin', 'responder'), updateIncidentStatus);

module.exports = router;
