import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "../../hooks/useTranslation";
import { getYearsFromDob } from "../../lib";

const { width } = Dimensions.get("window");

// Individual Gym Card Component
const GymCard = ({ gym, onPress }) => {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={styles.gymCard}
      onPress={() => onPress(gym)}
      activeOpacity={0.8}
    >
      <View style={styles.gymCardContent}>
        {/* Gym Image */}
        <View style={styles.gymImageContainer}>
          {gym.mainImage ? (
            <Image
              source={{ uri: gym.mainImage }}
              style={styles.gymImage}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={{
                uri: "https://thesaigontimes.vn/wp-content/uploads/2024/12/g1-2.jpeg",
              }}
              style={styles.gymImage}
              resizeMode="cover"
            />
          )}
          {/* Distance Badge */}
          {gym.distance_km !== undefined && (
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceBadgeText}>
                {gym.distance_km === 0 ? "< 0.1 km" : `${gym.distance_km} km`}
              </Text>
            </View>
          )}
        </View>

        {/* Gym Info */}
        <View style={styles.gymInfo}>
          <Text style={styles.gymName} numberOfLines={1}>
            {gym.gymName}
          </Text>
          <View style={styles.gymAddressRow}>
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text style={styles.gymAddress} numberOfLines={2}>
              {gym.address}
            </Text>
          </View>
          <Text style={styles.gymSince}>
            {t("chat.operatingSince")} {getYearsFromDob(gym.dob)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Gym Cards List Component
export const GymCardsList = ({ gyms, onGymPress }) => {
  const { t } = useTranslation();
  const [visibleCount, setVisibleCount] = useState(
    Math.max(3, Math.min(gyms.length, 3))
  );
  const initialCount = Math.max(3, Math.min(gyms.length, 3));
  const hasMore = visibleCount < gyms.length;
  const canCollapse = visibleCount > initialCount;

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + 5, gyms.length));
  };

  const handleCollapse = () => {
    setVisibleCount(initialCount);
  };

  return (
    <View style={styles.gymCardsContainer}>
      <FlatList
        data={gyms.slice(0, visibleCount)}
        renderItem={({ item }) => <GymCard gym={item} onPress={onGymPress} />}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />

      <View style={styles.buttonContainer}>
        {hasMore && (
          <TouchableOpacity
            style={styles.showMoreButton}
            onPress={handleShowMore}
          >
            <Text style={styles.showMoreText}>
              {t("chat.showMoreGyms")} ({gyms.length - visibleCount}{" "}
              {t("chat.remaining")})
            </Text>
            <Ionicons name="chevron-down" size={16} color="#ED2A46" />
          </TouchableOpacity>
        )}

        {canCollapse && (
          <TouchableOpacity
            style={styles.collapseButton}
            onPress={handleCollapse}
          >
            <Text style={styles.collapseText}>{t("chat.collapse")}</Text>
            <Ionicons name="chevron-up" size={16} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gymCardsContainer: {
    marginTop: 12,
    width: width * 0.75,
  },
  gymCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  gymCardContent: {
    alignItems: "center",
  },
  gymImageContainer: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    position: "relative",
    overflow: "hidden",
  },
  gymImage: {
    width: "100%",
    height: "100%",
  },
  distanceBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  distanceBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  gymInfo: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: 16,
  },
  gymName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  gymAddressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
    marginBottom: 4,
  },
  gymAddress: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 18,
    flex: 1,
  },
  gymSince: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  // Button Container Styles
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    marginHorizontal: 8,
    gap: 8,
  },
  showMoreButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF5F6",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ED2A46",
  },
  showMoreText: {
    fontSize: 14,
    color: "#ED2A46",
    fontWeight: "600",
    marginRight: 8,
  },
  collapseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FA",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minWidth: 100,
  },
  collapseText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
    marginRight: 8,
  },
});

export default GymCard;
