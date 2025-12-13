import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import colors from "../../constants/color";

const PTSessionCard = ({
  booking,
  formatTime,
  calculateDuration,
  onCancel,
  onFinish,
  t,
  customerName,
  customerAvatar = null,
  isCancelling = false,
  isFinishing = false,
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

  // Check if actions should be disabled
  const isActionDisabled =
    sessionStatus?.toLowerCase() === "cancelled" ||
    sessionStatus?.toLowerCase() === "finished" ||
    isCancelling ||
    isFinishing;

  // Check if the booking is in the past (based on end time)
  const isBookingInPast = (() => {
    try {
      const now = new Date();
      const bookingDateString = booking.bookingDate || booking.date;
      if (!bookingDateString || !endTime) return false;

      const bookingDate = new Date(bookingDateString);
      const timeParts = endTime.split(":");
      if (timeParts.length >= 2) {
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        const seconds = timeParts.length > 2 ? parseInt(timeParts[2], 10) : 0;
        bookingDate.setHours(hours, minutes, seconds, 0);
        return bookingDate < now;
      }
      return false;
    } catch (error) {
      console.log("Error checking booking date and time:", error);
      return false;
    }
  })();

  // Hide action buttons if booking is in the past or already completed/cancelled
  const shouldHideButtons = isBookingInPast || isActionDisabled;

  return (
    <View style={styles.sessionCard}>
      {/* Header with status */}
      <View style={[styles.cardHeader, { backgroundColor: statusInfo.color }]}>
        <View style={styles.headerContent}>
          <View style={styles.statusIndicator}>
            <Ionicons name={statusInfo.icon} size={16} color={colors.white} />
          </View>
          <Text style={styles.statusText}>{statusInfo.text}</Text>
        </View>
      </View>

      {/* Main content */}
      <View style={styles.cardBody}>
        <View style={styles.mainContent}>
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri:
                  customerAvatar ||
                  `https://cdn-icons-png.flaticon.com/512/12620/12620371.png`,
              }}
              style={styles.avatar}
              defaultSource={{
                uri: `https://cdn-icons-png.flaticon.com/512/12620/12620371.png`,
              }}
            />
            <View
              style={[
                styles.onlineIndicator,
                sessionStatus?.toLowerCase() === "finished" &&
                  styles.completedIndicator,
                sessionStatus?.toLowerCase() === "cancelled" &&
                  styles.cancelledIndicator,
              ]}
            />
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>{sessionTitle}</Text>
            <View style={styles.customerInfo}>
              <Ionicons name="person-outline" size={14} color={colors.red} />
              <Text style={styles.customerName}>{displayCustomerName}</Text>
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={14} color={colors.orange} />
                <Text style={styles.infoText}>
                  {formatTime(startTime)} - {formatTime(endTime)}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Ionicons
                  name="stopwatch-outline"
                  size={14}
                  color={colors.orange}
                />
                <Text style={styles.infoText}>
                  {calculateDuration(startTime, endTime)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Note */}
        {booking.note && (
          <View style={styles.noteContainer}>
            <Ionicons name="document-text-outline" size={16} color="#6c757d" />
            <Text style={styles.noteText} numberOfLines={2}>
              {booking.note}
            </Text>
          </View>
        )}

        {/* Action buttons - only show if not in past and not disabled */}
        {!shouldHideButtons && (
          <View style={styles.actionButtonsContainer}>
            {/* Finish Session Button */}
            {onFinish && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.finishButton,
                  isActionDisabled && styles.disabledButton,
                ]}
                onPress={onFinish}
                disabled={isActionDisabled}
              >
                {isFinishing ? (
                  <ActivityIndicator size="small" color="#28a745" />
                ) : (
                  <>
                    <Ionicons
                      name={
                        isActionDisabled
                          ? "ban-outline"
                          : "checkmark-circle-outline"
                      }
                      size={18}
                      color={isActionDisabled ? "#999" : "#28a745"}
                    />
                    <Text
                      style={[
                        styles.actionButtonText,
                        styles.finishButtonText,
                        isActionDisabled && styles.disabledButtonText,
                      ]}
                    >
                      {t ? t("calendar.finishSession") : "Finish"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {/* Cancel Session Button */}
            {onCancel && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.cancelButton,
                  isActionDisabled && styles.disabledButton,
                ]}
                onPress={onCancel}
                disabled={isActionDisabled}
              >
                {isCancelling ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <Ionicons
                      name={
                        isActionDisabled
                          ? "ban-outline"
                          : "close-circle-outline"
                      }
                      size={18}
                      color={isActionDisabled ? "#999" : colors.white}
                    />
                    <Text
                      style={[
                        styles.actionButtonText,
                        isActionDisabled && styles.disabledButtonText,
                      ]}
                    >
                      {t ? t("calendar.cancelSession") : "Cancel"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  cardBody: {
    padding: 20,
  },
  mainContent: {
    flexDirection: "row",
    alignItems: "flex-start",
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
  completedIndicator: {
    backgroundColor: "#2196F3",
  },
  cancelledIndicator: {
    backgroundColor: "#6c757d",
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
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  customerName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginLeft: 6,
  },
  infoContainer: {
    gap: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 8,
    fontWeight: "500",
  },
  courseInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F5",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  courseInfoText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.red,
    flex: 1,
  },
  noteContainer: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  noteText: {
    fontSize: 13,
    color: "#495057",
    flex: 1,
    fontStyle: "italic",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 2,
    gap: 8,
    flex: 1,
  },
  finishButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#28a745",
    shadowColor: "#28a745",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  finishButtonText: {
    color: "#28a745",
    fontWeight: "700",
  },
  cancelButton: {
    backgroundColor: "#EF4444",
    borderColor: "#EF4444",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 15,
    color: colors.white,
    fontWeight: "700",
  },
  disabledButton: {
    backgroundColor: "#F8F9FA",
    borderColor: "#E9ECEF",
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledButtonText: {
    color: "#999",
  },
});

export default PTSessionCard;
