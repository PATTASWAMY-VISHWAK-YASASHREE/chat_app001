/**
 * Frontend logger utility
 * Provides consistent logging with different log levels
 * Automatically disables debug logs in production
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// Determine minimum log level based on environment
const MIN_LOG_LEVEL = import.meta.env.PROD ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

// Style configurations for different log types
const LOG_STYLES = {
  DEBUG: 'color: #7f8c8d; font-weight: bold',
  INFO: 'color: #2ecc71; font-weight: bold',
  WARN: 'color: #f39c12; font-weight: bold',
  ERROR: 'color: #e74c3c; font-weight: bold',
};

/**
 * Log a debug message (only in development)
 * @param {string} message - The message to log
 * @param {any} data - Optional data to log
 */
export const debug = (message, data) => {
  if (LOG_LEVELS.DEBUG >= MIN_LOG_LEVEL) {
    if (data) {
      console.log(`%c[DEBUG] ${message}`, LOG_STYLES.DEBUG, data);
    } else {
      console.log(`%c[DEBUG] ${message}`, LOG_STYLES.DEBUG);
    }
  }
};

/**
 * Log an info message
 * @param {string} message - The message to log
 * @param {any} data - Optional data to log
 */
export const info = (message, data) => {
  if (LOG_LEVELS.INFO >= MIN_LOG_LEVEL) {
    if (data) {
      console.log(`%c[INFO] ${message}`, LOG_STYLES.INFO, data);
    } else {
      console.log(`%c[INFO] ${message}`, LOG_STYLES.INFO);
    }
  }
};

/**
 * Log a warning message
 * @param {string} message - The message to log
 * @param {any} data - Optional data to log
 */
export const warn = (message, data) => {
  if (LOG_LEVELS.WARN >= MIN_LOG_LEVEL) {
    if (data) {
      console.warn(`%c[WARN] ${message}`, LOG_STYLES.WARN, data);
    } else {
      console.warn(`%c[WARN] ${message}`, LOG_STYLES.WARN);
    }
  }
};

/**
 * Log an error message
 * @param {string} message - The message to log
 * @param {any} error - Optional error to log
 */
export const error = (message, err) => {
  if (LOG_LEVELS.ERROR >= MIN_LOG_LEVEL) {
    if (err) {
      console.error(`%c[ERROR] ${message}`, LOG_STYLES.ERROR, err);
    } else {
      console.error(`%c[ERROR] ${message}`, LOG_STYLES.ERROR);
    }
  }
};

export default {
  debug,
  info,
  warn,
  error,
};