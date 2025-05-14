import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import channelService from '../services/channelService';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const ChannelContext = createContext();

export const useChannel = () => useContext(ChannelContext);

export const ChannelProvider = ({ children }) => {
  const [channels, setChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  // Fetch all channels
  const fetchChannels = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const fetchedChannels = await channelService.getChannels();
      setChannels(fetchedChannels);
      
      // If no current channel is selected and we have channels, select the first one
      if (!currentChannel && fetchedChannels.length > 0) {
        setCurrentChannel(fetchedChannels[0]);
        navigate(`/channels/${fetchedChannels[0].id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch channels');
      console.error('Error fetching channels:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get channel by ID
  const getChannelById = async (channelId) => {
    try {
      setLoading(true);
      setError(null);
      const channel = await channelService.getChannelById(channelId);
      setCurrentChannel(channel);
      return channel;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch channel');
      console.error('Error fetching channel:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create a new channel
  const createChannel = async (channelData) => {
    try {
      setLoading(true);
      setError(null);
      const newChannel = await channelService.createChannel(channelData);
      setChannels([newChannel, ...channels]);
      setCurrentChannel(newChannel);
      navigate(`/channels/${newChannel.id}`);
      return newChannel;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create channel');
      console.error('Error creating channel:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a channel
  const updateChannel = async (channelId, channelData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedChannel = await channelService.updateChannel(channelId, channelData);
      
      setChannels(channels.map(channel => 
        channel.id === updatedChannel.id ? updatedChannel : channel
      ));
      
      if (currentChannel?.id === updatedChannel.id) {
        setCurrentChannel(updatedChannel);
      }
      
      return updatedChannel;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update channel');
      console.error('Error updating channel:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a channel
  const deleteChannel = async (channelId) => {
    try {
      setLoading(true);
      setError(null);
      await channelService.deleteChannel(channelId);
      
      const updatedChannels = channels.filter(channel => channel.id !== channelId);
      setChannels(updatedChannels);
      
      if (currentChannel?.id === channelId) {
        if (updatedChannels.length > 0) {
          setCurrentChannel(updatedChannels[0]);
          navigate(`/channels/${updatedChannels[0].id}`);
        } else {
          setCurrentChannel(null);
          navigate('/');
        }
      }
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete channel');
      console.error('Error deleting channel:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Join a channel (for socket.io)
  const joinChannel = (channelId) => {
    if (socket && channelId) {
      socket.emit('channel:join', channelId);
    }
  };

  // Leave a channel (for socket.io)
  const leaveChannel = (channelId) => {
    if (socket && channelId) {
      socket.emit('channel:leave', channelId);
    }
  };

  // Set current channel and join it
  const selectChannel = (channel) => {
    if (currentChannel?.id) {
      leaveChannel(currentChannel.id);
    }
    
    setCurrentChannel(channel);
    joinChannel(channel.id);
    navigate(`/channels/${channel.id}`);
  };

  // Fetch channels when user changes
  useEffect(() => {
    if (user) {
      fetchChannels();
    } else {
      setChannels([]);
      setCurrentChannel(null);
    }
  }, [user]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Handle channel updates from other users
    const handleChannelUpdate = (updatedChannel) => {
      setChannels(channels.map(channel => 
        channel.id === updatedChannel.id ? updatedChannel : channel
      ));
      
      if (currentChannel?.id === updatedChannel.id) {
        setCurrentChannel(updatedChannel);
      }
    };

    socket.on('channel:update', handleChannelUpdate);

    return () => {
      socket.off('channel:update', handleChannelUpdate);
    };
  }, [socket, channels, currentChannel]);

  const value = {
    channels,
    currentChannel,
    loading,
    error,
    fetchChannels,
    getChannelById,
    createChannel,
    updateChannel,
    deleteChannel,
    selectChannel,
    joinChannel,
    leaveChannel
  };

  return <ChannelContext.Provider value={value}>{children}</ChannelContext.Provider>;
};