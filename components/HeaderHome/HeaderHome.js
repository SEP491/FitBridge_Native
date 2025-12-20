import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Keyboard,
} from "react-native";
import React, { useState, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../../context/CartContext";
import { useLocationContext } from "../../context/LocationContext";
import { useTranslation } from "../../hooks/useTranslation";
import axios from "axios";
import FullScreenSearch from "../FullScreenSearch/FullScreenSearch";
import { useUser } from "../../context/UserContext";

export default function HeaderHome({
  user,
  showFullScreenSearch,
  setShowFullScreenSearch,
  initialTab = "gyms",
}) {
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const { avatarUrl } = useUser();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { cart, getCartCount } = useCart();
  const { location, coordinates, hasLocation } = useLocationContext();
  const [weather, setWeather] = useState({});
  const [coords, setCoords] = useState(null);
  const fetchWeather = async () => {
    setLoading(true);
    try {
      // Using Open-Meteo API (completely free, no API key needed)
      // Use coords if available, otherwise default to Ho Chi Minh City
      const lat = coords?.latitude || 10.8231;
      const lng = coords?.longitude || 106.6297;

      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&timezone=Asia/Bangkok`
      );
      if (response && response.data.current) {
        setWeather({
          current: {
            temperature_2m: response.data.current.temperature_2m,
            weather_code: response.data.current.weather_code,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching weather:", error);
      // Set default rainy weather as fallback
      setWeather({
        current: {
          temperature_2m: 28,
          weather_code: 61, // Rain code
        },
      });
    } finally {
      setLoading(false);
    }
  };
  // Update coords from LocationContext
  useEffect(() => {
    if (hasLocation && coordinates) {
      setCoords(coordinates);
    }
  }, [hasLocation, coordinates]);

  // Fetch weather when coords change or on initial load
  useEffect(() => {
    fetchWeather();
  }, [coords]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("goodMorning");
    if (hour < 18) return t("goodAfternoon");
    return t("goodEvening");
  };

  const getWeatherIcon = () => {
    if (loading) return "cloud-outline";

    if (!weather || !weather.current) return "rainy";

    const weatherCode = weather.current.weather_code;

    // WMO Weather interpretation codes
    if (weatherCode >= 0 && weatherCode <= 3) return "sunny"; // Clear to partly cloudy
    if (weatherCode >= 45 && weatherCode <= 48) return "cloudy"; // Fog
    if (weatherCode >= 51 && weatherCode <= 67) return "rainy"; // Rain
    if (weatherCode >= 71 && weatherCode <= 86) return "snow"; // Snow
    if (weatherCode >= 95 && weatherCode <= 99) return "thunderstorm"; // Thunderstorm

    return "rainy"; // Default to rainy as requested
  };

  // Handle search input focus - open full screen search
  const handleSearchFocus = () => {
    setShowFullScreenSearch(true);
  };

  // Handle keyword selection from full screen search
  const handleKeywordSelect = (keyword) => {
    setSearchText(keyword);
    setShowFullScreenSearch(false);
    Keyboard.dismiss();
  };

  // Handle close full screen search
  const handleCloseFullScreenSearch = () => {
    setShowFullScreenSearch(false);
    Keyboard.dismiss();
  };

  // Handle search submission from header (fallback)
  const handleSearchSubmit = () => {
    if (searchText.trim()) {
      setShowFullScreenSearch(false);
    }
  };
  return (
    <>
      <LinearGradient
        colors={["#FF914D", "#ED2A46", "#C21A3F"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <View style={styles.overlay} />
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <View style={styles.welcomeText}>
              <Text style={styles.greeting}>{getGreeting()}</Text>

              <View style={styles.userInfo}>
                <View style={styles.avatarContainer}>
                  <Image
                    source={{
                      uri: avatarUrl,
                    }}
                    style={[styles.avatar]}
                  />
                </View>
                <Text style={styles.userName}>
                  {user?.fullName || t("user")}
                </Text>
                <View style={styles.statusDot} />
              </View>
            </View>

            <View style={styles.profileSection}>
              <View style={styles.weatherContainer}>
                <Ionicons
                  name={getWeatherIcon()}
                  size={24}
                  color="white"
                  style={styles.weatherIcon}
                />
                {weather && weather.current && (
                  <Text style={styles.temperatureText}>
                    {Math.round(weather.current.temperature_2m)}°C
                  </Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.actionSection}>
            <View style={styles.searchContainer}>
              <TouchableOpacity
                style={styles.searchBox}
                onPress={handleSearchFocus}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="search"
                  size={18}
                  color="#999"
                  style={styles.searchIcon}
                />
                <Text style={styles.searchPlaceholder}>
                  {t("gym.searchGymPlaceholder")}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionButtons}>
              {user?.role === "Customer" && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => navigation.navigate("CartScreen")}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons name="cart" size={30} color="white" />
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{getCartCount()}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}

              {/* Only show notification button for authenticated users */}
              {user && (
                <TouchableOpacity
                  style={styles.actionButton}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate("NotificationScreen")}
                >
                  <View style={styles.iconContainer}>
                    <Ionicons name="notifications" size={30} color="white" />
                    <View style={styles.notificationDot} />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Full Screen Search */}
      <FullScreenSearch
        visible={showFullScreenSearch}
        onKeywordSelect={handleKeywordSelect}
        onClose={handleCloseFullScreenSearch}
        initialSearchText={searchText}
        initialTab={initialTab}
      />
    </>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    paddingTop: 64,
    paddingBottom: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  header: {
    paddingHorizontal: 20,
  },
  welcomeSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  welcomeText: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  userName: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.9,
    fontWeight: "800",
  },
  statusDot: {
    position: "absolute",
    bottom: 0,
    left: 30,
    width: 10,
    height: 10,
    borderRadius: 20,
    backgroundColor: "#4AFF4A",
    shadowColor: "#4AFF4A",
    shadowOpacity: 0.8,
    borderWidth: 0.7,
    borderColor: "white",
    shadowRadius: 4,
    elevation: 3,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  weatherContainer: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    gap: 6,
  },
  weatherIcon: {
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  temperatureText: {
    fontSize: 14,
    color: "white",
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  // avatarText: {
  //   fontSize: 18,
  //   fontWeight: "bold",
  //   color: "white",
  // },
  actionSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchContainer: {
    width: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 8,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 48,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "transparent",
  },
  searchBoxFocused: {
    borderColor: "#ED2A46",
    shadowColor: "#ED2A46",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: "#333",
    fontSize: 12,
    fontWeight: "400",
  },
  searchPlaceholder: {
    flex: 1,
    color: "#A39F9F",
    fontSize: 12,
    fontWeight: "400",
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  iconContainer: {
    position: "relative",
    padding: 4,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  badgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  notificationDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
    borderWidth: 1,
    borderColor: "white",
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
});
