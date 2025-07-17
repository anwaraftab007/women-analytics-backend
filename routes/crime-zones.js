const express = require('express');
const router = express.Router();
const { getCrimeData } = require('../utils/csvParser');
const logger = require('../utils/logger');

/**
 * GET /api/crime-zones
 * Return parsed crime location data from CSV
 * Query parameters:
 * - lat, lng, radius: filter crimes within radius (in meters) of given coordinates
 * - type: filter by crime type
 */
router.get('/crime-zones', (req, res) => {
  try {
    let crimeData = getCrimeData();
    
    if (!crimeData || crimeData.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        total: 0,
        message: 'No crime data available'
      });
    }
    
    const { lat, lng, radius, type } = req.query;
    
    // Filter by crime type if specified
    if (type) {
      crimeData = crimeData.filter(crime => 
        crime.type && crime.type.toLowerCase().includes(type.toLowerCase())
      );
    }
    
    // Filter by geographic proximity if coordinates and radius provided
    if (lat && lng && radius) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const searchRadius = parseFloat(radius);
      
      if (!isNaN(latitude) && !isNaN(longitude) && !isNaN(searchRadius)) {
        const { calculateDistance } = require('../utils/haversine');
        
        crimeData = crimeData.filter(crime => {
          const distance = calculateDistance(
            latitude, longitude,
            parseFloat(crime.latitude), parseFloat(crime.longitude)
          );
          return distance <= searchRadius;
        });
      }
    }
    
    logger.info(`Crime zones request processed: ${crimeData.length} results returned`);
    
    res.status(200).json({
      success: true,
      data: crimeData,
      total: crimeData.length,
      filters: {
        type: type || null,
        location: (lat && lng && radius) ? { lat, lng, radius } : null
      }
    });
    
  } catch (error) {
    logger.error('Error fetching crime zones:', error);
    res.status(500).json({
      error: 'Failed to fetch crime zones',
      message: 'Internal server error occurred while retrieving crime data'
    });
  }
});

/**
 * GET /api/crime-zones/stats
 * Return crime statistics
 */
router.get('/crime-zones/stats', (req, res) => {
  try {
    const crimeData = getCrimeData();
    
    if (!crimeData || crimeData.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        byType: {},
        message: 'No crime data available for statistics'
      });
    }
    
    // Calculate statistics
    const stats = {
      total: crimeData.length,
      byType: {},
      lastUpdated: new Date().toISOString()
    };
    
    // Count crimes by type
    crimeData.forEach(crime => {
      const crimeType = crime.type || 'Unknown';
      stats.byType[crimeType] = (stats.byType[crimeType] || 0) + 1;
    });
    
    logger.info('Crime statistics generated successfully');
    
    res.status(200).json({
      success: true,
      ...stats
    });
    
  } catch (error) {
    logger.error('Error generating crime statistics:', error);
    res.status(500).json({
      error: 'Failed to generate crime statistics',
      message: 'Internal server error occurred while calculating statistics'
    });
  }
});

module.exports = router;
