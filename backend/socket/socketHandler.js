const jwt = require('jsonwebtoken');
const { User, Channel } = require('../models');

// Map to store active users
const activeUsers = new Map();

// Helper function to safely emit events with error handling
const safeEmit = (socket, event, data) => {
  try {
    socket.emit(event, data);
  } catch (error) {
    console.error(`Error emitting ${event}:`, error);
  }
};

// Helper function to safely broadcast events with error handling
const safeBroadcast = (io, room, event, data) => {
  try {
    io.to(room).emit(event, data);
  } catch (error) {
    console.error(`Error broadcasting ${event} to ${room}:`, error);
  }
};

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
        avatar: user.avatar,
        status: user.status
      };
      
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: ' + (error.message || 'Unknown error')));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.user.id})`);
    
    // Add user to active users map
    activeUsers.set(socket.user.id, {
      socketId: socket.id,
      ...socket.user,
      lastActivity: new Date()
    });
    
    // Broadcast updated user list
    safeBroadcast(io, 'presence', 'users:active', Array.from(activeUsers.values()));
    
    // Update user status to online
    User.update(
      { status: 'online' },
      { where: { id: socket.user.id } }
    ).catch(err => console.error('Error updating user status:', err));

    // Handle joining a channel
    socket.on('channel:join', async (channelId) => {
      try {
        // Verify channel exists and user has access
        const channel = await Channel.findByPk(channelId);
        if (!channel) {
          return safeEmit(socket, 'error', {
            event: 'channel:join',
            message: 'Channel not found'
          });
        }
        
        // Check if user can access this channel
        if (channel.isPrivate && channel.creatorId !== socket.user.id) {
          return safeEmit(socket, 'error', {
            event: 'channel:join',
            message: 'Not authorized to access this channel'
          });
        }
        
        // Join the channel room
        const channelRoom = `channel:${channelId}`;
        socket.join(channelRoom);
        
        // Notify others in the channel
        socket.to(channelRoom).emit('channel:join', {
          channelId,
          user: socket.user,
          timestamp: new Date()
        });
        
        console.log(`${socket.user.username} joined channel ${channelId}`);
        
        // Update user's last activity
        if (activeUsers.has(socket.user.id)) {
          const userData = activeUsers.get(socket.user.id);
          userData.lastActivity = new Date();
          activeUsers.set(socket.user.id, userData);
        }
      } catch (error) {
        console.error(`Error joining channel ${channelId}:`, error);
        safeEmit(socket, 'error', {
          event: 'channel:join',
          message: 'Failed to join channel'
        });
      }
    });

    // Handle leaving a channel
    socket.on('channel:leave', (channelId) => {
      try {
        const channelRoom = `channel:${channelId}`;
        socket.leave(channelRoom);
        
        socket.to(channelRoom).emit('channel:leave', {
          channelId,
          user: socket.user,
          timestamp: new Date()
        });
        
        console.log(`${socket.user.username} left channel ${channelId}`);
        
        // Update user's last activity
        if (activeUsers.has(socket.user.id)) {
          const userData = activeUsers.get(socket.user.id);
          userData.lastActivity = new Date();
          activeUsers.set(socket.user.id, userData);
        }
      } catch (error) {
        console.error(`Error leaving channel ${channelId}:`, error);
      }
    });

    // Handle new message
    socket.on('message:send', (message) => {
      try {
        if (!message || !message.channelId || !message.content) {
          return safeEmit(socket, 'error', {
            event: 'message:send',
            message: 'Invalid message format'
          });
        }
        
        // Broadcast to all users in the channel
        safeBroadcast(io, `channel:${message.channelId}`, 'message:new', {
          ...message,
          user: socket.user,
          timestamp: new Date()
        });
        
        // Update user's last activity
        if (activeUsers.has(socket.user.id)) {
          const userData = activeUsers.get(socket.user.id);
          userData.lastActivity = new Date();
          activeUsers.set(socket.user.id, userData);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        safeEmit(socket, 'error', {
          event: 'message:send',
          message: 'Failed to send message'
        });
      }
    });

    // Handle message edit
    socket.on('message:edit', (message) => {
      try {
        if (!message || !message.id || !message.channelId || !message.content) {
          return safeEmit(socket, 'error', {
            event: 'message:edit',
            message: 'Invalid message format'
          });
        }
        
        safeBroadcast(io, `channel:${message.channelId}`, 'message:update', {
          ...message,
          user: socket.user,
          editedAt: new Date()
        });
        
        // Update user's last activity
        if (activeUsers.has(socket.user.id)) {
          const userData = activeUsers.get(socket.user.id);
          userData.lastActivity = new Date();
          activeUsers.set(socket.user.id, userData);
        }
      } catch (error) {
        console.error('Error editing message:', error);
        safeEmit(socket, 'error', {
          event: 'message:edit',
          message: 'Failed to edit message'
        });
      }
    });

    // Handle message delete
    socket.on('message:delete', (message) => {
      try {
        if (!message || !message.id || !message.channelId) {
          return safeEmit(socket, 'error', {
            event: 'message:delete',
            message: 'Invalid message format'
          });
        }
        
        safeBroadcast(io, `channel:${message.channelId}`, 'message:delete', {
          ...message,
          user: socket.user,
          deletedAt: new Date()
        });
        
        // Update user's last activity
        if (activeUsers.has(socket.user.id)) {
          const userData = activeUsers.get(socket.user.id);
          userData.lastActivity = new Date();
          activeUsers.set(socket.user.id, userData);
        }
      } catch (error) {
        console.error('Error deleting message:', error);
        safeEmit(socket, 'error', {
          event: 'message:delete',
          message: 'Failed to delete message'
        });
      }
    });

    // Handle typing indicators
    socket.on('typing:start', (channelId) => {
      try {
        socket.to(`channel:${channelId}`).emit('user:typing', {
          channelId,
          user: socket.user,
          isTyping: true,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error with typing indicator:', error);
      }
    });

    socket.on('typing:stop', (channelId) => {
      try {
        socket.to(`channel:${channelId}`).emit('user:typing', {
          channelId,
          user: socket.user,
          isTyping: false,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error with typing indicator:', error);
      }
    });

    // Handle status update
    socket.on('status:update', (status) => {
      try {
        // Validate status
        if (!['online', 'idle', 'dnd', 'offline'].includes(status)) {
          return safeEmit(socket, 'error', {
            event: 'status:update',
            message: 'Invalid status value'
          });
        }
        
        // Update in memory
        if (activeUsers.has(socket.user.id)) {
          const userData = activeUsers.get(socket.user.id);
          userData.status = status;
          userData.lastActivity = new Date();
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
          status,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error updating status:', error);
        safeEmit(socket, 'error', {
          event: 'status:update',
          message: 'Failed to update status'
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.username} (${socket.user.id})`);
      
      // Remove from active users
      activeUsers.delete(socket.user.id);
      
      // Broadcast updated user list
      safeBroadcast(io, 'presence', 'users:active', Array.from(activeUsers.values()));
      
      // Update user status to offline
      User.update(
        { status: 'offline' },
        { where: { id: socket.user.id } }
      ).catch(err => console.error('Error updating user status:', err));
    });
    
    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
    
    // Join presence channel for active users updates
    socket.join('presence');
  });
  
  // Set up a periodic check for inactive users (every 5 minutes)
  setInterval(() => {
    const now = new Date();
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutes in milliseconds
    
    activeUsers.forEach((userData, userId) => {
      const lastActivity = new Date(userData.lastActivity);
      const timeSinceActivity = now - lastActivity;
      
      // If user has been inactive for more than the threshold and is not already idle/offline
      if (timeSinceActivity > inactiveThreshold && userData.status === 'online') {
        // Update to idle status
        userData.status = 'idle';
        activeUsers.set(userId, userData);
        
        // Update in database
        User.update(
          { status: 'idle' },
          { where: { id: userId } }
        ).catch(err => console.error('Error updating user status to idle:', err));
        
        // Broadcast status change
        io.emit('user:status', {
          userId,
          status: 'idle',
          timestamp: new Date(),
          automatic: true
        });
      }
    });
  }, 5 * 60 * 1000); // Check every 5 minutes
};

module.exports = socketHandler;