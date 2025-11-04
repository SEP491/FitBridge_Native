import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import colors from "../../constants/color";

const PTSessionCard = ({
  booking,
  formatTime,
  calculateDuration,
  buttonText,
  buttonAction,
  viewDetailAction,
  t,
  customerName,
  customerAvatar = null,
}) => {
  // Extract data from booking API response
  const sessionStatus = booking.sessionStatus;

  const startTime = booking.startTime;
  const endTime = booking.endTime;

  // Use translation with fallbacks
  const displayCustomerName =
    customerName || (t ? t("common.customer") : "Customer");
  const sessionTitle =
    booking.bookingName || (t ? t("schedule.session") : "Training Session");
  const viewDetailText =
    buttonText || (t ? t("calendar.viewDetail") : "View Detail");

  // Determine status badge color and icon
  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case "booked":
        return {
          color: colors.orange,
          backgroundColor: "#FFF8F0",
          icon: "calendar-outline",
          text: t ? t("calendar.statusBooked") : "Booked",
        };
      case "finished":
        return {
          color: "#28a745",
          backgroundColor: "#F0F8F0",
          icon: "checkmark-circle-outline",
          text: t ? t("calendar.statusCompleted") : "Completed",
        };
      case "cancelled":
        return {
          color: "#6c757d",
          backgroundColor: "#F8F9FA",
          icon: "close-circle-outline",
          text: t ? t("calendar.statusCancelled") : "Cancelled",
        };
      case "waitingforedit":
        return {
          color: colors.orange,
          backgroundColor: "#FFF8F0",
          icon: "alert-circle-outline",
          text: t ? t("calendar.statusWaitingForEdit") : "Waiting for Edit",
        };
      default:
        return {
          color: colors.red,
          backgroundColor: "#FFF5F5",
          icon: "time-outline",
          text: t ? t("calendar.statusPending") : "Pending",
        };
    }
  };

  const statusInfo = getStatusInfo(sessionStatus);

  return (
    <View style={styles.sessionCard}>
      {/* Session Header */}
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Ionicons name="fitness" size={20} color={colors.red} />
          <Text style={styles.sessionTitle} numberOfLines={1}>
            {sessionTitle}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusInfo.backgroundColor },
          ]}
        >
          <Ionicons name={statusInfo.icon} size={14} color={statusInfo.color} />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>
        </View>
      </View>

      {/* Time and Duration Info */}
      <View style={styles.timeSection}>
        <View style={styles.timeRow}>
          <View style={styles.timeItem}>
            <Ionicons name="time-outline" size={16} color="#6c757d" />
            <Text style={styles.timeLabel}>
              {t ? t("calendar.startTime") : "Start"}:
            </Text>
            <Text style={styles.timeValue}>{formatTime(startTime)}</Text>
          </View>
          <View style={styles.timeDivider} />
          <View style={styles.timeItem}>
            <Ionicons name="time-outline" size={16} color="#6c757d" />
            <Text style={styles.timeLabel}>
              {t ? t("calendar.endTime") : "End"}:
            </Text>
            <Text style={styles.timeValue}>{formatTime(endTime)}</Text>
          </View>
        </View>

        <View style={styles.durationContainer}>
          <Ionicons name="timer-outline" size={16} color={colors.red} />
          <Text style={styles.durationText}>
            {calculateDuration(startTime, endTime)}
          </Text>
        </View>
      </View>

      {/* Customer Info */}
      <View style={styles.customerSection}>
        <View style={styles.customerInfo}>
          {customerAvatar ? (
            <Image
              source={{ uri: customerAvatar }}
              style={styles.customerAvatar}
            />
          ) : (
            <View style={styles.customerAvatarPlaceholder}>
              <Ionicons name="person" size={24} color="#fff" />
            </View>
          )}
          <View style={styles.customerDetails}>
            <Text style={styles.customerLabel}>
              {t ? t("calendar.customer") : "Customer"}
            </Text>
            <Text style={styles.customerName} numberOfLines={1}>
              {displayCustomerName}
            </Text>
          </View>
        </View>
      </View>

      {/* Course/Gym Slot Info */}
      {booking.courseName && (
        <View style={styles.infoRow}>
          <Ionicons name="barbell-outline" size={16} color="#6c757d" />
          <Text style={styles.infoLabel}>
            {t ? t("calendar.course") : "Course"}:
          </Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {booking.courseName}
          </Text>
        </View>
      )}

      {booking.gymSlotName && (
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#6c757d" />
          <Text style={styles.infoLabel}>
            {t ? t("calendar.gymSlot") : "Gym Slot"}:
          </Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {booking.gymSlotName}
          </Text>
        </View>
      )}

      {/* Note */}
      {booking.note && (
        <View style={styles.noteContainer}>
          <Ionicons name="document-text-outline" size={16} color="#6c757d" />
          <Text style={styles.noteText} numberOfLines={2}>
            {booking.note}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      {/* <View style={styles.actionButtons}>
        {viewDetailAction && (
          <TouchableOpacity
            style={styles.viewDetailButton}
            onPress={viewDetailAction}
          >
            <Ionicons name="eye-outline" size={18} color={colors.red} />
            <Text style={styles.viewDetailButtonText}>{viewDetailText}</Text>
          </TouchableOpacity>
        )}
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  sessionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  timeSection: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  timeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  timeDivider: {
    width: 1,
    backgroundColor: "#dee2e6",
    marginHorizontal: 8,
  },
  timeLabel: {
    fontSize: 12,
    color: "#6c757d",
  },
  timeValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#dee2e6",
  },
  durationText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.red,
  },
  customerSection: {
    marginBottom: 12,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.red,
  },
  customerAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.red,
    justifyContent: "center",
    alignItems: "center",
  },
  customerDetails: {
    flex: 1,
  },
  customerLabel: {
    fontSize: 12,
    color: "#6c757d",
    marginBottom: 2,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: "#6c757d",
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "500",
    color: "#333",
    flex: 1,
  },
  noteContainer: {
    flexDirection: "row",
    gap: 6,
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 12,
  },
  noteText: {
    fontSize: 13,
    color: "#495057",
    flex: 1,
    fontStyle: "italic",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  viewDetailButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: colors.red,
    paddingVertical: 10,
    borderRadius: 10,
  },
  viewDetailButtonText: {
    color: colors.red,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default PTSessionCard;
