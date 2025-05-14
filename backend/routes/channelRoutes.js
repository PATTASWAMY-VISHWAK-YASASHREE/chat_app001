const express = require('express');
const {
  createChannel,
  getChannels,
  getChannelById,
  updateChannel,
  deleteChannel
} = require('../controllers/channelController');
const { verifyToken, requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(verifyToken, requireAuth);

router.route('/')
  .post(createChannel)
  .get(getChannels);

router.route('/:id')
  .get(getChannelById)
  .put(updateChannel)
  .delete(deleteChannel);

module.exports = router;