const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Map to store active users
const activeUsers = new Map();

// Socket.IO handler
const socketHandler = (io) => {
  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      // Attach user to socket
      socket.user = {
        id: user.id,
        username: user.username,
        avatar: user.avatar
      };
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.user.id})`);
    
    // Add user to active users map
    activeUsers.set(socket.user.id, {
      socketId: socket.id,
      ...socket.user
    });
    
    // Broadcast updated user list
    io.emit('users:active', Array.from(activeUsers.values()));
    
    // Update user status to online
    User.update(
      { status: 'online' },
      { where: { id: socket.user.id } }
    ).catch(err => console.error('Error updating user status:', err));

    // Handle joining a channel
    socket.on('channel:join', (channelId) => {
      socket.join(`channel:${channelId}`);
      socket.to(`channel:${channelId}`).emit('channel:join', {
        channelId,
        user: socket.user
      });
      console.log(`${socket.user.username} joined channel ${channelId}`);
    });

    // Handle leaving a channel
    socket.on('channel:leave', (channelId) => {
      socket.leave(`channel:${channelId}`);
      socket.to(`channel:${channelId}`).emit('channel:leave', {
        channelId,
        user: socket.user
      });
      console.log(`${socket.user.username} left channel ${channelId}`);
    });

    // Handle new message
    socket.on('message:send', (message) => {
      // Broadcast to all users in the channel
      io.to(`channel:${message.channelId}`).emit('message:new', {
        ...message,
        user: socket.user
      });
    });

    // Handle message edit
    socket.on('message:edit', (message) => {
      io.to(`channel:${message.channelId}`).emit('message:update', {
        ...message,
        user: socket.user
      });
    });

    // Handle message delete
    socket.on('message:delete', (message) => {
      io.to(`channel:${message.channelId}`).emit('message:delete', {
        ...message,
        user: socket.user
      });
    });

    // Handle typing indicators
    socket.on('typing:start', (channelId) => {
      socket.to(`channel:${channelId}`).emit('user:typing', {
        channelId,
        user: socket.user
      });
    });

    socket.on('typing:stop', (channelId) => {
      socket.to(`channel:${channelId}`).emit('user:typing', {
        channelId,
        user: socket.user,
        isTyping: false
      });
    });

    // Handle status update
    socket.on('status:update', (status) => {
      // Update in memory
      if (activeUsers.has(socket.user.id)) {
        const userData = activeUsers.get(socket.user.id);
        userData.status = status;
        activeUsers.set(socket.user.id, userData);
      }
      
      // Update in database
      User.update(
        { status },
        { where: { id: socket.user.id } }
      ).catch(err => console.error('Error updating user status:', err));
      
      // Broadcast to all users
      io.emit('user:status', {
        userId: socket.user.id,
        status
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.username} (${socket.user.id})`);
      
      // Remove from active users
      activeUsers.delete(socket.user.id);
      
      // Broadcast updated user list
      io.emit('users:active', Array.from(activeUsers.values()));
      
      // Update user status to offline
      User.update(
        { status: 'offline' },
        { where: { id: socket.user.id } }
      ).catch(err => console.error('Error updating user status:', err));
    });
  });
};

module.exports = socketHandler;