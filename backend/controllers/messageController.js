const { Message, User, Channel } = require('../models');

// @desc    Create a new message
// @route   POST /api/channels/:channelId/messages
// @access  Private
exports.createMessage = async (req, res) => {
  try {
    const { content, attachment } = req.body;
    const { channelId } = req.params;

    // Check if channel exists
    const channel = await Channel.findByPk(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    // Check if user can access this channel
    if (channel.isPrivate && channel.creatorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to post in this channel'
      });
    }

    // Create message
    const message = await Message.create({
      content,
      attachment,
      channelId,
      userId: req.user.id
    });

    // Get user details
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'avatar']
    });

    res.status(201).json({
      success: true,
      message: {
        ...message.toJSON(),
        user
      }
    });
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get messages for a channel
// @route   GET /api/channels/:channelId/messages
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    // Check if channel exists
    const channel = await Channel.findByPk(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    // Check if user can access this channel
    if (channel.isPrivate && channel.creatorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view messages in this channel'
      });
    }

    // Get messages with pagination
    const { count, rows: messages } = await Message.findAndCountAll({
      where: { channelId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.status(200).json({
      success: true,
      messages,
      hasMore: count > offset + limit
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update a message
// @route   PUT /api/messages/:id
// @access  Private
exports.updateMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const message = await Message.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the author of the message
    if (message.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this message'
      });
    }

    // Update message content
    message.content = content;
    await message.save();

    // Get user details
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'avatar']
    });

    res.status(200).json({
      success: true,
      message: {
        ...message.toJSON(),
        user
      }
    });
  } catch (error) {
    console.error('Update message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the author of the message
    if (message.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    await message.destroy();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};