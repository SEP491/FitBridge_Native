import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import colors from "../../constants/color";
import { useNavigation } from "@react-navigation/native";
import signalR_webrtcService from "../../services/signalR/signalR-webrtcService";
import meetingService from "../../services/meetingService";

const SessionBookingCard = ({
  booking,
  formatTime,
  calculateDuration,
  buttonText,
  buttonAction,
  editButtonText, // text for edit button
  editButtonAction, // action for edit button
  showEditButton = true, // whether to show edit button
  viewDetailAction, // action for view detail button
  t, // translation function
  ptName, // PT name from props
  ptAvatar = null, // optional PT avatar
}) => {
  // Extract data from booking API response
  const sessionStatus = booking.sessionStatus;
  const navigation = useNavigation();
  console.log("Booking data in SessionBookingCard:", booking);
  const [isJoiningMeeting, setIsJoiningMeeting] = useState(false);
  const [isMeetingButtonEnabled, setIsMeetingButtonEnabled] = useState(false);
  const [meetingErrorMessage, setMeetingErrorMessage] = useState("");
  // Use gym slot times from the API response
  const startTime = booking.startTime || booking.ptFreelanceStartTime;
  const endTime = booking.endTime || booking.ptFreelanceEndTime;

  // Use translation with fallbacks
  const displayPtName =
    ptName || (t ? t("common.personalTrainer") : "Personal Trainer");
  const sessionTitle =
    booking.bookingName ||
    (t ? t("schedule.ptSession") : "PT Training Session");
  const cancelText =
    buttonText || (t ? t("calendar.cancelSession") : "Cancel Session");
  const editText = editButtonText || (t ? t("calendar.requestEdit") : "Edit");

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

  const isActionDisabled =
    sessionStatus?.toLowerCase() === "cancelled" ||
    sessionStatus?.toLowerCase() === "completed" ||
    isJoiningMeeting;

  // Compute Date for start time (today's booking date + startTime)
  const getStartDateTime = () => {
    try {
      const bookingDateString = booking.bookingDate || booking.date;
      if (!bookingDateString || !startTime) return null;

      const bookingDate = new Date(bookingDateString);
      const timeParts = startTime.split(":");
      if (timeParts.length >= 2) {
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        const seconds = timeParts.length > 2 ? parseInt(timeParts[2], 10) : 0;
        bookingDate.setHours(hours, minutes, seconds, 0);
        return bookingDate;
      }
      return null;
    } catch (error) {
      console.log("Error parsing start datetime:", error);
      return null;
    }
  };

  // Keep current time in state to compare with start time
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 30 * 1000); // update every 30 seconds

    return () => clearInterval(intervalId);
  }, []);

  const sessionStartDateTime = getStartDateTime();

  // Check if the booking startTime is in the past
  const isBookingInPast = (() => {
    try {
      const now = new Date();

      // Create a date object from the booking date (format: "YYYY-MM-DD")
      const bookingDateString = booking.bookingDate || booking.date;
      if (!bookingDateString || !startTime) return false;

      const bookingDate = new Date(bookingDateString);

      // Extract hours, minutes, and seconds from startTime (format: "HH:MM:SS")
      const timeParts = endTime.split(":");
      if (timeParts.length >= 2) {
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        const seconds = timeParts.length > 2 ? parseInt(timeParts[2], 10) : 0;

        // Set the exact booking datetime
        bookingDate.setHours(hours, minutes, seconds, 0);

        // Check if this datetime is in the past
        return bookingDate < now;
      }

      return false;
    } catch (error) {
      console.log("Error checking booking date and time:", error);
      return false;
    }
  })();

  // Determine if we are exactly at or after the start time (and before end time)
  const isSessionReady = (() => {
    if (!sessionStartDateTime) return false;
    // Enable when current time is at or after start time, and not in the past beyond endTime check above
    return currentTime >= sessionStartDateTime && !isBookingInPast;
  })();

  // Update meeting button enabled state based on time and any previous meeting error
  useEffect(() => {
    // After end time: always disabled, keep any existing message but don't auto-set
    if (isBookingInPast) {
      setIsMeetingButtonEnabled(false);
      return;
    }

    if (!isSessionReady) {
      setIsMeetingButtonEnabled(false);
      setMeetingErrorMessage(
        t ? t("videoCallPrep.sessionNotReady") : "Session not ready yet."
      );
    } else if (meetingErrorMessage) {
      // Session time reached but we previously failed to create/find meeting
      setIsMeetingButtonEnabled(false);
    } else {
      setIsMeetingButtonEnabled(true);
      setMeetingErrorMessage("");
    }
  }, [isSessionReady, isBookingInPast, meetingErrorMessage, t]);

  // Hide button if booking is in the past or disabled by status
  const shouldHideButton = isBookingInPast || isActionDisabled;

  const handleJoinMeeting = async () => {
    // Prevent action when disabled by status or time
    if (isJoiningMeeting || !isSessionReady || !isMeetingButtonEnabled) {
      return;
    }

    if (!booking?.bookingId) {
      Alert.alert(
        t ? t("errors.error") : "Error",
        t ? t("videoCallPrep.meetingInitError") : "Unable to prepare the call. Please try again."
      );
      return;
    }

    try {
      setIsJoiningMeeting(true);
      await signalR_webrtcService.startConnection();

      let meetingId = null;
      try {
        const response = await meetingService.getMeetingById(booking.bookingId);
        meetingId = response?.data?.id;
      } catch (error) {
        console.log("Meeting not found, will create new one.", error);
      }

      if (!meetingId) {
        try {
          const createResponse = await meetingService.createMeeting({
            bookingId: booking.bookingId,
          });
          meetingId = createResponse?.data?.id;
        } catch (createError) {
          console.error("Error creating meeting:", createError);
          // Mark as not available and disable button
          setMeetingErrorMessage(
            t
              ? t("videoCallPrep.meetingNoLongerAvailable")
              : "Online meeting no longer available."
          );
          setIsMeetingButtonEnabled(false);
          Alert.alert(
            t ? t("errors.error") : "Error",
            t
              ? t("videoCallPrep.meetingNoLongerAvailable")
              : "Online meeting no longer available."
          );
          return;
        }
      }

      if (!meetingId) {
        throw new Error("Meeting ID not available");
      }

      navigation.navigate("VideoCallPrep", {
        booking: booking,
        meetingId,
      });
    } catch (error) {
      console.error("Error preparing meeting:", error);
      Alert.alert(
        t ? t("errors.error") : "Error",
        t
          ? t("videoCallPrep.meetingInitError")
          : "Unable to prepare the call. Please try again."
      );
      // Any other error should keep the button disabled with generic message
      setMeetingErrorMessage(
        t
          ? t("videoCallPrep.meetingInitError")
          : "Unable to prepare the call. Please try again."
      );
      setIsMeetingButtonEnabled(false);
    } finally {
      setIsJoiningMeeting(false);
    }
  };

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
                  ptAvatar ||
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
                sessionStatus?.toLowerCase() === "completed" &&
                  styles.completedIndicator,
              ]}
            />
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>{sessionTitle}</Text>
            <View style={styles.trainerInfo}>
              <Ionicons name="person-outline" size={14} color={colors.red} />
              <Text style={styles.trainerName}>{displayPtName}</Text>
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

        {/* Meeting Button Section */}
        <TouchableOpacity
          style={[
            styles.meetingButton,
            (isBookingInPast ||
              isActionDisabled ||
              !isSessionReady ||
              !isMeetingButtonEnabled) &&
              styles.disabledMeetingButton,
          ]}
          onPress={handleJoinMeeting}
          disabled={
            isBookingInPast ||
            isActionDisabled ||
            !isSessionReady ||
            !isMeetingButtonEnabled
          }
        >
          {isJoiningMeeting ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Ionicons
              name={
                isBookingInPast ||
                isActionDisabled ||
                !isSessionReady ||
                !isMeetingButtonEnabled
                  ? "ban-outline"
                  : "videocam-outline"
              }
              size={18}
              color={
                isBookingInPast ||
                isActionDisabled ||
                !isSessionReady ||
                !isMeetingButtonEnabled
                  ? "#999"
                  : colors.white
              }
            />
          )}
          <Text
            style={[
              styles.meetingButtonText,
              (isBookingInPast ||
                isActionDisabled ||
                !isSessionReady ||
                !isMeetingButtonEnabled) &&
                styles.disabledMeetingButtonText,
            ]}
          >
            {isJoiningMeeting
              ? t
                ? t("videoCallPrep.joining")
                : "Joining..."
              : isBookingInPast
              ? // After end time: always show join text but keep button disabled
                t
                ? t("calendar.meetingOnline")
                : "Join Meeting Online"
              : !isSessionReady
              ? t
                ? t("videoCallPrep.sessionNotReady")
                : "Session not ready yet."
              : meetingErrorMessage
              ? meetingErrorMessage
              : t
              ? t("calendar.meetingOnline")
              : "Join Meeting Online"}
          </Text>
        </TouchableOpacity>

        {/* View Detail Button - Always visible */}
        {!booking.ptGymSlotId && viewDetailAction && (
          <TouchableOpacity
            style={styles.viewDetailButton}
            onPress={viewDetailAction}
          >
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={colors.white}
            />
            <Text style={styles.viewDetailText}>
              {t ? t("calendar.viewDetail") : "View Detail"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Action buttons - only show if not in past and not disabled */}
        {!shouldHideButton && (
          <View style={styles.actionButtonsContainer}>
            {/* Request Edit Button */}
            {showEditButton && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.editButton,
                  isActionDisabled && styles.disabledButton,
                ]}
                onPress={editButtonAction}
                disabled={isActionDisabled}
              >
                <Ionicons
                  name={isActionDisabled ? "ban-outline" : "create-outline"}
                  size={18}
                  color={isActionDisabled ? "#999" : "#F97316"}
                />
                <Text
                  style={[
                    styles.actionButtonText,
                    styles.editButtonText,
                    isActionDisabled && styles.disabledButtonText,
                  ]}
                >
                  {editText}
                </Text>
              </TouchableOpacity>
            )}

            {/* Cancel Button */}
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.cancelButton,
                isActionDisabled && styles.disabledButton,
                showEditButton && styles.halfWidthButton,
              ]}
              onPress={buttonAction}
              disabled={isActionDisabled}
            >
              <Ionicons
                name={isActionDisabled ? "ban-outline" : "close-circle-outline"}
                size={18}
                color={isActionDisabled ? "#999" : colors.white}
              />
              <Text
                style={[
                  styles.actionButtonText,
                  isActionDisabled && styles.disabledButtonText,
                ]}
              >
                {cancelText}
              </Text>
            </TouchableOpacity>
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
  bookingId: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.9)",
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
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    gap: 8,
    flex: 1,
  },
  halfWidthButton: {
    flex: 1,
  },
  meetingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 2,
    backgroundColor: "#ED2A46",
    borderColor: "#ED2A46",
    gap: 6,
    marginTop: 12,
    shadowColor: "#ED2A46",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  meetingButtonText: {
    fontSize: 15,
    color: colors.white,
    fontWeight: "700",
  },
  disabledMeetingButton: {
    backgroundColor: "#F8F9FA",
    borderColor: "#E9ECEF",
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledMeetingButtonText: {
    color: "#999",
  },

  editButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F97316",
    borderWidth: 2,
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  editButtonText: {
    color: "#F97316",
    fontWeight: "700",
  },
  cancelButton: {
    backgroundColor: "#EF4444",
    borderColor: "#EF4444",
    borderWidth: 2,
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
  },
  disabledButtonText: {
    color: "#999",
  },
  viewDetailButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 2,
    backgroundColor: "#FF6B35",
    borderColor: "#FF6B35",
    gap: 6,
    marginTop: 12,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  viewDetailText: {
    fontSize: 15,
    color: colors.white,
    fontWeight: "700",
  },
});

export default SessionBookingCard;
