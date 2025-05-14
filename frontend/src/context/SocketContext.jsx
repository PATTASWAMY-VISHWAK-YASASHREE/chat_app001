import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import logger from '../utils/logger';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Only connect socket if user is authenticated
    if (!isAuthenticated || !user) {
      return;
    }

    logger.info('Initializing socket connection');
    
    // Create socket connection
    const socketInstance = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    // Socket event listeners
    socketInstance.on('connect', () => {
      logger.info('Socket connected');
      setConnected(true);
    });

    socketInstance.on('disconnect', (reason) => {
      logger.warn(`Socket disconnected: ${reason}`);
      setConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      logger.error('Socket connection error:', error);
      setConnected(false);
    });

    // Debug events in development
    if (import.meta.env.DEV) {
      socketInstance.onAny((event, ...args) => {
        logger.debug(`Socket event: ${event}`, args);
      });
    }

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      logger.info('Cleaning up socket connection');
      socketInstance.disconnect();
    };
  }, [isAuthenticated, user]);

  // Join a channel
  const joinChannel = (channelId) => {
    if (socket && connected) {
      logger.debug(`Joining channel: ${channelId}`);
      socket.emit('channel:join', { channelId });
    }
  };

  // Leave a channel
  const leaveChannel = (channelId) => {
    if (socket && connected) {
      logger.debug(`Leaving channel: ${channelId}`);
      socket.emit('channel:leave', { channelId });
    }
  };

  // Send a message
  const sendMessage = (channelId, content, attachment = null) => {
    if (socket && connected) {
      logger.debug(`Sending message to channel: ${channelId}`);
      socket.emit('message:send', { channelId, content, attachment });
    }
  };

  // Start typing indicator
  const startTyping = (channelId) => {
    if (socket && connected) {
      socket.emit('typing:start', { channelId });
    }
  };

  // Stop typing indicator
  const stopTyping = (channelId) => {
    if (socket && connected) {
      socket.emit('typing:stop', { channelId });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        joinChannel,
        leaveChannel,
        sendMessage,
        startTyping,
        stopTyping
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;