import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import colors from "../../constants/color";

const SessionBookingCard = ({
  booking,
  formatTime,
  calculateDuration,
  buttonText = "Cancel Session",
  buttonAction,
  t, // translation function
  withText = "with", // default text for "with"
  ptName = "Personal Trainer", // fallback PT name
  ptAvatar = null, // optional PT avatar
}) => {
  // Extract data from booking API response
  const bookingId = booking.bookingId;
  const bookingDate = booking.bookingDate;
  const sessionStatus = booking.sessionStatus;

  // Use gym slot times from the API response
  const startTime = booking.gymSlotStartTime;
  const endTime = booking.gymSlotEndTime;

  // Generate PT initials for placeholder
  const ptInitials = ptName?.charAt(0)?.toUpperCase() || "PT";
  const sessionTitle = t ? t("schedule.ptSession") : "PT Training Session";

  // Determine status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "booked":
        return colors.red;
      case "completed":
        return "#28a745";
      case "cancelled":
        return "#6c757d";
      default:
        return colors.red;
    }
  };

  // Format booking date for display
  const formatBookingDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

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
        <View
          style={[
            styles.badge,
            { backgroundColor: getStatusColor(sessionStatus) },
          ]}
        >
          <Text style={styles.badgeText}>PT</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{sessionTitle}</Text>
        <Text style={styles.trainerName}>
          {withText} {ptName}
        </Text>

        {/* Booking Date */}

        {/* Time and Duration */}
        <View style={styles.details}>
          <Ionicons name="time-outline" size={18} color="#666" />
          <Text style={styles.detailText}>
            {formatTime(startTime)} - {formatTime(endTime)}
          </Text>
        </View>
        <View style={styles.details}>
          <Ionicons name="stopwatch-outline" size={18} color="#666" />
          <Text style={styles.detailText}>
            {calculateDuration(startTime, endTime)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.actionButton,
          sessionStatus?.toLowerCase() === "cancelled" && styles.disabledButton,
        ]}
        onPress={buttonAction}
        disabled={sessionStatus?.toLowerCase() === "cancelled"}
      >
        <Text
          style={[
            styles.actionButtonText,
            sessionStatus?.toLowerCase() === "cancelled" &&
              styles.disabledButtonText,
          ]}
        >
          {buttonText}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sessionCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  imageContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#f0f0f0",
  },
  badge: {
    position: "absolute",
    bottom: -3,
    right: -3,
    backgroundColor: colors.red,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: colors.red,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  trainerName: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
    fontWeight: "500",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  details: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  detailText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 6,
    fontWeight: "500",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
    textTransform: "uppercase",
  },
  actionButton: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 14,
    color: "#555",
    fontWeight: "600",
    textAlign: "center",
  },
  disabledButton: {
    backgroundColor: "#f8f9fa",
    borderColor: "#e9ecef",
    opacity: 0.7,
  },
  disabledButtonText: {
    color: "#6c757d",
  },
});

export default SessionBookingCard;
