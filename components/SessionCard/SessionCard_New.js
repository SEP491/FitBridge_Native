import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import colors from "../../constants/color";

const SessionCard = ({
  session,
  formatTime,
  calculateDuration,
  buttonText,
  buttonAction,
  t, // translation function
  withText, // text for "with"
}) => {
  // Use API response format directly
  const ptName = session.ptName;
  const ptAvatar = session.ptAvatarUrl;
  const sessionTitle =
    session.title || (t ? t("schedule.ptSession") : "PT Training Session");

  // Use API time format directly
  const startTime = session.startTime;
  const endTime = session.endTime;

  // Use translation with fallbacks
  const cancelText = buttonText || (t ? t("calendar.cancelSession") : "Cancel");
  const withPtText = withText || (t ? t("calendar.with") : "with");

  return (
    <View style={styles.sessionCard}>
      {/* Header with gradient background */}
      <View style={styles.cardHeader}>
        <View style={styles.headerContent}>
          <View style={styles.sessionTypeIndicator}>
            <Ionicons name="fitness-outline" size={16} color={colors.white} />
          </View>
          <Text style={styles.sessionTypeText}>
            {t ? t("calendar.personalTrainingSession") : "Personal Training"}
          </Text>
        </View>
      </View>

      {/* Main content */}
      <View style={styles.cardBody}>
        <View style={styles.mainContent}>
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri:
                  ptAvatar ||
                  `https://cdn-icons-png.flaticon.com/512/12620/12620371.png`,
              }}
              style={styles.avatar}
              defaultSource={{
                uri: `https://cdn-icons-png.flaticon.com/512/12620/12620371.png`,
              }}
            />
            <View style={styles.onlineIndicator} />
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>{sessionTitle}</Text>
            <View style={styles.trainerInfo}>
              <Ionicons name="person-outline" size={14} color={colors.red} />
              <Text style={styles.trainerName}>{ptName}</Text>
            </View>

            <View style={styles.timeContainer}>
              <View style={styles.timeItem}>
                <Ionicons name="time-outline" size={14} color={colors.orange} />
                <Text style={styles.timeText}>
                  {formatTime(startTime)} - {formatTime(endTime)}
                </Text>
              </View>
              <View style={styles.durationItem}>
                <Ionicons
                  name="stopwatch-outline"
                  size={14}
                  color={colors.orange}
                />
                <Text style={styles.durationText}>
                  {calculateDuration(startTime, endTime)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action button */}
        <TouchableOpacity style={styles.actionButton} onPress={buttonAction}>
          <Ionicons name="calendar" size={18} color={colors.white} />
          <Text style={styles.actionButtonText}>{cancelText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sessionCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  cardHeader: {
    backgroundColor: colors.red,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  sessionTypeIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sessionTypeText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  cardBody: {
    padding: 20,
  },
  mainContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  imageContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: colors.white,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#4CAF50",
    borderWidth: 3,
    borderColor: colors.white,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  trainerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  trainerName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginLeft: 6,
  },
  timeContainer: {
    gap: 8,
  },
  timeItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 8,
    fontWeight: "500",
  },
  durationItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 8,
    fontWeight: "500",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF6B35",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#FF6B35",
    gap: 8,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  actionButtonText: {
    fontSize: 15,
    color: colors.white,
    fontWeight: "700",
  },
});

export default SessionCard;
