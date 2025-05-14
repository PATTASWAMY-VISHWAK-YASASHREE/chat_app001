const { Channel, User } = require('../models');
const { sequelize } = require('../config/db');

// @desc    Create a new channel
// @route   POST /api/channels
// @access  Private
exports.createChannel = async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;

    // Create channel
    const channel = await Channel.create({
      name,
      description,
      isPrivate: isPrivate || false,
      creatorId: req.user.id
    });

    // Get creator details
    const creator = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'avatar']
    });

    res.status(201).json({
      success: true,
      channel: {
        ...channel.toJSON(),
        creator
      }
    });
  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all accessible channels
// @route   GET /api/channels
// @access  Private
exports.getChannels = async (req, res) => {
  try {
    // Get all public channels and private channels created by the user
    const channels = await Channel.findAll({
      where: {
        [sequelize.Op.or]: [
          { isPrivate: false },
          { creatorId: req.user.id }
        ]
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      channels
    });
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get channel by ID
// @route   GET /api/channels/:id
// @access  Private
exports.getChannelById = async (req, res) => {
  try {
    const channel = await Channel.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'avatar']
        }
      ]
    });

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
        message: 'Not authorized to access this channel'
      });
    }

    res.status(200).json({
      success: true,
      channel
    });
  } catch (error) {
    console.error('Get channel by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update channel
// @route   PUT /api/channels/:id
// @access  Private
exports.updateChannel = async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;
    const channel = await Channel.findByPk(req.params.id);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    // Check if user is the creator of the channel
    if (channel.creatorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this channel'
      });
    }

    // Update channel fields
    if (name) channel.name = name;
    if (description !== undefined) channel.description = description;
    if (isPrivate !== undefined) channel.isPrivate = isPrivate;

    await channel.save();

    // Get creator details
    const creator = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'avatar']
    });

    res.status(200).json({
      success: true,
      channel: {
        ...channel.toJSON(),
        creator
      }
    });
  } catch (error) {
    console.error('Update channel error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete channel
// @route   DELETE /api/channels/:id
// @access  Private
exports.deleteChannel = async (req, res) => {
  try {
    const channel = await Channel.findByPk(req.params.id);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found'
      });
    }

    // Check if user is the creator of the channel
    if (channel.creatorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this channel'
      });
    }

    await channel.destroy();

    res.status(200).json({
      success: true,
      message: 'Channel deleted successfully'
    });
  } catch (error) {
    console.error('Delete channel error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};