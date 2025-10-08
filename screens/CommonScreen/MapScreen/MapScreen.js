import {
  View,
  Text,
  ActivityIndicator,
  Image,
  Platform,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MapView, { Callout, Marker, Circle } from "react-native-maps";
import { StyleSheet } from "react-native";
import gymService from "../../../services/gymService";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import GymListBottomSheet from "../../../components/GymListBottomSheet/GymListBottomSheet";
import {
  calculateDistance,
  isValidCoordinate,
  filterGymsByDistance,
  formatNumber,
  formatDate,
  getYearsFromDob,
} from "../../../lib";
import { useLocationContext } from "../../../context/LocationContext";
import { useTranslation } from "../../../hooks/useTranslation";

export default function MapScreen({ route }) {
  const { location, refreshLocation, coordinates, hasLocation } =
    useLocationContext();
  const { t } = useTranslation();
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allGyms, setAllGyms] = useState([]);
  const [filteredGyms, setFilteredGyms] = useState([]);
  const [searchRadius, setSearchRadius] = useState("5");
  const [showRadiusInput, setShowRadiusInput] = useState(false);
  const [gymListVisible, setGymListVisible] = useState(false);
  const navigation = useNavigation();

  const mapRef = useRef(null);

  const { latitude: targetLatitude, longitude: targetLongitude } =
    route.params || {};

  useEffect(() => {
    if (
      targetLatitude &&
      targetLongitude &&
      isValidCoordinate(targetLatitude, targetLongitude) &&
      mapRef.current
    ) {
      setTimeout(() => {
        mapRef.current.animateToRegion(
          {
            latitude: targetLatitude,
            longitude: targetLongitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          1000 // Animation duration in ms
        );
      }, 500);
    }
  }, [targetLatitude, targetLongitude]);

  // Function to filter gyms by distance
  const handleFilterGymsByDistance = () => {
    if (!coords) return;

    const radius = parseFloat(searchRadius);
    if (isNaN(radius)) return;

    const filteredGyms = filterGymsByDistance(
      allGyms,
      { latitude: coords.latitude, longitude: coords.longitude },
      radius
    );
    setFilteredGyms(filteredGyms);
  };

  useEffect(() => {
    const fetchGym = async (page = 1, pageSize = 500) => {
      setLoading(true);
      try {
        const response = await gymService.getAllGyms({
          page,
          size: pageSize,
          doApplyPaging: false,
        });
        const { items, total, page: currentPage } = response.data;

        setAllGyms(items);
        console.log("Gyms:", items);
        console.log(
          "Valid gyms:",
          items.filter((gym) => isValidCoordinate(gym.latitude, gym.longitude))
        );
      } catch (error) {
        console.error("Error fetching hot research gym:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGym();
  }, []);

  // Update location from context
  useEffect(() => {
    if (hasLocation && coordinates) {
      setCoords(coordinates);
      setLoading(false);
    }
  }, [hasLocation, coordinates]);

  useEffect(() => {
    // Re-filter when coords or searchRadius changes
    if (coords && allGyms.length > 0) {
      handleFilterGymsByDistance();
    }
  }, [coords, searchRadius, allGyms]);

  // Function to get a valid radius value for the Circle component
  const getValidRadius = () => {
    const radius = parseFloat(searchRadius);
    if (isNaN(radius) || radius <= 0) {
      return 5000; // Default to 5km in meters
    }
    return radius * 1000; // Convert km to meters
  };

  // Function to safely set the search radius
  const handleSetSearchRadius = (value) => {
    // Only allow digits and limit to 2 characters
    const sanitizedValue = value.replace(/[^0-9]/g, "").slice(0, 2);
    setSearchRadius(sanitizedValue); // Default to 5 if empty
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!coords) {
    return (
      <View style={styles.container}>
        <Text>{t("map.noCoordinates")}</Text>
      </View>
    );
  }

  // Filter out gyms with invalid coordinates and calculate distances
  const validGyms = filteredGyms
    .filter((gym) => isValidCoordinate(gym.latitude, gym.longitude))
    .map((gym) => {
      // Calculate distance from current location to each gym
      if (coords) {
        const distance = calculateDistance(
          coords.latitude,
          coords.longitude,
          gym.latitude,
          gym.longitude
        );
        return { ...gym, distance };
      }
      return gym;
    });

  const validAllGyms = allGyms
    .filter((gym) => isValidCoordinate(gym.latitude, gym.longitude))
    .map((gym) => {
      // Calculate distance from current location to each gym
      if (coords) {
        const distance = calculateDistance(
          coords.latitude,
          coords.longitude,
          gym.latitude,
          gym.longitude
        );
        return { ...gym, distance };
      }
      return gym;
    });

  const MapStyle = [
    {
      elementType: "labels",
      stylers: [
        {
          visibility: "on",
        },
      ],
    },
    {
      featureType: "poi",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
  ];

  const handleGymPress = (item) => {
    // Center the map on the gym's location
    if (mapRef.current && isValidCoordinate(item.latitude, item.longitude)) {
      mapRef.current.animateToRegion(
        {
          latitude: item.latitude,
          longitude: item.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      ); // Animation duration in ms
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          longitude: coords.longitude,
          latitude: coords.latitude,
          longitudeDelta: 0.01,
          latitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        customMapStyle={MapStyle}
        showsPointsOfInterest={false}
      >
        {/* Circle to show search radius */}
        <Circle
          center={{
            latitude: coords.latitude,
            longitude: coords.longitude,
          }}
          radius={getValidRadius()} // Convert km to meters
          strokeWidth={1}
          strokeColor="rgba(66, 133, 244, 0.5)"
          fillColor="rgba(66, 133, 244, 0.1)"
        />

        {validAllGyms.map((gym) => (
          <Marker
            key={gym.id}
            coordinate={{
              longitude: gym.longitude,
              latitude: gym.latitude,
            }}
            onPress={() => {
              // console.log("Marker pressed:", gym.gymName);
              if (
                mapRef.current &&
                isValidCoordinate(gym.latitude, gym.longitude)
              ) {
                mapRef.current.animateToRegion(
                  {
                    latitude: gym.latitude,
                    longitude: gym.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  },
                  1000
                );
              }
            }}
            tracksViewChanges={true}
          >
            <View style={styles.markerContainer}>
              <Image
                source={require("../../../assets/LogoColor.png")}
                style={styles.markerImage}
              />
              {gym.hotResearch && (
                <FontAwesome6 name="fire" size={20} color="#ED2A46" />
              )}
            </View>
            <Callout
              onPress={() =>
                navigation.navigate(t("navigation.home"), {
                  screen: "GymDetailScreen",
                  params: { gymId: gym.id },
                })
              }
            >
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{gym.gymName}</Text>
                <Text style={styles.calloutAddress}>{gym.gymAddress}</Text>

                <Text style={styles.calloutSince}>
                  {t("map.operatingSince")} {getYearsFromDob(gym.dob)}
                </Text>
                <Text style={styles.calloutDistance}>
                  {t("map.distanceAway")}{" "}
                  {gym.distance ? `${gym.distance.toFixed(1)} km` : ""}
                </Text>
                {gym.hotResearch && (
                  <View style={styles.hotBadge}>
                    <Text style={styles.hotBadgeText}>Hot</Text>
                  </View>
                )}
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Search Radius Button */}
      <TouchableOpacity
        style={styles.radiusButton}
        onPress={() => setShowRadiusInput(!showRadiusInput)}
      >
        <FontAwesome5 name="search-location" size={20} color="#fff" />
        <Text style={styles.radiusButtonText}>
          {t("map.radius")} {searchRadius} km{" "}
        </Text>
      </TouchableOpacity>

      {/* Location Refresh Button */}
      <TouchableOpacity
        style={styles.locationRefreshButton}
        onPress={async () => {
          try {
            const newLocation = await refreshLocation();
            if (newLocation && newLocation.coords) {
              setCoords(newLocation.coords);

              // Animate map to new location
              if (mapRef.current) {
                mapRef.current.animateToRegion(
                  {
                    latitude: newLocation.coords.latitude,
                    longitude: newLocation.coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  },
                  1000
                );
              }

              Alert.alert(t("common.success"), t("map.locationUpdated"));
            } else {
              Alert.alert(t("common.error"), t("map.locationUpdateError"));
            }
          } catch (error) {
            console.error("❌ Error refreshing location:", error);
            Alert.alert(t("common.error"), t("map.locationUpdateError"));
          }
        }}
      >
        <FontAwesome5 name="location-arrow" size={20} color="#fff" />
      </TouchableOpacity>

      {/* Search Radius Input */}
      {showRadiusInput && (
        <View style={styles.radiusInputContainer}>
          <Text style={styles.radiusInputLabel}>{t("map.radiusKm")}</Text>
          <View style={styles.radiusInputRow}>
            <TextInput
              style={styles.radiusInput}
              value={searchRadius}
              onChangeText={handleSetSearchRadius}
              keyboardType="numeric"
              maxLength={2}
              placeholder={t("map.enterRadius")}
            />
            <TouchableOpacity
              style={styles.radiusApplyButton}
              onPress={() => {
                handleFilterGymsByDistance();
                setShowRadiusInput(false);
              }}
            >
              <Text style={styles.radiusApplyButtonText}>
                {t("common.search")}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.radiusPresets}>
            {[1, 3, 5, 10].map((preset) => (
              <TouchableOpacity
                key={preset}
                style={styles.radiusPresetButton}
                onPress={() => setSearchRadius(preset.toString())}
              >
                <Text
                  style={[
                    styles.radiusPresetText,
                    searchRadius === preset.toString() &&
                      styles.radiusPresetActive,
                  ]}
                >
                  {preset} km
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Toggle Gym List Button */}
      <TouchableOpacity
        style={styles.listButton}
        onPress={() => setGymListVisible(true)}
      >
        <FontAwesome6 name="list" size={20} color="#fff" />
        <Text style={styles.listButtonText}>{t("map.gymList")}</Text>
      </TouchableOpacity>

      {/* Gym List Bottom Sheet */}
      <GymListBottomSheet
        visible={gymListVisible}
        onClose={() => setGymListVisible(false)}
        gyms={validGyms}
        searchRadius={searchRadius}
        onGymPress={handleGymPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  calloutContainer: {
    width: 200,
    padding: 8,
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 3,
  },
  calloutAddress: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  calloutDistance: {
    fontSize: 11,
    color: "#333",
    marginTop: 2,
    fontWeight: "500",
  },
  calloutSince: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
  hotBadge: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginVertical: 2,
  },
  hotBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerImage: {
    width: 60,
    height: 60,
  },
  radiusButton: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#FF914D",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  radiusButtonText: {
    color: "#fff",
    marginLeft: 5,
    fontWeight: "600",
  },
  locationRefreshButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#4CAF50",
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  radiusInputContainer: {
    position: "absolute",
    top: 60,
    left: 10,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    width: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  radiusInputLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: "#333",
  },
  radiusInputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  radiusInput: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    flex: 1,
    fontSize: 16,
    marginRight: 8,
  },
  radiusApplyButton: {
    backgroundColor: "#FF914D",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  radiusApplyButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  radiusPresets: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  radiusPresetButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  radiusPresetText: {
    color: "#666",
  },
  radiusPresetActive: {
    color: "#ED2A46",
    fontWeight: "bold",
  },
  listButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#FF914D",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
  },
});
