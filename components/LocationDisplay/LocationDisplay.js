import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useLocationContext } from "../context/LocationContext";
import {
  formatCoordinates,
  getAccuracyDescription,
} from "../utils/locationUtilsNew";

/**
 * Example component showing how to use the new LocationContext
 * You can integrate this pattern into your existing components
 */
const LocationDisplay = () => {
  const {
    location,
    loading,
    error,
    hasLocation,
    hasPermission,
    isFirstTime,
    coordinates,
    refreshLocation,
    requestLocationPermission,
  } = useLocationContext();

  const handleRefreshLocation = async () => {
    try {
      const newLocation = await refreshLocation();
      if (newLocation) {
        Alert.alert("Success", "Location updated successfully!");
      }
    } catch (err) {
      console.error("Error refreshing location:", err);
    }
  };

  const handleRequestPermission = async () => {
    const granted = await requestLocationPermission();
    if (granted) {
      Alert.alert("Permission Granted", "You can now use location features!");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Getting your location... 📍</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location Status</Text>

      {isFirstTime && (
        <Text style={styles.welcomeText}>Welcome to FitBridge! 🏋️‍♂️</Text>
      )}

      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Permission:</Text>
        <Text
          style={[
            styles.statusValue,
            hasPermission ? styles.granted : styles.denied,
          ]}
        >
          {hasPermission ? "✅ Granted" : "❌ Denied"}
        </Text>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Location:</Text>
        <Text
          style={[
            styles.statusValue,
            hasLocation ? styles.available : styles.unavailable,
          ]}
        >
          {hasLocation ? "📍 Available" : "❌ Not Available"}
        </Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}

      {hasLocation && location && (
        <View style={styles.locationInfo}>
          <Text style={styles.infoTitle}>Current Location:</Text>
          <Text style={styles.infoText}>
            Coordinates: {formatCoordinates(location.coords)}
          </Text>
          <Text style={styles.infoText}>
            Accuracy: {getAccuracyDescription(location.coords.accuracy)} (
            {location.coords.accuracy?.toFixed(0)}m)
          </Text>
          <Text style={styles.infoText}>
            Updated: {new Date(location.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        {!hasPermission ? (
          <TouchableOpacity
            style={styles.button}
            onPress={handleRequestPermission}
          >
            <Text style={styles.buttonText}>Request Permission</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={handleRefreshLocation}
          >
            <Text style={styles.buttonText}>Refresh Location</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 16,
    color: "#4CAF50",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "500",
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  statusValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  granted: {
    color: "#4CAF50",
  },
  denied: {
    color: "#F44336",
  },
  available: {
    color: "#4CAF50",
  },
  unavailable: {
    color: "#F44336",
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  errorText: {
    color: "#c62828",
    fontSize: 14,
  },
  locationInfo: {
    backgroundColor: "#e8f5e8",
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#2e7d32",
  },
  infoText: {
    fontSize: 12,
    color: "#2e7d32",
    marginBottom: 4,
  },
  buttonContainer: {
    marginTop: 15,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LocationDisplay;
