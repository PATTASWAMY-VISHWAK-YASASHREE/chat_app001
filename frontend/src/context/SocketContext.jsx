import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const { user, logout } = useAuth();

  // Initialize socket connection when user logs in
  useEffect(() => {
    let socketInstance = null;

    if (user) {
      const token = localStorage.getItem('token');
      
      // Create socket connection
      socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      // Set up event listeners
      socketInstance.on('connect', () => {
        console.log('Socket connected');
        socketInstance.user = user;
      });

      socketInstance.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
        
        // If authentication error, logout user
        if (err.message.includes('Authentication error')) {
          logout();
        }
      });

      socketInstance.on('users:active', (users) => {
        setActiveUsers(users);
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      setSocket(socketInstance);
    }

    // Cleanup on unmount or when user logs out
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
        setSocket(null);
      }
    };
  }, [user, logout]);

  // Update user status
  const updateStatus = (status) => {
    if (socket) {
      socket.emit('status:update', status);
    }
  };

  const value = {
    socket,
    activeUsers,
    updateStatus
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};