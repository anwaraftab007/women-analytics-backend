const express = require('express');
const router = express.Router();
const { calculateDistance } = require('../utils/haversine');
const { findNearbyUsers, addUser } = require('../data/users');
const logger = require('../utils/logger');
const { NEARBY_RADIUS } = require('../config/settings');

/**
 * POST /api/sos
 * Handle SOS alert from React Native app
 * Body: { username, latitude, longitude }
 */
router.post('/sos', async (req, res) => {
  try {
    const { username, latitude, longitude } = req.body;
    
    // Validate required fields
    if (!username || !latitude || !longitude) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['username', 'latitude', 'longitude']
      });
    }
    
    // Validate coordinates
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        error: 'Invalid coordinates',
        message: 'Latitude must be between -90 and 90, longitude between -180 and 180'
      });
    }
    
    const timestamp = new Date().toISOString();
    
    // Create SOS alert object
    const sosAlert = {
      id: `sos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username,
      latitude: lat,
      longitude: lng,
      timestamp,
      type: 'SOS_ALERT'
    };
    
    // Find nearby users within configurable radius
    const nearbyUsers = findNearbyUsers(lat, lng, NEARBY_RADIUS);
    
    logger.info(`SOS Alert received from ${username} at [${lat}, ${lng}], found ${nearbyUsers.length} nearby users`);
    
    // Emit real-time alert to dashboard
    if (req.dashboardSockets && req.dashboardSockets.size > 0) {
      const dashboardPayload = {
        alert: sosAlert,
        nearbyUsers: nearbyUsers.map(user => ({
          username: user.username,
          latitude: user.latitude,
          longitude: user.longitude,
          distance: calculateDistance(lat, lng, user.latitude, user.longitude)
        }))
      };
      
      req.dashboardSockets.forEach(socket => {
        socket.emit('sos-alert', dashboardPayload);
      });
      
      logger.info(`SOS alert broadcasted to ${req.dashboardSockets.size} dashboard connections`);
    }
    
    // Add/update user location in our system
    addUser({
      username,
      latitude: lat,
      longitude: lng,
      lastSeen: timestamp
    });
    
    // Respond with alert confirmation and nearby users
    res.status(200).json({
      success: true,
      message: 'SOS alert processed successfully',
      alert: sosAlert,
      nearbyUsers: nearbyUsers.map(user => ({
        username: user.username,
        distance: calculateDistance(lat, lng, user.latitude, user.longitude),
        lastSeen: user.lastSeen
      })),
      dashboardNotified: req.dashboardSockets ? req.dashboardSockets.size > 0 : false
    });
    
  } catch (error) {
    logger.error('Error processing SOS alert:', error);
    res.status(500).json({
      error: 'Failed to process SOS alert',
      message: 'Internal server error occurred while processing your emergency request'
    });
  }
});

/**
 * GET /api/sos/test
 * Test endpoint to simulate SOS alert for development
 */
router.get('/sos/test', (req, res) => {
  const testAlert = {
    username: 'TestUser',
    latitude: 40.7128,
    longitude: -74.0060,
    timestamp: new Date().toISOString()
  };
  
  // Simulate SOS alert
  req.body = testAlert;
  
  // Forward to SOS handler
  router.handle(req, res);
});

module.exports = router;
