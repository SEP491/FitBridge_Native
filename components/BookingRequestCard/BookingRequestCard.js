import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../constants/color";
import { useTranslation } from "../../hooks/useTranslation";
import styles from "./styles";

const BookingRequestCard = ({
  request,
  userRole,
  onApprove,
  onReject,
  formatDate,
  formatTime,
}) => {
  const { t } = useTranslation();

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#FFA500";
      case "Approved":
        return "#4CAF50";
      case "Rejected":
        return "#F44336";
      default:
        return "#999";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return "time-outline";
      case "Approved":
        return "checkmark-circle-outline";
      case "Rejected":
        return "close-circle-outline";
      default:
        return "help-circle-outline";
    }
  };

  const getRequestTypeLabel = (requestType) => {
    switch (requestType) {
      case "CustomerCreate":
        return t("bookingRequest.requestTypes.customerRequest");
      case "PtCreate":
        return t("bookingRequest.requestTypes.ptProposal");
      case "CustomerUpdate":
        return t("bookingRequest.requestTypes.customerEditRequest");
      case "PtUpdate":
        return t("bookingRequest.requestTypes.ptEditRequest");
      default:
        return requestType;
    }
  };

  const shouldShowApproveButtons = () => {
    if (request.requestStatus !== "Pending" || !userRole) return false;

    // FreelancePT approves CustomerCreate and CustomerUpdate
    if (
      userRole === "FreelancePT" &&
      (request.requestType === "CustomerCreate" ||
        request.requestType === "CustomerUpdate")
    ) {
      return true;
    }

    // Customer approves PtCreate and PtUpdate
    if (
      userRole === "Customer" &&
      (request.requestType === "PtCreate" || request.requestType === "PtUpdate")
    ) {
      return true;
    }

    return false;
  };

  // Determine which user info to display based on the current user role
  const getDisplayUserInfo = () => {
    // If current user is FreelancePT, show customer info
    if (userRole === "FreelancePT") {
      return {
        name: request.customerName || "Unknown Customer",
        avatarUrl: request.customerAvatarUrl,
        label: "Customer",
      };
    }
    // If current user is Customer, show PT info
    else {
      return {
        name: request.ptName || "Unknown PT",
        avatarUrl:
          request.ptAvatarUrl ||
          "https://media.vov.vn/sites/default/files/styles/large/public/2022-08/anh-nen-avatar-dep_652403.jpg",
        label: "Personal Trainer",
      };
    }
  };

  const displayUser = getDisplayUserInfo();

  return (
    <View style={styles.requestCard}>
      {/* Card Header with User Info */}
      <View style={styles.cardHeader}>
        <View style={styles.userInfoContainer}>
          {/* User Avatar */}
          <View style={styles.avatarContainer}>
            {displayUser.avatarUrl ? (
              <Image
                source={{ uri: displayUser.avatarUrl }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={24} color={colors.red} />
              </View>
            )}
          </View>

          {/* User Name and Booking Title */}
          <View style={styles.userTextContainer}>
            <Text style={styles.userLabel}>{displayUser.label}</Text>
            <Text style={styles.userName}>{displayUser.name}</Text>
            <View style={styles.bookingTitleContainer}>
              <Ionicons name="calendar" size={14} color="#666" />
              <Text style={styles.bookingTitle}>
                {request.bookingName || "Booking Request"}
              </Text>
            </View>
          </View>
        </View>

        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(request.requestStatus) + "20" },
          ]}
        >
          <Ionicons
            name={getStatusIcon(request.requestStatus)}
            size={14}
            color={getStatusColor(request.requestStatus)}
          />
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(request.requestStatus) },
            ]}
          >
            {request.requestStatus}
          </Text>
        </View>
      </View>

      {/* Card Content */}
      <View style={styles.cardContent}>
        {/* Date */}
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={18} color="#666" />
          <Text style={styles.infoLabel}>{t("bookingRequest.date")}:</Text>
          <Text style={styles.infoValue}>
            {formatDate(request.bookingDate)}
          </Text>
        </View>

        {/* Time */}
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={18} color="#666" />
          <Text style={styles.infoLabel}>{t("bookingRequest.time")}:</Text>
          <Text style={styles.infoValue}>
            {formatTime(request.startTime)} - {formatTime(request.endTime)}
          </Text>
        </View>

        {/* Request Type */}
        <View style={styles.infoRow}>
          <Ionicons name="bookmark-outline" size={18} color="#666" />
          <Text style={styles.infoLabel}>{t("bookingRequest.type")}:</Text>
          <Text style={styles.infoValue}>
            {getRequestTypeLabel(request.requestType)}
          </Text>
        </View>

        {/* Note */}
        {request.note && (
          <View style={styles.infoRow}>
            <Ionicons name="document-text-outline" size={18} color="#666" />
            <Text style={styles.infoLabel}>{t("bookingRequest.note")}:</Text>
            <Text style={styles.infoValue} numberOfLines={2}>
              {request.note}
            </Text>
          </View>
        )}

        {/* Original Booking Section */}
        {request.targetBookingId &&
          request.originalBooking &&
          (request.requestType === "CustomerUpdate" ||
            request.requestType === "PtUpdate") && (
            <View style={styles.originalBookingSection}>
              <Text style={styles.originalBookingTitle}>
                {t("bookingRequest.originalBooking")}
              </Text>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={16} color="#999" />
                <Text style={styles.infoLabelSmall}>
                  {t("bookingRequest.date")}:
                </Text>
                <Text style={styles.infoValueSmall}>
                  {formatDate(request.originalBooking.bookingDate)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={16} color="#999" />
                <Text style={styles.infoLabelSmall}>
                  {t("bookingRequest.time")}:
                </Text>
                <Text style={styles.infoValueSmall}>
                  {formatTime(request.originalBooking.ptFreelanceStartTime)} -{" "}
                  {formatTime(request.originalBooking.ptFreelanceEndTime)}
                </Text>
              </View>
            </View>
          )}
      </View>

      {/* Action Buttons */}
      {shouldShowApproveButtons() && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => onApprove(request)}
          >
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <Text style={styles.approveButtonText}>
              {t("bookingRequest.approve")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rejectButton}
            onPress={() => onReject(request)}
          >
            <Ionicons name="close-circle" size={18} color="#fff" />
            <Text style={styles.rejectButtonText}>
              {t("bookingRequest.reject")}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default BookingRequestCard;
