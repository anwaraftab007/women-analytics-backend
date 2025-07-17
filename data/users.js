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
  // NYC Area Users
  { username: 'Sarah_M', latitude: 40.7580, longitude: -73.9855, lastSeen: new Date().toISOString() },
  { username: 'Emma_K', latitude: 40.7520, longitude: -73.9860, lastSeen: new Date().toISOString() },
  { username: 'Jessica_L', latitude: 40.7610, longitude: -73.9840, lastSeen: new Date().toISOString() },
  { username: 'Amanda_R', latitude: 40.7490, longitude: -73.9857, lastSeen: new Date().toISOString() },
  { username: 'Michelle_T', latitude: 40.7530, longitude: -73.9880, lastSeen: new Date().toISOString() },
  { username: 'Lisa_H', latitude: 40.7560, longitude: -73.9870, lastSeen: new Date().toISOString() },
  { username: 'Rachel_B', latitude: 40.7500, longitude: -73.9900, lastSeen: new Date().toISOString() },
  { username: 'Nicole_W', latitude: 40.7570, longitude: -73.9830, lastSeen: new Date().toISOString() },
  
  // Lucknow Rajajipuram Area Volunteers
  { username: 'Priya_Sharma', latitude: 26.8553, longitude: 80.8805, lastSeen: new Date().toISOString() },
  { username: 'Anita_Gupta', latitude: 26.8565, longitude: 80.8820, lastSeen: new Date().toISOString() },
  { username: 'Meera_Singh', latitude: 26.8540, longitude: 80.8790, lastSeen: new Date().toISOString() },
  { username: 'Ritu_Agarwal', latitude: 26.8575, longitude: 80.8815, lastSeen: new Date().toISOString() },
  { username: 'Sunita_Verma', latitude: 26.8520, longitude: 80.8785, lastSeen: new Date().toISOString() },
  { username: 'Kavita_Yadav', latitude: 26.8590, longitude: 80.8825, lastSeen: new Date().toISOString() },
  { username: 'Neha_Mishra', latitude: 26.8510, longitude: 80.8775, lastSeen: new Date().toISOString() },
  { username: 'Pooja_Tiwari', latitude: 26.8580, longitude: 80.8810, lastSeen: new Date().toISOString() },
  { username: 'Deepika_Pandey', latitude: 26.8530, longitude: 80.8795, lastSeen: new Date().toISOString() },
  { username: 'Shweta_Dubey', latitude: 26.8560, longitude: 80.8800, lastSeen: new Date().toISOString() },
  
  // Punjab SLIET Longowal Area Volunteers
  { username: 'Simran_Kaur', latitude: 30.4726, longitude: 76.5269, lastSeen: new Date().toISOString() },
  { username: 'Jaspreet_Singh', latitude: 30.4735, longitude: 76.5280, lastSeen: new Date().toISOString() },
  { username: 'Manpreet_Kaur', latitude: 30.4718, longitude: 76.5255, lastSeen: new Date().toISOString() },
  { username: 'Harpreet_Singh', latitude: 30.4740, longitude: 76.5285, lastSeen: new Date().toISOString() },
  { username: 'Gurpreet_Kaur', latitude: 30.4710, longitude: 76.5250, lastSeen: new Date().toISOString() },
  { username: 'Rajveer_Singh', latitude: 30.4745, longitude: 76.5290, lastSeen: new Date().toISOString() },
  { username: 'Navjot_Kaur', latitude: 30.4705, longitude: 76.5245, lastSeen: new Date().toISOString() },
  { username: 'Sukhvir_Singh', latitude: 30.4750, longitude: 76.5295, lastSeen: new Date().toISOString() },
  { username: 'Jaskiran_Kaur', latitude: 30.4715, longitude: 76.5260, lastSeen: new Date().toISOString() },
  { username: 'Arshdeep_Singh', latitude: 30.4730, longitude: 76.5275, lastSeen: new Date().toISOString() }
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
