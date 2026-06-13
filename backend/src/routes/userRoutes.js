const express = require('express');
const { 
  getResponders,
  createResponder,
  updateResponderStatus,
  updateResponderProfile,
  deleteResponder
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

const router = express.Router();

// Enforce authentication and administrative roles for all endpoints in this routes file
router.use(protect);
router.use(authorizeRoles('admin'));

router.route('/responders')
  .get(getResponders)
  .post(createResponder);

router.route('/responders/:id/status')
  .patch(updateResponderStatus);

router.route('/responders/:id/profile')
  .patch(updateResponderProfile);

router.route('/responders/:id')
  .delete(deleteResponder);

module.exports = router;
