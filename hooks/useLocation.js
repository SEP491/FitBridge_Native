import { useLocationContext } from "../context/LocationContext";

/**
 * Updated useLocation hook that works with LocationContext
 * This provides backward compatibility with your existing code
 * while using the new improved location management system
 */
export const useLocation = () => {
  const {
    location,
    loading,
    error,
    permissionStatus,
    isFirstTime,
    requestLocationPermission,
    refreshLocation,
    initializeLocation,
    coordinates,
    hasLocation,
    hasPermission,
  } = useLocationContext();

  // Backward compatibility methods
  const getCachedLocation = async () => {
    // Since we're no longer using persistent cache,
    // return current location if available
    return location;
  };

  return {
    // Core state
    location,
    loading,
    error,
    permissionStatus,

    // Additional state from new context
    isFirstTime,
    coordinates,
    hasLocation,
    hasPermission,

    // Methods (maintains backward compatibility)
    requestLocationPermission: () => requestLocationPermission(true),
    getCurrentLocation: refreshLocation, // Use refreshLocation for getCurrentLocation
    getCachedLocation,
    initializeLocation,

    // New methods
    refreshLocation,
  };
};

export default useLocation;
