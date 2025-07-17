/**
 * Simple logging utility for the Women Safety Analytics backend
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const LOG_COLORS = {
  ERROR: '\x1b[31m', // Red
  WARN: '\x1b[33m',  // Yellow
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[37m', // White
  RESET: '\x1b[0m'   // Reset
};

class Logger {
  constructor() {
    this.level = process.env.LOG_LEVEL || 'INFO';
    this.minLevel = LOG_LEVELS[this.level.toUpperCase()] || LOG_LEVELS.INFO;
  }

  /**
   * Format timestamp for log entries
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Format log message with timestamp, level, and content
   */
  formatMessage(level, message, data = null) {
    const timestamp = this.getTimestamp();
    const color = LOG_COLORS[level] || LOG_COLORS.RESET;
    const reset = LOG_COLORS.RESET;
    
    let formattedMessage = `${color}[${timestamp}] ${level}:${reset} ${message}`;
    
    if (data) {
      if (typeof data === 'object') {
        formattedMessage += `\n${JSON.stringify(data, null, 2)}`;
      } else {
        formattedMessage += ` ${data}`;
      }
    }
    
    return formattedMessage;
  }

  /**
   * Log at specified level
   */
  log(level, message, data = null) {
    const levelValue = LOG_LEVELS[level];
    
    if (levelValue <= this.minLevel) {
      const formattedMessage = this.formatMessage(level, message, data);
      
      if (level === 'ERROR') {
        console.error(formattedMessage);
      } else if (level === 'WARN') {
        console.warn(formattedMessage);
      } else {
        console.log(formattedMessage);
      }
    }
  }

  /**
   * Log error messages
   */
  error(message, data = null) {
    this.log('ERROR', message, data);
  }

  /**
   * Log warning messages
   */
  warn(message, data = null) {
    this.log('WARN', message, data);
  }

  /**
   * Log info messages
   */
  info(message, data = null) {
    this.log('INFO', message, data);
  }

  /**
   * Log debug messages
   */
  debug(message, data = null) {
    this.log('DEBUG', message, data);
  }

  /**
   * Log SOS-specific events
   */
  logSOS(username, latitude, longitude, nearbyCount = 0) {
    this.info(`SOS ALERT`, {
      username,
      location: { latitude, longitude },
      nearbyUsers: nearbyCount,
      timestamp: this.getTimestamp()
    });
  }

  /**
   * Log API request
   */
  logRequest(method, path, statusCode, responseTime = null) {
    const data = {
      method,
      path,
      statusCode,
      ...(responseTime && { responseTime: `${responseTime}ms` })
    };
    
    if (statusCode >= 400) {
      this.warn('API Request', data);
    } else {
      this.info('API Request', data);
    }
  }

  /**
   * Log socket connections
   */
  logSocket(event, socketId, data = null) {
    this.info(`Socket ${event}`, {
      socketId,
      timestamp: this.getTimestamp(),
      ...(data && { data })
    });
  }
}

// Create singleton logger instance
const logger = new Logger();

module.exports = logger;
