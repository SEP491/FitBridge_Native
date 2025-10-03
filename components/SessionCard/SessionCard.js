import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import colors from "../../constants/color";

const SessionCard = ({
  session,
  formatTime,
  calculateDuration,
  buttonText = "Hủy lịch",
  buttonAction,
  t, // translation function
  withText = "với", // default Vietnamese text for "with"
}) => {
  // Use API response format directly
  const ptName = session.ptName;
  const ptAvatar = session.avatarUrl;
  const ptInitials = ptName?.charAt(0)?.toUpperCase() || "PT";
  const sessionTitle = session.title || t("schedule.ptSession");

  // Use API time format directly
  const startTime = session.startTime;
  const endTime = session.endTime;

  return (
    <View style={styles.sessionCard}>
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              ptAvatar ||
              `https://via.placeholder.com/60x60/f0f0f0/666?text=${ptInitials}`,
          }}
          style={styles.avatar}
          defaultSource={{
            uri: `https://via.placeholder.com/60x60/f0f0f0/666?text=${ptInitials}`,
          }}
        />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>PT</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{sessionTitle}</Text>
        <Text style={styles.trainerName}>
          {withText} {ptName}
        </Text>
        <View style={styles.details}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {formatTime(startTime)} - {formatTime(endTime)}
          </Text>
          <Ionicons
            name="stopwatch-outline"
            size={16}
            color="#666"
            style={{ marginLeft: 12 }}
          />
          <Text style={styles.detailText}>
            {calculateDuration(startTime, endTime)}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.actionButton} onPress={buttonAction}>
        <Text style={styles.actionButtonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sessionCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },
  imageContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  badge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: colors.red,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  trainerName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  details: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  actionButton: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  actionButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
});

export default SessionCard;
