/**
 * In-memory user data management for Women Safety Analytics
 * This simulates a user database for finding nearby users during SOS alerts
 */

const { calculateDistance } = require('../utils/haversine');
const logger = require('../utils/logger');

// In-memory user storage
let users = new Map();

/**
 * Mock user data for demonstration
 * In a real application, this would come from your actual user database
 */
const mockUsers = [
  { username: 'Sarah_M', latitude: 40.7580, longitude: -73.9855, lastSeen: new Date().toISOString() },
  { username: 'Emma_K', latitude: 40.7520, longitude: -73.9860, lastSeen: new Date().toISOString() },
  { username: 'Jessica_L', latitude: 40.7610, longitude: -73.9840, lastSeen: new Date().toISOString() },
  { username: 'Amanda_R', latitude: 40.7490, longitude: -73.9857, lastSeen: new Date().toISOString() },
  { username: 'Michelle_T', latitude: 40.7530, longitude: -73.9880, lastSeen: new Date().toISOString() },
  { username: 'Lisa_H', latitude: 40.7560, longitude: -73.9870, lastSeen: new Date().toISOString() },
  { username: 'Rachel_B', latitude: 40.7500, longitude: -73.9900, lastSeen: new Date().toISOString() },
  { username: 'Nicole_W', latitude: 40.7570, longitude: -73.9830, lastSeen: new Date().toISOString() }
];

/**
 * Initialize user data
 */
function initializeUsers() {
  mockUsers.forEach(user => {
    users.set(user.username, user);
  });
  logger.info(`Initialized ${users.size} mock users for nearby detection`);
}

/**
 * Add or update a user's location
 * @param {Object} userData - User data object
 * @param {string} userData.username - Username
 * @param {number} userData.latitude - User's latitude
 * @param {number} userData.longitude - User's longitude
 * @param {string} userData.lastSeen - Last seen timestamp
 */
function addUser(userData) {
  const { username, latitude, longitude, lastSeen } = userData;
  
  if (!username || !latitude || !longitude) {
    logger.warn('Invalid user data provided to addUser:', userData);
    return false;
  }
  
  const user = {
    username,
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    lastSeen: lastSeen || new Date().toISOString()
  };
  
  users.set(username, user);
  logger.debug(`User ${username} location updated: [${latitude}, ${longitude}]`);
  return true;
}

/**
 * Find users near a given location within specified radius
 * @param {number} latitude - Center latitude
 * @param {number} longitude - Center longitude
 * @param {number} radius - Search radius in meters
 * @param {string} excludeUser - Username to exclude from results (usually the SOS sender)
 * @returns {Array} Array of nearby users with distance information
 */
function findNearbyUsers(latitude, longitude, radius, excludeUser = null) {
  const nearbyUsers = [];
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  
  if (isNaN(lat) || isNaN(lng)) {
    logger.warn('Invalid coordinates provided to findNearbyUsers');
    return nearbyUsers;
  }
  
  users.forEach((user, username) => {
    // Skip excluded user (typically the SOS sender)
    if (excludeUser && username === excludeUser) {
      return;
    }
    
    // Skip users with invalid coordinates
    if (isNaN(user.latitude) || isNaN(user.longitude)) {
      return;
    }
    
    const distance = calculateDistance(lat, lng, user.latitude, user.longitude);
    
    if (distance <= radius) {
      nearbyUsers.push({
        ...user,
        distance
      });
    }
  });
  
  // Sort by distance (closest first)
  nearbyUsers.sort((a, b) => a.distance - b.distance);
  
  logger.debug(`Found ${nearbyUsers.length} users within ${radius}m of [${lat}, ${lng}]`);
  return nearbyUsers;
}

/**
 * Get a user by username
 * @param {string} username - Username to find
 * @returns {Object|null} User object or null if not found
 */
function getUser(username) {
  return users.get(username) || null;
}

/**
 * Get all users
 * @returns {Array} Array of all users
 */
function getAllUsers() {
  return Array.from(users.values());
}

/**
 * Remove a user
 * @param {string} username - Username to remove
 * @returns {boolean} True if user was removed, false if not found
 */
function removeUser(username) {
  const removed = users.delete(username);
  if (removed) {
    logger.debug(`User ${username} removed from system`);
  }
  return removed;
}

/**
 * Get user count
 * @returns {number} Number of users in system
 */
function getUserCount() {
  return users.size;
}

/**
 * Clean up old users (older than specified time)
 * @param {number} maxAgeMs - Maximum age in milliseconds
 * @returns {number} Number of users removed
 */
function cleanupOldUsers(maxAgeMs = 24 * 60 * 60 * 1000) { // Default: 24 hours
  const now = new Date();
  let removedCount = 0;
  
  users.forEach((user, username) => {
    const lastSeen = new Date(user.lastSeen);
    const age = now - lastSeen;
    
    if (age > maxAgeMs) {
      users.delete(username);
      removedCount++;
    }
  });
  
  if (removedCount > 0) {
    logger.info(`Cleaned up ${removedCount} old users`);
  }
  
  return removedCount;
}

// Initialize on module load
initializeUsers();

// Periodic cleanup of old users (every 6 hours)
setInterval(() => {
  cleanupOldUsers();
}, 6 * 60 * 60 * 1000);

module.exports = {
  addUser,
  findNearbyUsers,
  getUser,
  getAllUsers,
  removeUser,
  getUserCount,
  cleanupOldUsers,
  initializeUsers
};
