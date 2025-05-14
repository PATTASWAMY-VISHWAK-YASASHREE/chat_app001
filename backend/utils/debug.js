const debug = require('debug');

/**
 * Create namespaced debug functions for different parts of the application
 * Usage: 
 * const { debugDB } = require('../utils/debug');
 * debugDB('Query executed: %o', queryObject);
 */

// Database operations debugging
const debugDB = debug('discord-clone:db');

// Authentication debugging
const debugAuth = debug('discord-clone:auth');

// Socket.IO debugging
const debugSocket = debug('discord-clone:socket');

// API routes debugging
const debugAPI = debug('discord-clone:api');

// General application debugging
const debugApp = debug('discord-clone:app');

module.exports = {
  debugDB,
  debugAuth,
  debugSocket,
  debugAPI,
  debugApp
};