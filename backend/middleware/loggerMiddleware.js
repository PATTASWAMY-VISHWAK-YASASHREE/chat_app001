const morgan = require('morgan');
const logger = require('../utils/logger');

// Create a stream object with a 'write' function that will be used by morgan
const stream = {
  write: (message) => logger.http(message.trim()),
};

// Build the morgan middleware
const loggerMiddleware = morgan(
  // Define message format string
  ':remote-addr :method :url :status :res[content-length] - :response-time ms',
  { stream }
);

module.exports = loggerMiddleware;