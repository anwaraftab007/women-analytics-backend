const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const logger = require('./logger');

// In-memory storage for crime data
let crimeData = [];
let isDataLoaded = false;

/**
 * Load and parse crime data from CSV file
 * Expected CSV format: latitude,longitude,type
 */
async function loadCrimeData() {
  return new Promise((resolve, reject) => {
    const csvPath = path.join(__dirname, '..', 'data', 'crime-data.csv');
    const results = [];
    
    // Check if file exists
    if (!fs.existsSync(csvPath)) {
      logger.warn(`Crime data CSV file not found at ${csvPath}`);
      crimeData = [];
      isDataLoaded = true;
      return resolve([]);
    }
    
    fs.createReadStream(csvPath)
      .pipe(csvParser())
      .on('data', (row) => {
        try {
          // Parse and validate row data
          const latitude = parseFloat(row.latitude);
          const longitude = parseFloat(row.longitude);
          const type = row.type ? row.type.trim() : 'Unknown';
          
          // Validate coordinates
          if (!isNaN(latitude) && !isNaN(longitude) && 
              latitude >= -90 && latitude <= 90 && 
              longitude >= -180 && longitude <= 180) {
            
            results.push({
              id: `crime_${results.length + 1}`,
              latitude,
              longitude,
              type,
              raw: row // Keep original row for debugging
            });
          } else {
            logger.warn('Invalid crime data row skipped:', row);
          }
        } catch (error) {
          logger.warn('Error parsing crime data row:', { row, error: error.message });
        }
      })
      .on('end', () => {
        crimeData = results;
        isDataLoaded = true;
        logger.info(`Crime data loaded successfully: ${results.length} records`);
        resolve(results);
      })
      .on('error', (error) => {
        logger.error('Error reading crime data CSV:', error);
        crimeData = [];
        isDataLoaded = true;
        reject(error);
      });
  });
}

/**
 * Get loaded crime data
 * @returns {Array} Array of crime data objects
 */
function getCrimeData() {
  if (!isDataLoaded) {
    logger.warn('Crime data not yet loaded, returning empty array');
    return [];
  }
  return crimeData;
}

/**
 * Filter crime data by type
 * @param {string} crimeType - Type of crime to filter by
 * @returns {Array} Filtered crime data
 */
function getCrimesByType(crimeType) {
  return crimeData.filter(crime => 
    crime.type.toLowerCase().includes(crimeType.toLowerCase())
  );
}

/**
 * Get crime data within a specific geographic area
 * @param {number} centerLat - Center latitude
 * @param {number} centerLng - Center longitude
 * @param {number} radius - Radius in meters
 * @returns {Array} Crime data within the specified area
 */
function getCrimesInArea(centerLat, centerLng, radius) {
  const { calculateDistance } = require('./haversine');
  
  return crimeData.filter(crime => {
    const distance = calculateDistance(
      centerLat, centerLng,
      crime.latitude, crime.longitude
    );
    return distance <= radius;
  });
}

/**
 * Get crime statistics
 * @returns {Object} Statistics about crime data
 */
function getCrimeStats() {
  const stats = {
    total: crimeData.length,
    byType: {},
    loaded: isDataLoaded
  };
  
  // Count crimes by type
  crimeData.forEach(crime => {
    const type = crime.type || 'Unknown';
    stats.byType[type] = (stats.byType[type] || 0) + 1;
  });
  
  return stats;
}

/**
 * Reload crime data from CSV
 * @returns {Promise} Promise that resolves when data is reloaded
 */
async function reloadCrimeData() {
  logger.info('Reloading crime data...');
  isDataLoaded = false;
  return loadCrimeData();
}

module.exports = {
  loadCrimeData,
  getCrimeData,
  getCrimesByType,
  getCrimesInArea,
  getCrimeStats,
  reloadCrimeData
};
