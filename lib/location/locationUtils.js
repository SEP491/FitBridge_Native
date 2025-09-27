/**
 * Location utility functions for distance calculations and coordinate validation
 */

/**
 * Convert degrees to radians
 * @param {number} deg - Degree value to convert
 * @returns {number} Radian value
 */
const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

/**
 * Calculate the distance between two geographic coordinates using the Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

/**
 * Validate if coordinates are within valid ranges
 * @param {number} lat - Latitude value
 * @param {number} lng - Longitude value
 * @returns {boolean} True if coordinates are valid
 */
export const isValidCoordinate = (lat, lng) => {
  return (
    lat !== undefined &&
    lng !== undefined &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

/**
 * Filter gyms by distance from a given coordinate
 * @param {Array} gyms - Array of gym objects with latitude and longitude properties
 * @param {Object} coords - Current coordinates {latitude, longitude}
 * @param {number} radius - Maximum distance in kilometers (default: 5)
 * @returns {Array} Filtered and sorted array of nearby gyms
 */
export const filterGymsByDistance = (gyms, coords, radius = 5) => {
  if (!coords || !Array.isArray(gyms)) return [];

  const radiusInKm = parseFloat(radius);
  if (isNaN(radiusInKm)) return [];

  const nearbyGyms = gyms.filter((gym) => {
    if (!isValidCoordinate(gym.latitude, gym.longitude)) return false;

    const distance = calculateDistance(
      coords.latitude,
      coords.longitude,
      gym.latitude,
      gym.longitude
    );

    // Add distance property to gym object for sorting and display
    gym.distance = distance;
    return distance <= radiusInKm;
  });

  // Sort by distance (closest first)
  nearbyGyms.sort((a, b) => a.distance - b.distance);
  return nearbyGyms;
};
