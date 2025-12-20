import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Location from "expo-location";
import { useTranslation } from "../../../hooks/useTranslation";
import addressService from "../../../services/addressService";
import {
  GOOGLE_MAPS_CONFIG,
  buildAutocompleteUrl,
  buildPlaceDetailsUrl,
} from "../../../config/googleMaps";
import LoadingIndicator from "../../../components/LoadingIndicator";

export default function AddressSelectionScreen({ navigation, route }) {
  const { t } = useTranslation();
  const { onSelectAddress, currentAddress } = route.params || {};
  const mapRef = useRef(null);

  const [region, setRegion] = useState({
    latitude: 10.8231, // Default to Ho Chi Minh City
    longitude: 106.6297,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [markerPosition, setMarkerPosition] = useState({
    latitude: 10.8231,
    longitude: 106.6297,
  });

  const [recipientName, setRecipientName] = useState(
    currentAddress?.recipientName || ""
  );
  const [phoneNumber, setPhoneNumber] = useState(
    currentAddress?.phoneNumber || ""
  );
  const [addressDetail, setAddressDetail] = useState("");
  const [fullAddress, setFullAddress] = useState(
    currentAddress?.fullAddress || ""
  );
  const [houseNumber, setHouseNumber] = useState("");
  const [street, setStreet] = useState("");
  const [ward, setWard] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDefault, setIsDefault] = useState(
    currentAddress?.isDefault || false
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const searchTimeout = useRef(null);

  // Map style similar to MapScreen
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

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);

      // Request permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t("common.error"),
          "Permission to access location was denied"
        );
        setLoading(false);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(newRegion);
      setMarkerPosition({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Get address from coordinates
      await getAddressFromCoordinates(
        location.coords.latitude,
        location.coords.longitude
      );

      // Animate map to location
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert(t("common.error"), "Failed to get current location");
    } finally {
      setLoading(false);
    }
  };

  const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addressResponse && addressResponse.length > 0) {
        const address = addressResponse[0];
        const formattedAddress = [
          address.streetNumber,
          address.street,
          address.district,
          address.city,
          address.region,
          address.country,
        ]
          .filter(Boolean)
          .join(", ");

        setFullAddress(formattedAddress);
        setAddressDetail(
          [address.streetNumber, address.street].filter(Boolean).join(" ")
        );

        // Set individual address components
        setHouseNumber(address.streetNumber || "");
        setStreet(address.street || "");
        setDistrict(address.district || "");
        setCity(address.city || address.region || "");
        // Ward is not available from reverse geocoding, will be parsed from fullAddress
      }
    } catch (error) {
      console.error("Error getting address:", error);
    }
  };

  const handleMapPress = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarkerPosition({ latitude, longitude });
    await getAddressFromCoordinates(latitude, longitude);
  };

  // Fetch place predictions from Google Places API
  const fetchPlacePredictions = async (input) => {
    if (!input || input.length < 3) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    try {
      const url = buildAutocompleteUrl(input);
      console.log("Fetching predictions for:", input);
      console.log("API URL:", url);

      const response = await fetch(url);
      const data = await response.json();

      console.log("API Response:", data);

      if (data.status === "OK" && data.predictions) {
        console.log("Predictions found:", data.predictions.length);
        setPredictions(data.predictions);
        setShowPredictions(true);
      } else if (data.status === "ZERO_RESULTS") {
        console.log("No predictions found");
        setPredictions([]);
        setShowPredictions(false);
      } else {
        console.error("API Error Status:", data.status, data.error_message);
        setPredictions([]);
        setShowPredictions(false);
      }
    } catch (error) {
      console.error("Error fetching place predictions:", error);
      setPredictions([]);
      setShowPredictions(false);
    }
  };

  // Handle search input change with debounce
  const handleSearchChange = (text) => {
    setSearchQuery(text);
    console.log("Search query changed:", text);

    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Show predictions immediately if we have them and text matches
    if (text.length >= 3 && predictions.length > 0) {
      setShowPredictions(true);
    }

    // Set new timeout for API call
    if (text.length >= 3) {
      searchTimeout.current = setTimeout(() => {
        console.log("Triggering API call for:", text);
        fetchPlacePredictions(text);
      }, GOOGLE_MAPS_CONFIG.SEARCH_DEBOUNCE_MS);
    } else {
      setPredictions([]);
      setShowPredictions(false);
    }
  };

  // Get place details and coordinates from place_id
  const getPlaceDetails = async (placeId) => {
    try {
      setLoading(true);
      const url = buildPlaceDetailsUrl(placeId);
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.result) {
        const { geometry, formatted_address } = data.result;
        const { lat, lng } = geometry.location;

        const newRegion = {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setRegion(newRegion);
        setMarkerPosition({
          latitude: lat,
          longitude: lng,
        });
        setFullAddress(formatted_address);

        // Parse the formatted address into components
        const addressParts = formatted_address
          .split(",")
          .map((part) => part.trim());
        if (addressParts.length >= 1) {
          const firstPart = addressParts[0];
          const houseNumberMatch = firstPart.match(
            /^([0-9]+[A-Za-z]?(?:\/[0-9]+)?)\s+(.+)$/
          );
          if (houseNumberMatch) {
            setHouseNumber(houseNumberMatch[1]);
            setStreet(houseNumberMatch[2]);
          } else {
            setHouseNumber("");
            setStreet(firstPart);
          }
        }
        if (addressParts.length >= 2) {
          setWard(addressParts[1].replace(/^(Phường|Ward|Xã)\s+/i, "").trim());
        }
        if (addressParts.length >= 3) {
          setDistrict(
            addressParts[2].replace(/^(Quận|District|Huyện)\s+/i, "").trim()
          );
        }
        if (addressParts.length >= 4) {
          setCity(
            addressParts
              .slice(3)
              .join(", ")
              .replace(/^(Thành phố|Tỉnh|City|Province)\s+/i, "")
              .trim()
          );
        }

        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, 1000);
        }
      }
    } catch (error) {
      console.error("Error getting place details:", error);
      Alert.alert(t("common.error"), "Failed to get place details");
    } finally {
      setLoading(false);
      setShowPredictions(false);
      Keyboard.dismiss();
    }
  };

  // Handle prediction selection
  const handlePredictionSelect = (prediction) => {
    setSearchQuery(prediction.description);
    getPlaceDetails(prediction.place_id);
  };

  const handleSearchAddress = async () => {
    if (!searchQuery.trim()) {
      Alert.alert(t("common.error"), "Please enter an address to search");
      return;
    }

    // Hide predictions and dismiss keyboard
    setShowPredictions(false);
    Keyboard.dismiss();

    try {
      setLoading(true);
      const searchResults = await Location.geocodeAsync(searchQuery);

      if (searchResults && searchResults.length > 0) {
        const location = searchResults[0];
        const newRegion = {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setRegion(newRegion);
        setMarkerPosition({
          latitude: location.latitude,
          longitude: location.longitude,
        });

        await getAddressFromCoordinates(location.latitude, location.longitude);

        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, 1000);
        }
      } else {
        Alert.alert(t("common.error"), "Address not found");
      }
    } catch (error) {
      console.error("Error searching address:", error);
      Alert.alert(t("common.error"), "Failed to search address");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async () => {
    // Validate inputs
    if (!recipientName.trim()) {
      Alert.alert(t("common.error"), "Please enter recipient name");
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert(t("common.error"), "Please enter phone number");
      return;
    }

    if (!fullAddress.trim()) {
      Alert.alert(t("common.error"), "Please select a location on the map");
      return;
    }

    try {
      setLoading(true);

      // Use state variables for address components
      const noteText = addressDetail.trim() || "";

      // Ensure latitude and longitude are numbers
      const lat =
        typeof markerPosition.latitude === "number"
          ? markerPosition.latitude
          : parseFloat(markerPosition.latitude) || 0;
      const lng =
        typeof markerPosition.longitude === "number"
          ? markerPosition.longitude
          : parseFloat(markerPosition.longitude) || 0;

      // Create address via API - matching exact body structure
      const createAddressData = {
        receiverName: recipientName.trim(),
        phoneNumber: phoneNumber.trim(),
        city: city || "Unknown",
        district: district || "Unknown",
        ward: ward || "Unknown",
        street: street || "Unknown",
        houseNumber: houseNumber || "",
        note: noteText,
        latitude: lat,
        longitude: lng,
        googleMapAddressString: fullAddress.trim(),
      };

      console.log("Creating address with data:", createAddressData);

      // Call API to create address
      const response = await addressService.createAddress(createAddressData);
      console.log("Address created successfully:", response);

      // Create address object to pass back to previous screen
      const addressData = {
        recipientName: recipientName.trim(),
        receiverName: recipientName.trim(),
        phoneNumber: phoneNumber.trim(),
        fullAddress: fullAddress.trim(),
        googleMapAddressString: fullAddress.trim(),
        addressDetail: noteText,
        city: city,
        district: district,
        ward: ward,
        street: street,
        houseNumber: houseNumber,
        note: noteText,
        latitude: lat,
        longitude: lng,
        isDefault: isDefault,
      };

      console.log("Passing address back to payment screen:", addressData);

      // Pass back to previous screen
      if (onSelectAddress) {
        onSelectAddress(addressData);
      }

      // Navigate back with refresh flag
      navigation.goBack({
        refreshAddresses: true,
        newAddress: addressData,
      });
    } catch (error) {
      console.error("Error creating address:", error);
      console.error("Error details:", error.response?.data);
      Alert.alert(
        t("common.error"),
        error.response?.data?.message ||
          error.message ||
          "Failed to create address. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 140 : 0}
    >
      <View style={styles.innerContainer}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder={t("payment.searchAddress")}
              value={searchQuery}
              onChangeText={handleSearchChange}
              onSubmitEditing={handleSearchAddress}
              returnKeyType="search"
              onFocus={() => {
                if (predictions.length > 0) {
                  setShowPredictions(true);
                }
              }}
              onBlur={() => {
                // Delay hiding to allow prediction selection
                setTimeout(() => setShowPredictions(false), 200);
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setPredictions([]);
                  setShowPredictions(false);
                }}
              >
                <MaterialIcons name="close" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={getCurrentLocation}
          >
            <MaterialIcons name="my-location" size={24} color="#ED2A46" />
          </TouchableOpacity>
        </View>

        {/* Predictions List */}
        {showPredictions && predictions.length > 0 && (
          <View style={styles.predictionsContainer}>
            <Text style={styles.predictionsHeader}>
              {predictions.length}{" "}
              {predictions.length === 1 ? "result" : "results"}
            </Text>
            <FlatList
              data={predictions}
              keyExtractor={(item) => item.place_id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.predictionItem}
                  onPress={() => handlePredictionSelect(item)}
                >
                  <MaterialIcons
                    name="location-on"
                    size={20}
                    color="#666"
                    style={styles.predictionIcon}
                  />
                  <View style={styles.predictionTextContainer}>
                    <Text style={styles.predictionMainText} numberOfLines={1}>
                      {item.structured_formatting.main_text}
                    </Text>
                    <Text
                      style={styles.predictionSecondaryText}
                      numberOfLines={1}
                    >
                      {item.structured_formatting.secondary_text}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              style={styles.predictionsList}
              nestedScrollEnabled
            />
          </View>
        )}

        {/* Address Form */}
        <ScrollView
          style={styles.formContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Map */}
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={region}
              onPress={handleMapPress}
              showsUserLocation={true}
              showsMyLocationButton={false}
              customMapStyle={MapStyle}
              showsPointsOfInterest={false}
            >
              <Marker
                coordinate={markerPosition}
                draggable
                onDragEnd={handleMapPress}
                tracksViewChanges={false}
              >
                <View style={styles.markerContainer}>
                  <MaterialIcons name="location-on" size={40} color="#ED2A46" />
                </View>
              </Marker>
            </MapView>

            {/* Center Marker Hint */}
            <View style={styles.mapHint}>
              <MaterialIcons name="info-outline" size={16} color="#666" />
              <Text style={styles.mapHintText}>
                {t("payment.tapMapToSelectLocation")}
              </Text>
            </View>
          </View>
          {/* Selected Address Display */}
          <View style={styles.formSection}>
            <Text style={styles.sectionLabel}>
              {t("payment.selectedAddress")}
            </Text>
            <View style={styles.addressPreview}>
              <MaterialIcons name="location-on" size={20} color="#ED2A46" />
              <Text style={styles.addressPreviewText} numberOfLines={2}>
                {fullAddress || t("payment.selectLocationOnMap")}
              </Text>
            </View>
          </View>

          {/* Recipient Name */}
          <View style={styles.formSection}>
            <Text style={styles.label}>
              {t("payment.recipientName")}{" "}
              <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder={t("payment.enterRecipientName")}
              value={recipientName}
              onChangeText={setRecipientName}
              returnKeyType="next"
            />
          </View>

          {/* Phone Number */}
          <View style={styles.formSection}>
            <Text style={styles.label}>
              {t("payment.phoneNumber")} <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder={t("payment.enterPhoneNumber")}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              returnKeyType="next"
            />
          </View>

          {/* House Number and Street in one row */}
          <View style={styles.formSection}>
            <View style={styles.rowContainer}>
              {/* House Number */}
              <View style={styles.rowItem}>
                <Text style={styles.label}>{t("payment.houseNumber")}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t("payment.enterHouseNumber")}
                  value={houseNumber}
                  onChangeText={setHouseNumber}
                  returnKeyType="next"
                />
              </View>

              {/* Street */}
              <View style={styles.rowItem}>
                <Text style={styles.label}>
                  {t("payment.street")} <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={t("payment.enterStreet")}
                  value={street}
                  onChangeText={setStreet}
                  returnKeyType="next"
                />
              </View>
            </View>
          </View>

          {/* Ward and District in one row */}
          <View style={styles.formSection}>
            <View style={styles.rowContainer}>
              {/* Ward */}
              <View style={styles.rowItem}>
                <Text style={styles.label}>
                  {t("payment.ward")} <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={t("payment.enterWard")}
                  value={ward}
                  onChangeText={setWard}
                  returnKeyType="next"
                />
              </View>

              {/* District */}
              <View style={styles.rowItem}>
                <Text style={styles.label}>
                  {t("payment.district")} <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder={t("payment.enterDistrict")}
                  value={district}
                  onChangeText={setDistrict}
                  returnKeyType="next"
                />
              </View>
            </View>
          </View>

          {/* City in its own row */}
          <View style={styles.formSection}>
            <Text style={styles.label}>
              {t("payment.city")} <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder={t("payment.enterCity")}
              value={city}
              onChangeText={setCity}
              returnKeyType="next"
            />
          </View>

          {/* Address Detail */}
          <View style={styles.formSection}>
            <Text style={styles.label}>{t("payment.addressDetail")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("payment.enterAddressDetail")}
              value={fullAddress}
              onChangeText={setFullAddress}
              returnKeyType="done"
            />
          </View>


          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveAddress}
            disabled={loading}
          >
            {loading ? (
              <LoadingIndicator variant="button" />
            ) : (
              <Text style={styles.saveButtonText}>
                {t("payment.saveAddress")}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Loading Overlay */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <LoadingIndicator variant="page" />
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  innerContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: "#fff",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
  },
  currentLocationButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  predictionsContainer: {
    backgroundColor: "#fff",
    maxHeight: 250,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000,
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
  },
  predictionsHeader: {
    fontSize: 12,
    color: "#999",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F9F9F9",
    fontWeight: "500",
  },
  predictionsList: {
    flex: 1,
  },
  predictionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  predictionIcon: {
    marginRight: 12,
  },
  predictionTextContainer: {
    flex: 1,
  },
  predictionMainText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  predictionSecondaryText: {
    fontSize: 12,
    color: "#666",
  },
  mapContainer: {
    height: 250,
    position: "relative",
    marginTop: 0,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  mapHint: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapHintText: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 0,
  },
  scrollContent: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  formSection: {
    marginTop: 16,
  },
  rowContainer: {
    flexDirection: "row",
    gap: 10,
  },
  rowItem: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ED2A46",
    marginBottom: 8,
  },
  addressPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F6",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  addressPreviewText: {
    flex: 1,
    fontSize: 13,
    color: "#333",
    lineHeight: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  required: {
    color: "#FF4D4F",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#fff",
  },
  defaultCheckbox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 8,
  },
  defaultText: {
    fontSize: 14,
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#ED2A46",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
});
