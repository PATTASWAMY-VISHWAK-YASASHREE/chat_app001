import api from './api';

const messageService = {
  // Get messages for a channel
  getMessages: async (channelId, limit = 50, offset = 0) => {
    const response = await api.get(`/channels/${channelId}/messages`, {
      params: { limit, offset }
    });
    return {
      messages: response.messages,
      hasMore: response.hasMore
    };
  },

  // Create a new message
  createMessage: async (channelId, messageData) => {
    const response = await api.post(`/channels/${channelId}/messages`, messageData);
    return response.message;
  },

  // Update a message
  updateMessage: async (messageId, messageData) => {
    const response = await api.put(`/messages/${messageId}`, messageData);
    return response.message;
  },

  // Delete a message
  deleteMessage: async (messageId) => {
    const response = await api.delete(`/messages/${messageId}`);
    return response.success;
  }
};

export default messageService;