import React, { createContext, useContext, useState, useEffect } from "react";
import { Alert, AppState } from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Create Location Context
const LocationContext = createContext();

// Constants
const FIRST_TIME_KEY = "isFirstTimeLaunch";
const LOCATION_PERMISSION_KEY = "locationPermissionGranted";

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [isFirstTime, setIsFirstTime] = useState(null);

  // Check if this is the first time opening the app
  const checkFirstTime = async () => {
    try {
      const firstTime = await AsyncStorage.getItem(FIRST_TIME_KEY);
      const isFirst = firstTime === null;
      setIsFirstTime(isFirst);

      if (isFirst) {
        console.log("🆕 First time opening the app");
        await AsyncStorage.setItem(FIRST_TIME_KEY, "false");
      }

      return isFirst;
    } catch (error) {
      console.error("Error checking first time:", error);
      return false;
    }
  };

  // Request location permission
  const requestLocationPermission = async (showAlert = true) => {
    try {
      console.log("🔍 Checking location permissions...");

      const { status: existingStatus } =
        await Location.getForegroundPermissionsAsync();
      console.log("📱 Current permission status:", existingStatus);

      if (existingStatus !== "granted") {
        console.log("🔒 Requesting location permissions...");

        // Show custom alert for first time users
        if (showAlert && isFirstTime) {
          return new Promise((resolve) => {
            Alert.alert(
              "Welcome to FitBridge! 🏋️‍♂️",
              "To help you find the best gyms nearby, we'd like to access your location. This helps us show you relevant gyms and provide personalized recommendations.",
              [
                {
                  text: "Not Now",
                  style: "cancel",
                  onPress: () => {
                    console.log("User declined location permission");
                    setPermissionStatus("denied");
                    setError("Location access denied");
                    resolve(false);
                  },
                },
                {
                  text: "Allow Location",
                  onPress: async () => {
                    const { status } =
                      await Location.requestForegroundPermissionsAsync();
                    const granted = status === "granted";

                    if (granted) {
                      setPermissionStatus("granted");
                      await AsyncStorage.setItem(
                        LOCATION_PERMISSION_KEY,
                        "granted"
                      );
                      console.log("✅ Location permission granted");
                    } else {
                      setPermissionStatus("denied");
                      setError("Location permission denied");
                      console.log("❌ Location permission denied");
                    }

                    resolve(granted);
                  },
                },
              ]
            );
          });
        } else {
          // Regular permission request for returning users
          const { status } = await Location.requestForegroundPermissionsAsync();
          const granted = status === "granted";

          if (granted) {
            setPermissionStatus("granted");
            await AsyncStorage.setItem(LOCATION_PERMISSION_KEY, "granted");
          } else {
            setPermissionStatus("denied");
            setError("Location permission denied");

            if (showAlert) {
              Alert.alert(
                "Location Access Needed",
                "FitBridge needs location access to show you nearby gyms. Please enable location permissions in your device settings.",
                [{ text: "OK" }]
              );
            }
          }

          return granted;
        }
      } else {
        setPermissionStatus("granted");
        await AsyncStorage.setItem(LOCATION_PERMISSION_KEY, "granted");
        return true;
      }
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
      showErrorAlert = true,
    } = options;

    try {
      console.log("📡 Getting current location...");
      setLoading(true);
      setError(null);

      const location = await Location.getCurrentPositionAsync({
        accuracy,
        timeout,
      });

      console.log("✅ Current location obtained:", {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      });

      setLocation(location);
      return location;
    } catch (error) {
      console.error("❌ Error getting current location:", error);

      // Try to get last known location as fallback
      try {
        console.log("🔄 Trying to get last known location...");
        const lastKnownLocation = await Location.getLastKnownPositionAsync({
          maxAge: 600000, // 10 minutes
        });

        if (lastKnownLocation) {
          console.log(
            "📍 Using last known location:",
            lastKnownLocation.coords
          );
          setLocation(lastKnownLocation);
          return lastKnownLocation;
        }
      } catch (fallbackError) {
        console.error("❌ Error getting last known location:", fallbackError);
      }

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
      console.log("🚀 Initializing location service...");
      setLoading(true);

      // Check if this is first time
      const isFirst = await checkFirstTime();

      // Request permission
      const hasPermission = await requestLocationPermission(isFirst);

      if (hasPermission) {
        // Get current location
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
    if (permissionStatus !== "granted") {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return null;
    }

    return await getCurrentLocation({
      accuracy: Location.Accuracy.High,
      showErrorAlert: true,
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
    isFirstTime,

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
