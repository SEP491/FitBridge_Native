import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "../../hooks/useTranslation";

export default function PTCard({
  item,
  onPress,
  showButtons = false,
  onDetailPress,
  onSelectPress,
  detailButtonText = "Details",
  selectButtonText = "Select PT",
}) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={styles.cardTouchable}
      activeOpacity={0.8}
      onPress={showButtons ? undefined : onPress}
    >
      <View style={styles.cardContainer}>
        <LinearGradient
          colors={["#FF914D", "#ED2A46"]}
          style={styles.gradientCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Top section with avatar and info */}
          <View style={styles.cardContent}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri:
                    item.avatarUrl ||
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREDVautKC6iIhByPKtNOGlHRa2E52Ahxt4jQ&s",
                }}
                style={styles.avatar}
              />
              <View style={styles.onlineIndicator} />
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.nameText}>{item.fullName}</Text>

              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  {item.gender === "Male" ? (
                    <Ionicons name="man" size={18} color="white" />
                  ) : (
                    <Ionicons name="woman" size={18} color="white" />
                  )}
                  <Text style={styles.detailText}>
                    {item.gender === "Male"
                      ? t("ptScreen.male")
                      : t("ptScreen.female")}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="fitness" size={18} color="white" />
                  <Text style={styles.detailText} numberOfLines={2}>
                    {item.goalTraining}
                  </Text>
                </View>
              </View>
            </View>

            {!showButtons && (
              <View style={styles.arrowContainer}>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color="rgba(255,255,255,0.8)"
                />
              </View>
            )}
          </View>

          {/* Show buttons for PTinCourseScreen */}
          {showButtons && (
            <>
              {/* Full-width button container */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.detailButton}
                  onPress={onDetailPress}
                >
                  <Ionicons
                    name="information-circle"
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.detailButtonText}>
                    {detailButtonText}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={onSelectPress}
                >
                  <Ionicons name="add-circle" size={16} color="#FF914D" />
                  <Text style={styles.selectButtonText}>
                    {selectButtonText}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardTouchable: {
    marginBottom: 16,
  },
  cardContainer: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gradientCard: {
    borderRadius: 16,
    padding: 0,
    overflow: "hidden",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 20,
    paddingBottom: 16,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#28A745",
    borderWidth: 2,
    borderColor: "white",
  },
  infoContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  detailsContainer: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  arrowContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },

  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  detailButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  detailButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  selectButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FF914D",
  },
});
