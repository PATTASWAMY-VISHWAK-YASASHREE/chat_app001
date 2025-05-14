const express = require('express');
const {
  createMessage,
  getMessages,
  updateMessage,
  deleteMessage
} = require('../controllers/messageController');
const { verifyToken, requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(verifyToken, requireAuth);

// Channel message routes
router.route('/channels/:channelId/messages')
  .post(createMessage)
  .get(getMessages);

// Individual message routes
router.route('/messages/:id')
  .put(updateMessage)
  .delete(deleteMessage);

module.exports = router;