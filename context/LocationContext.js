import React, { createContext, useContext, useState, useEffect } from "react";
import { Alert, AppState } from "react-native";
import * as Location from "expo-location";

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);

  // Request location permission
  const requestLocationPermission = async () => {
    try {
      // console.log("🔍 Checking location permissions...");

      const { status: existingStatus } =
        await Location.getForegroundPermissionsAsync();
      console.log("📱 Current permission status:", existingStatus);

      if (existingStatus === "granted") {
        setPermissionStatus("granted");
        return true;
      }

      if (existingStatus === "denied") {
        setPermissionStatus("denied");
        setError("Location permission denied");
        return false;
      }

      // Status is undetermined, request permission
      console.log("🔒 Requesting location permissions...");
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === "granted";

      if (granted) {
        setPermissionStatus("granted");
        console.log("✅ Location permission granted");
      } else {
        setPermissionStatus("denied");
        setError("Location permission denied");
        console.log("❌ Location permission denied");
      }

      return granted;
    } catch (error) {
      console.error("❌ Error requesting location permission:", error);
      setError(error.message);
      setPermissionStatus("denied");
      return false;
    }
  };

  // Get current location
  const getCurrentLocation = async (options = {}) => {
    const {
      accuracy = Location.Accuracy.Balanced,
      timeout = 15000,
      showErrorAlert = false,
    } = options;

    try {
      // console.log("📡 Getting current location...");
      setLoading(true);
      setError(null);

      const location = await Location.getCurrentPositionAsync({
        accuracy,
        timeout,
      });

      setLocation(location);
      return location;
    } catch (error) {
      console.error("❌ Error getting current location:", error);

      setError(error.message);

      if (showErrorAlert) {
        Alert.alert(
          "Location Error",
          "Unable to get your current location. Please check your location settings and try again.",
          [{ text: "OK" }]
        );
      }

      return null;
    } finally {
      setLoading(false);
    }
  };

  // Initialize location on app start
  const initializeLocation = async () => {
    try {
      // console.log("🚀 Initializing location service...");
      setLoading(true);

      // Request permission
      const hasPermission = await requestLocationPermission();

      if (hasPermission) {
        await getCurrentLocation({ showErrorAlert: false });
      } else {
        console.log(
          "⚠️ Location permission not granted, skipping location fetch"
        );
      }
    } catch (error) {
      console.error("❌ Error initializing location:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Refresh location manually
  const refreshLocation = async () => {
    return await getCurrentLocation({
      accuracy: Location.Accuracy.High,
      showErrorAlert: false,
    });
  };

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === "active" && permissionStatus === "granted") {
        // App came to foreground, refresh location
        console.log("📱 App became active, refreshing location...");
        getCurrentLocation({ showErrorAlert: false });
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
    };
  }, [permissionStatus]);

  // Initialize location on component mount
  useEffect(() => {
    initializeLocation();
  }, []);

  const value = {
    // State
    location,
    loading,
    error,
    permissionStatus,

    // Actions
    requestLocationPermission,
    getCurrentLocation,
    refreshLocation,
    initializeLocation,

    // Utils
    coordinates: location
      ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }
      : null,

    hasLocation: !!location,
    hasPermission: permissionStatus === "granted",
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

// Custom hook to use location context
export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error(
      "useLocationContext must be used within a LocationProvider"
    );
  }
  return context;
};

export default LocationContext;
