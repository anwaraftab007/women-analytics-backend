/**
 * Haversine formula implementation for calculating distances between two points on Earth
 * Given latitude and longitude coordinates
 */

/**
 * Calculate the great circle distance between two points on Earth
 * @param {number} lat1 - Latitude of first point in decimal degrees
 * @param {number} lng1 - Longitude of first point in decimal degrees
 * @param {number} lat2 - Latitude of second point in decimal degrees
 * @param {number} lng2 - Longitude of second point in decimal degrees
 * @returns {number} Distance in meters
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  // Earth's radius in meters
  const EARTH_RADIUS = 6371000;
  
  // Convert degrees to radians
  const lat1Rad = toRadians(lat1);
  const lng1Rad = toRadians(lng1);
  const lat2Rad = toRadians(lat2);
  const lng2Rad = toRadians(lng2);
  
  // Calculate differences
  const deltaLat = lat2Rad - lat1Rad;
  const deltaLng = lng2Rad - lng1Rad;
  
  // Haversine formula
  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
           Math.cos(lat1Rad) * Math.cos(lat2Rad) *
           Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  // Calculate distance
  const distance = EARTH_RADIUS * c;
  
  return Math.round(distance); // Round to nearest meter
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 */
function toDegrees(radians) {
  return radians * (180 / Math.PI);
}

/**
 * Calculate bearing from point 1 to point 2
 * @param {number} lat1 - Latitude of first point in decimal degrees
 * @param {number} lng1 - Longitude of first point in decimal degrees
 * @param {number} lat2 - Latitude of second point in decimal degrees
 * @param {number} lng2 - Longitude of second point in decimal degrees
 * @returns {number} Bearing in degrees (0-360)
 */
function calculateBearing(lat1, lng1, lat2, lng2) {
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);
  const deltaLngRad = toRadians(lng2 - lng1);
  
  const y = Math.sin(deltaLngRad) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
           Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(deltaLngRad);
  
  const bearingRad = Math.atan2(y, x);
  const bearingDeg = toDegrees(bearingRad);
  
  // Normalize to 0-360 degrees
  return (bearingDeg + 360) % 360;
}

/**
 * Check if a point is within a given radius of another point
 * @param {number} centerLat - Latitude of center point
 * @param {number} centerLng - Longitude of center point
 * @param {number} pointLat - Latitude of point to check
 * @param {number} pointLng - Longitude of point to check
 * @param {number} radius - Radius in meters
 * @returns {boolean} True if point is within radius
 */
function isWithinRadius(centerLat, centerLng, pointLat, pointLng, radius) {
  const distance = calculateDistance(centerLat, centerLng, pointLat, pointLng);
  return distance <= radius;
}

module.exports = {
  calculateDistance,
  calculateBearing,
  isWithinRadius,
  toRadians,
  toDegrees
};
