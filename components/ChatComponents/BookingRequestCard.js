import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import colors from "../../constants/color";

const { width } = Dimensions.get("window");

const BookingRequestCard = ({
  bookingRequest,
  isCurrentUser,
  onAction,
  onEdit,
  senderAvatarUrl,
}) => {
  const {
    bookingRequestId,
    requestStatus,
    requestType,
    startTime,
    endTime,
    bookingDate,
    note,
    bookingName,
  } = bookingRequest;

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  // Format time
  const formatTime = (timeString) => {
    try {
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  };

  // Get status color and icon
  const getStatusInfo = () => {
    switch (requestStatus) {
      case "Approved":
        return {
          color: "#10B981",
          icon: "checkmark-circle",
          label: "Approved",
        };
      case "Pending":
        return {
          color: "#F59E0B",
          icon: "time",
          label: "Pending",
        };
      case "Rejected":
        return {
          color: "#EF4444",
          icon: "close-circle",
          label: "Rejected",
        };
      default:
        return {
          color: "#6B7280",
          icon: "help-circle",
          label: requestStatus,
        };
    }
  };

  // Get request type label
  const getRequestTypeLabel = () => {
    switch (requestType) {
      case "CustomerCreate":
        return "Customer Created";
      case "PtUpdate":
        return "PT Updated";
      case "CustomerUpdate":
        return "Customer Updated";
      default:
        return requestType;
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <View
      style={[
        styles.container,
        isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer,
      ]}
    >
      {/* Avatar for other user */}
      {!isCurrentUser && (
        <Image
          source={{ uri: senderAvatarUrl }}
          style={styles.avatar}
          resizeMode="cover"
        />
      )}

      <View style={styles.cardWrapper}>
        <View
          style={[
            styles.card,
            isCurrentUser ? styles.currentUserCard : styles.otherUserCard,
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons
                name="calendar"
                size={20}
                color={isCurrentUser ? "#FFFFFF" : colors.red}
              />
              <Text
                style={[
                  styles.headerTitle,
                  isCurrentUser
                    ? styles.currentUserHeaderTitle
                    : styles.otherUserHeaderTitle,
                ]}
              >
                Booking Request
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isCurrentUser
                    ? "rgba(255,255,255,0.2)"
                    : statusInfo.color + "20",
                },
              ]}
            >
              <Ionicons
                name={statusInfo.icon}
                size={14}
                color={isCurrentUser ? "#FFFFFF" : statusInfo.color}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: isCurrentUser ? "#FFFFFF" : statusInfo.color },
                ]}
              >
                {statusInfo.label}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View
            style={[
              styles.divider,
              isCurrentUser
                ? styles.currentUserDivider
                : styles.otherUserDivider,
            ]}
          />

          {/* Booking Details */}
          <View style={styles.details}>
            {/* Booking Name */}
            <View style={styles.detailRow}>
              <Ionicons
                name="bookmark"
                size={16}
                color={isCurrentUser ? "rgba(255,255,255,0.9)" : "#374151"}
              />
              <Text
                style={[
                  styles.bookingName,
                  isCurrentUser
                    ? styles.currentUserDetailText
                    : styles.otherUserDetailText,
                ]}
              >
                {bookingName}
              </Text>
            </View>

            {/* Date */}
            <View style={styles.detailRow}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={isCurrentUser ? "rgba(255,255,255,0.9)" : "#374151"}
              />
              <Text
                style={[
                  styles.detailText,
                  isCurrentUser
                    ? styles.currentUserDetailText
                    : styles.otherUserDetailText,
                ]}
              >
                {formatDate(bookingDate)}
              </Text>
            </View>

            {/* Time */}
            <View style={styles.detailRow}>
              <Ionicons
                name="time-outline"
                size={16}
                color={isCurrentUser ? "rgba(255,255,255,0.9)" : "#374151"}
              />
              <Text
                style={[
                  styles.detailText,
                  isCurrentUser
                    ? styles.currentUserDetailText
                    : styles.otherUserDetailText,
                ]}
              >
                {formatTime(startTime)} - {formatTime(endTime)}
              </Text>
            </View>

            {/* Request Type */}
            <View style={styles.detailRow}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={isCurrentUser ? "rgba(255,255,255,0.9)" : "#374151"}
              />
              <Text
                style={[
                  styles.detailTextSmall,
                  isCurrentUser
                    ? styles.currentUserDetailText
                    : styles.otherUserDetailText,
                ]}
              >
                {getRequestTypeLabel()}
              </Text>
            </View>

            {/* Note */}
            {note && (
              <View style={styles.noteContainer}>
                <Text
                  style={[
                    styles.noteLabel,
                    isCurrentUser
                      ? styles.currentUserDetailText
                      : styles.otherUserDetailText,
                  ]}
                >
                  Note:
                </Text>
                <Text
                  style={[
                    styles.noteText,
                    isCurrentUser
                      ? styles.currentUserDetailText
                      : styles.otherUserDetailText,
                  ]}
                >
                  {note}
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons (for received requests) */}
          {!isCurrentUser && requestStatus === "Pending" && (
            <>
              {onEdit && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButtonReceived]}
                    onPress={() => onEdit(bookingRequest)}
                  >
                    <Ionicons name="create-outline" size={18} color="#3B82F6" />
                    <Text style={styles.editButtonReceivedText}>
                      Edit Request
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              {onAction && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => onAction(bookingRequestId, "reject")}
                  >
                    <Ionicons name="close" size={18} color="#EF4444" />
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => onAction(bookingRequestId, "approve")}
                  >
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                    <Text style={styles.approveButtonText}>Approve</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          {/* Edit Button (for sent pending requests) */}
          {isCurrentUser && requestStatus === "Pending" && onEdit && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => onEdit(bookingRequest)}
              >
                <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                <Text style={styles.editButtonText}>Edit Request</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Avatar for current user */}
      {isCurrentUser && (
        <Image
          source={{ uri: senderAvatarUrl }}
          style={styles.avatar}
          resizeMode="cover"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 12,
    marginVertical: 4,
  },
  currentUserContainer: {
    justifyContent: "flex-end",
  },
  otherUserContainer: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 8,
    backgroundColor: "#E5E7EB",
  },
  cardWrapper: {
    maxWidth: width * 0.7,
  },
  card: {
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentUserCard: {
    backgroundColor: colors.red,
  },
  otherUserCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },
  currentUserHeaderTitle: {
    color: "#FFFFFF",
  },
  otherUserHeaderTitle: {
    color: "#111827",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  currentUserDivider: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  otherUserDivider: {
    backgroundColor: "#E5E7EB",
  },
  details: {
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  bookingName: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    flex: 1,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  detailTextSmall: {
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  currentUserDetailText: {
    color: "#FFFFFF",
  },
  otherUserDetailText: {
    color: "#374151",
  },
  noteContainer: {
    marginTop: 4,
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  noteText: {
    fontSize: 13,
    fontStyle: "italic",
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  rejectButton: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  approveButton: {
    backgroundColor: "#10B981",
  },
  editButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  editButtonFull: {
    flex: 1,
  },
  editButtonReceived: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    flex: 1,
  },
  rejectButtonText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "600",
  },
  approveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  editButtonReceivedText: {
    color: "#3B82F6",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default BookingRequestCard;
