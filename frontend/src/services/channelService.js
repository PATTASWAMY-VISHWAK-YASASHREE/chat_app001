import api from './api';

const channelService = {
  // Get all channels
  getChannels: async () => {
    const response = await api.get('/channels');
    return response.channels;
  },

  // Get channel by ID
  getChannelById: async (channelId) => {
    const response = await api.get(`/channels/${channelId}`);
    return response.channel;
  },

  // Create a new channel
  createChannel: async (channelData) => {
    const response = await api.post('/channels', channelData);
    return response.channel;
  },

  // Update a channel
  updateChannel: async (channelId, channelData) => {
    const response = await api.put(`/channels/${channelId}`, channelData);
    return response.channel;
  },

  // Delete a channel
  deleteChannel: async (channelId) => {
    const response = await api.delete(`/channels/${channelId}`);
    return response.success;
  }
};

export default channelService;