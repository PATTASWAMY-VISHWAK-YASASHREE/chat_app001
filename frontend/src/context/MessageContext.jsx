import { createContext, useContext, useState, useEffect } from 'react';
import messageService from '../services/messageService';
import { useAuth } from './AuthContext';
import { useChannel } from './ChannelContext';
import { useSocket } from './SocketContext';

const MessageContext = createContext();

export const useMessage = () => useContext(MessageContext);

export const MessageProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  
  const { user } = useAuth();
  const { currentChannel } = useChannel();
  const { socket } = useSocket();

  // Fetch messages for the current channel
  const fetchMessages = async (channelId, limit = 50, offset = 0) => {
    if (!user || !channelId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await messageService.getMessages(channelId, limit, offset);
      
      if (offset === 0) {
        // First load or refresh
        setMessages(response.messages);
      } else {
        // Loading more messages (pagination)
        setMessages(prevMessages => [...response.messages, ...prevMessages]);
      }
      
      setHasMore(response.hasMore);
      return response.messages;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch messages');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  // Send a new message
  const sendMessage = async (channelId, content, attachment = null) => {
    try {
      setError(null);
      const newMessage = await messageService.createMessage(channelId, { content, attachment });
      
      // Optimistically add message to state
      setMessages(prevMessages => [...prevMessages, newMessage]);
      
      // Emit socket event
      if (socket) {
        socket.emit('message:send', newMessage);
      }
      
      return newMessage;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
      console.error('Error sending message:', err);
      throw err;
    }
  };

  // Update a message
  const updateMessage = async (messageId, content) => {
    try {
      setError(null);
      const updatedMessage = await messageService.updateMessage(messageId, { content });
      
      // Update message in state
      setMessages(prevMessages => 
        prevMessages.map(message => 
          message.id === updatedMessage.id ? updatedMessage : message
        )
      );
      
      // Emit socket event
      if (socket) {
        socket.emit('message:edit', updatedMessage);
      }
      
      return updatedMessage;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update message');
      console.error('Error updating message:', err);
      throw err;
    }
  };

  // Delete a message
  const deleteMessage = async (messageId) => {
    try {
      setError(null);
      await messageService.deleteMessage(messageId);
      
      // Remove message from state
      setMessages(prevMessages => 
        prevMessages.filter(message => message.id !== messageId)
      );
      
      // Emit socket event
      if (socket) {
        socket.emit('message:delete', { id: messageId });
      }
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete message');
      console.error('Error deleting message:', err);
      throw err;
    }
  };

  // Handle typing indicators
  const startTyping = (channelId) => {
    if (socket && channelId) {
      socket.emit('typing:start', channelId);
    }
  };

  const stopTyping = (channelId) => {
    if (socket && channelId) {
      socket.emit('typing:stop', channelId);
    }
  };

  // Fetch messages when channel changes
  useEffect(() => {
    if (currentChannel?.id) {
      fetchMessages(currentChannel.id);
      setTypingUsers({});
    } else {
      setMessages([]);
    }
  }, [currentChannel]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !currentChannel) return;

    // Handle new messages
    const handleNewMessage = (message) => {
      if (message.channelId === currentChannel.id) {
        setMessages(prevMessages => {
          // Check if message already exists to prevent duplicates
          const exists = prevMessages.some(m => m.id === message.id);
          if (exists) return prevMessages;
          return [...prevMessages, message];
        });
        
        // Clear typing indicator for the user who sent the message
        if (typingUsers[message.user.id]) {
          setTypingUsers(prev => {
            const updated = { ...prev };
            delete updated[message.user.id];
            return updated;
          });
        }
      }
    };

    // Handle updated messages
    const handleUpdateMessage = (updatedMessage) => {
      if (updatedMessage.channelId === currentChannel.id) {
        setMessages(prevMessages => 
          prevMessages.map(message => 
            message.id === updatedMessage.id ? updatedMessage : message
          )
        );
      }
    };

    // Handle deleted messages
    const handleDeleteMessage = (deletedMessage) => {
      if (deletedMessage.channelId === currentChannel.id) {
        setMessages(prevMessages => 
          prevMessages.filter(message => message.id !== deletedMessage.id)
        );
      }
    };

    // Handle typing indicators
    const handleTyping = ({ channelId, user, isTyping = true }) => {
      if (channelId === currentChannel.id && user.id !== socket.user?.id) {
        if (isTyping) {
          setTypingUsers(prev => ({ ...prev, [user.id]: user }));
          
          // Auto-clear typing indicator after 3 seconds
          setTimeout(() => {
            setTypingUsers(prev => {
              const updated = { ...prev };
              delete updated[user.id];
              return updated;
            });
          }, 3000);
        } else {
          setTypingUsers(prev => {
            const updated = { ...prev };
            delete updated[user.id];
            return updated;
          });
        }
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:update', handleUpdateMessage);
    socket.on('message:delete', handleDeleteMessage);
    socket.on('user:typing', handleTyping);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:update', handleUpdateMessage);
      socket.off('message:delete', handleDeleteMessage);
      socket.off('user:typing', handleTyping);
    };
  }, [socket, currentChannel, typingUsers]);

  const value = {
    messages,
    loading,
    error,
    hasMore,
    typingUsers,
    fetchMessages,
    sendMessage,
    updateMessage,
    deleteMessage,
    startTyping,
    stopTyping
  };

  return <MessageContext.Provider value={value}>{children}</MessageContext.Provider>;
};