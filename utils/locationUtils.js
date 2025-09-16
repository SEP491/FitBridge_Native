import * as Location from "expo-location";
import { Alert } from "react-native";

// Constants
const LOCATION_TIMEOUT = 15000; // 15 seconds
const FALLBACK_LOCATION_DURATION = 600000; // 10 minutes

/**
 * Request location permission with custom options
 * @param {Object} options - Permission request options
 * @param {string} options.title - Alert title
 * @param {string} options.message - Alert message
 * @returns {Promise<boolean>} Whether permission was granted
 */
export const requestLocationPermission = async (options = {}) => {
  const {
    title = "Location Permission Required",
    message = "This app needs your location to show nearby gyms. Please enable location permissions in your device settings.",
  } = options;

  try {
    console.log("🔍 Checking location permissions...");

    const { status } = await Location.getForegroundPermissionsAsync();
    console.log("📱 Current permission status:", status);

    if (status !== "granted") {
      console.log("🔒 Requesting location permissions...");
      const { status: newStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (newStatus !== "granted") {
        Alert.alert(title, message, [
          { text: "Cancel", style: "cancel" },
          {
            text: "OK",
            onPress: () =>
              console.log("User acknowledged permission requirement"),
          },
        ]);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("❌ Error checking location permissions:", error);
    return false;
  }
};

/**
 * Gets current location with specified accuracy
 * @param {Object} options - Location options
 * @param {number} options.accuracy - Location accuracy (default: Balanced)
 * @param {number} options.timeout - Request timeout in ms (default: 15000)
 * @returns {Promise<Object|null>} Location object or null if failed
 */
export const getCurrentLocation = async (options = {}) => {
  const { accuracy = Location.Accuracy.Balanced, timeout = LOCATION_TIMEOUT } =
    options;

  try {
    console.log("📡 Getting current location...");

    const location = await Location.getCurrentPositionAsync({
      accuracy,
      timeout,
    });

    console.log("✅ Current location obtained:", location.coords);
    return location;
  } catch (error) {
    console.error("❌ Error getting current location:", error);
    return null;
  }
};

/**
 * Gets last known location as fallback
 * @param {Object} options - Options for last known location
 * @param {number} options.maxAge - Maximum age of last known location in ms (default: 10 minutes)
 * @returns {Promise<Object|null>} Last known location or null if failed
 */
export const getLastKnownLocation = async (options = {}) => {
  const { maxAge = FALLBACK_LOCATION_DURATION } = options;

  try {
    console.log("🔄 Trying to get last known location...");

    const lastKnownLocation = await Location.getLastKnownPositionAsync({
      maxAge,
    });

    if (lastKnownLocation) {
      console.log("📍 Using last known location:", lastKnownLocation.coords);
      return lastKnownLocation;
    }

    console.log("❌ No last known location available");
    return null;
  } catch (error) {
    console.error("❌ Error getting last known location:", error);
    return null;
  }
};

/**
 * Gets user location with permission check and fallback mechanisms
 * @param {Object} options - Options for location fetching
 * @param {Object} options.permissionOptions - Options for permission request
 * @param {Object} options.locationOptions - Options for location request
 * @returns {Promise<Object|null>} User location or null if failed
 */
export const getUserLocation = async (options = {}) => {
  const { permissionOptions = {}, locationOptions = {} } = options;

  try {
    // Check permissions first
    const hasPermission = await requestLocationPermission(permissionOptions);
    if (!hasPermission) {
      console.log("❌ Location permission denied");
      return null;
    }

    // Get fresh location
    console.log("🔄 Getting fresh location...");
    const location = await getCurrentLocation(locationOptions);

    if (location) {
      return location;
    }

    // Try last known location as fallback
    const lastKnownLocation = await getLastKnownLocation();
    if (lastKnownLocation) {
      return lastKnownLocation;
    }

    return null;
  } catch (error) {
    console.error("❌ Error in getUserLocation:", error);
    return null;
  }
};

/**
 * Refreshes user location with high accuracy
 * @param {Object} options - Options for location refresh
 * @param {Object} options.permissionOptions - Options for permission request
 * @param {Function} options.onSuccess - Success callback
 * @param {Function} options.onError - Error callback
 * @returns {Promise<Object|null>} Refreshed location or null if failed
 */
export const refreshUserLocation = async (options = {}) => {
  const {
    permissionOptions = {
      title: "Location Permission Required",
      message: "Please enable location permissions to refresh your location.",
    },
    onSuccess,
    onError,
  } = options;

  try {
    console.log("🔄 Manually refreshing location...");

    const hasPermission = await requestLocationPermission(permissionOptions);
    if (!hasPermission) {
      const error = new Error("Location permission denied");
      onError?.(error);
      return null;
    }

    const location = await getCurrentLocation({
      accuracy: Location.Accuracy.High,
      timeout: LOCATION_TIMEOUT,
    });

    if (location) {
      console.log("✅ Location refreshed:", location.coords);
      onSuccess?.(location);
      return location;
    } else {
      const error = new Error("Failed to get location");
      onError?.(error);
      return null;
    }
  } catch (error) {
    console.error("❌ Error refreshing location:", error);
    onError?.(error);
    return null;
  }
};

/**
 * Calculate distance between two coordinates in kilometers
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
 * Convert degrees to radians
 * @param {number} deg - Degrees
 * @returns {number} Radians
 */
const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

/**
 * Helper function to validate coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} Whether coordinates are valid
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
 * Format coordinates for display
 * @param {Object} coords - Coordinates object with latitude and longitude
 * @param {number} precision - Number of decimal places (default: 6)
 * @returns {string} Formatted coordinates string
 */
export const formatCoordinates = (coords, precision = 6) => {
  if (!coords || !isValidCoordinate(coords.latitude, coords.longitude)) {
    return "Invalid coordinates";
  }

  return `${coords.latitude.toFixed(precision)}, ${coords.longitude.toFixed(
    precision
  )}`;
};

/**
 * Get human-readable accuracy description
 * @param {number} accuracy - Accuracy in meters
 * @returns {string} Human-readable accuracy description
 */
export const getAccuracyDescription = (accuracy) => {
  if (!accuracy) return "Unknown accuracy";

  if (accuracy <= 5) return "Very High accuracy";
  if (accuracy <= 10) return "High accuracy";
  if (accuracy <= 100) return "Good accuracy";
  if (accuracy <= 1000) return "Low accuracy";
  return "Very low accuracy";
};
