/**
 * Configuration settings for Women Safety Analytics Backend
 */

module.exports = {
  // Server configuration
  PORT: process.env.PORT || 5000,
  HOST: '0.0.0.0',
  
  // SOS Alert settings
  NEARBY_RADIUS: parseInt(process.env.NEARBY_RADIUS) || 500, // meters
  SOS_ALERT_TIMEOUT: parseInt(process.env.SOS_ALERT_TIMEOUT) || 300000, // 5 minutes in ms
  
  // User management
  USER_CLEANUP_INTERVAL: 6 * 60 * 60 * 1000, // 6 hours in ms
  USER_MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours in ms
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'INFO',
  
  // Geographic bounds (optional validation)
  GEO_BOUNDS: {
    MIN_LATITUDE: -90,
    MAX_LATITUDE: 90,
    MIN_LONGITUDE: -180,
    MAX_LONGITUDE: 180
  },
  
  // Socket.IO settings
  SOCKET_CORS_ORIGINS: process.env.SOCKET_CORS_ORIGINS || "*",
  
  // API Rate limiting (if implemented)
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100
  },
  
  // Google Maps API
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyDIKbFTvAyZuB8CuFqSIEVEHmbqfDm6UD8',
  
  // Database settings (for future use)
  DATABASE_URL: process.env.DATABASE_URL || '',
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Security settings
  CORS_ORIGINS: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['*'],
  
  // Dashboard settings
  DASHBOARD_REFRESH_INTERVAL: 5000, // 5 seconds
  MAP_DEFAULT_ZOOM: 13,
  MAP_DEFAULT_CENTER: {
    lat: 40.7589,
    lng: -73.9851
  }
};
