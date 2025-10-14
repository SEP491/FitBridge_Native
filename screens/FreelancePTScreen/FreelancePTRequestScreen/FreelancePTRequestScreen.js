import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import accountService from "../../../services/accountService";
import colors from "../../../constants/color";
import { useTranslation } from "../../../hooks/useTranslation";
import { formatDateForAPI } from "../../../lib";

export default function FreelancePTRequestScreen() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all"); // all, Pending, Approved, Rejected

  // Form states
  const [bookingName, setBookingName] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Date/Time picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAllRequestsForPT = async () => {
    try {
      const response = await accountService.getAllRequestForUser({
        customerPurchasedId: "0199be61-cd7c-7ab0-a6d3-e84d463dd696",
        doApplyPaging: false,
      });
      setRequests(response.data?.items || []);
      console.log("PT request data:", response.data?.items || []);
    } catch (error) {
      console.error("Error loading request slots:", error);
      Alert.alert(
        t("common.error") || "Error",
        t("schedule.loadSlotsError") || "Failed to load requests"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAllRequestsForPT();
  };

  useEffect(() => {
    loadAllRequestsForPT();
  }, []);

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const parts = timeString.split(":");
    return `${parts[0]}:${parts[1]}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  const handleDateConfirm = (date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const handleStartTimeConfirm = (time) => {
    // Check if the selected date is today
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();

    // If today, check if selected time is in the past
    if (isToday) {
      const now = new Date();
      if (time < now) {
        Alert.alert(
          t("common.error") || "Error",
          "Cannot select a time in the past"
        );
        return;
      }
    }

    const hours = time.getHours().toString().padStart(2, "0");
    const minutes = time.getMinutes().toString().padStart(2, "0");
    setStartTime(`${hours}:${minutes}`);
    setShowStartTimePicker(false);
  };

  const handleEndTimeConfirm = (time) => {
    if (!startTime) {
      Alert.alert(
        t("common.error") || "Error",
        "Please select start time first"
      );
      return;
    }

    // Parse start time
    const [startHour, startMin] = startTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;

    // Parse end time
    const endHour = time.getHours();
    const endMin = time.getMinutes();
    const endMinutes = endHour * 60 + endMin;

    // Check if end time is at least 1 hour after start time
    const diffMinutes = endMinutes - startMinutes;
    if (diffMinutes < 60) {
      Alert.alert(
        t("common.error") || "Error",
        "End time must be at least 1 hour after start time"
      );
      return;
    }

    const hours = endHour.toString().padStart(2, "0");
    const minutes = endMin.toString().padStart(2, "0");
    setEndTime(`${hours}:${minutes}`);
    setShowEndTimePicker(false);
  };

  const resetForm = () => {
    setBookingName("");
    setSelectedDate(new Date());
    setStartTime("");
    setEndTime("");
  };

  const validateForm = () => {
    if (!bookingName.trim()) {
      Alert.alert(t("common.error") || "Error", "Please enter a booking name");
      return false;
    }
    if (!startTime) {
      Alert.alert(t("common.error") || "Error", "Please select start time");
      return false;
    }
    if (!endTime) {
      Alert.alert(t("common.error") || "Error", "Please select end time");
      return false;
    }

    // Validate time range
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const diffMinutes = endMinutes - startMinutes;

    if (diffMinutes < 60) {
      Alert.alert(
        t("common.error") || "Error",
        "End time must be at least 1 hour after start time"
      );
      return false;
    }

    return true;
  };

  const handleCreateRequest = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        customerPurchasedId: "0199be61-cd7c-7ab0-a6d3-e84d463dd696",
        requestBookings: [
          {
            bookingName: bookingName.trim(),
            bookingDate: formatDateForAPI(selectedDate),
            ptFreelanceStartTime: startTime,
            ptFreelanceEndTime: endTime,
          },
        ],
      };

      console.log("Creating PT request with payload:", payload);
      const response = await accountService.createBookingRequest(payload);

      Alert.alert(
        t("common.success") || "Success",
        "Booking request created successfully",
        [
          {
            text: "OK",
            onPress: () => {
              setShowCreateModal(false);
              resetForm();
              loadAllRequestsForPT();
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error creating booking request:", error);
      Alert.alert(
        t("common.error") || "Error",
        error.response?.data?.message || "Failed to create booking request"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveRequest = async (request) => {
    Alert.alert(
      "Approve Request",
      `Are you sure you want to approve this booking request for "${request.bookingName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          style: "default",
          onPress: async () => {
            try {
              // TODO: Implement approve API call
              await accountService.acceptBookingRequest({
                bookingRequestId: request.id,
              });
              console.log("Approving request:", request);
              Alert.alert("Success", "Request approved successfully");
              loadAllRequestsForPT();
            } catch (error) {
              Alert.alert("Error", "Failed to approve request");
            }
          },
        },
      ]
    );
  };

  const handleRejectRequest = async (request) => {
    Alert.alert(
      "Reject Request",
      `Are you sure you want to reject this booking request for "${request.bookingName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            try {
              // TODO: Implement reject API call
              await accountService.rejectBookingRequest({
                bookingRequestId: request.id,
              });
              console.log("Rejecting request:", request);
              Alert.alert("Success", "Request rejected successfully");
              loadAllRequestsForPT();
            } catch (error) {
              Alert.alert("Error", "Failed to reject request");
            }
          },
        },
      ]
    );
  };

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

  const getFilteredRequests = () => {
    // PT only sees CustomerCreate requests
    const customerRequests = requests.filter(
      (req) => req.requestType === "CustomerCreate"
    );

    if (filterStatus === "all") {
      return customerRequests;
    }
    return customerRequests.filter((req) => req.requestStatus === filterStatus);
  };

  const getStatusCount = (status) => {
    // PT only sees CustomerCreate requests
    const customerRequests = requests.filter(
      (req) => req.requestType === "CustomerCreate"
    );

    if (status === "all") return customerRequests.length;
    return customerRequests.filter((req) => req.requestStatus === status)
      .length;
  };

  const renderRequestCard = (request, index) => (
    <View key={index} style={styles.requestCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Ionicons name="person-outline" size={20} color={colors.red} />
          <Text style={styles.cardTitle}>
            {request.bookingName || "Booking Request"}
          </Text>
        </View>
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

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={18} color="#666" />
          <Text style={styles.infoLabel}>Time:</Text>
          <Text style={styles.infoValue}>
            {formatTime(request.startTime)} - {formatTime(request.endTime)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="bookmark-outline" size={18} color="#666" />
          <Text style={styles.infoLabel}>From:</Text>
          <Text style={styles.infoValue}>
            {request.requestType === "CustomerCreate" ? "Customer" : "PT"}
          </Text>
        </View>

        {request.note && (
          <View style={styles.infoRow}>
            <Ionicons name="document-text-outline" size={18} color="#666" />
            <Text style={styles.infoLabel}>Note:</Text>
            <Text style={styles.infoValue} numberOfLines={2}>
              {request.note}
            </Text>
          </View>
        )}
      </View>

      {/* Show approve/reject only for CustomerCreate requests (pending) */}
      {request.requestStatus === "Pending" &&
        request.requestType === "CustomerCreate" && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.approveButton}
              onPress={() => handleApproveRequest(request)}
            >
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
              <Text style={styles.approveButtonText}>Approve</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => handleRejectRequest(request)}
            >
              <Ionicons name="close-circle" size={18} color="#fff" />
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
    </View>
  );

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        setShowCreateModal(false);
        resetForm();
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Booking Request</Text>
            <TouchableOpacity
              onPress={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
          >
            {/* Booking Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <Ionicons name="create-outline" size={16} color={colors.red} />{" "}
                Booking Name *
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter booking name"
                value={bookingName}
                onChangeText={setBookingName}
                placeholderTextColor="#999"
              />
            </View>

            {/* Date Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={colors.red}
                />{" "}
                Date *
              </Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.datePickerText}>
                  {selectedDate.toLocaleDateString("en-GB")}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Start Time Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <Ionicons name="time-outline" size={16} color={colors.red} />{" "}
                Start Time *
              </Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowStartTimePicker(true)}
              >
                <Text
                  style={[
                    styles.datePickerText,
                    !startTime && styles.placeholderText,
                  ]}
                >
                  {startTime || "Select start time"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* End Time Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <Ionicons name="time-outline" size={16} color={colors.red} />{" "}
                End Time *
              </Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowEndTimePicker(true)}
              >
                <Text
                  style={[
                    styles.datePickerText,
                    !endTime && styles.placeholderText,
                  ]}
                >
                  {endTime || "Select end time"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCreateRequest}
              disabled={isSubmitting}
            >
              <LinearGradient
                colors={["#FF914D", "#ED2A46"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButtonGradient}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons
                      name="add-circle-outline"
                      size={20}
                      color="#fff"
                    />
                    <Text style={styles.submitButtonText}>Create Request</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setShowDatePicker(false)}
        date={selectedDate}
        minimumDate={new Date()}
      />

      {/* Start Time Picker Modal */}
      <DateTimePickerModal
        isVisible={showStartTimePicker}
        mode="time"
        onConfirm={handleStartTimeConfirm}
        onCancel={() => setShowStartTimePicker(false)}
        is24Hour={true}
        minimumDate={new Date()}
      />

      {/* End Time Picker Modal */}
      <DateTimePickerModal
        isVisible={showEndTimePicker}
        mode="time"
        onConfirm={handleEndTimeConfirm}
        onCancel={() => setShowEndTimePicker(false)}
        is24Hour={true}
        minimumDate={new Date()}
      />
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.red} />
        <Text style={styles.loadingText}>Loading requests...</Text>
      </View>
    );
  }

  const filteredRequests = getFilteredRequests();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.red} />
      <View style={styles.container}>
        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterTab,
                filterStatus === "all" && styles.filterTabActive,
              ]}
              onPress={() => setFilterStatus("all")}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filterStatus === "all" && styles.filterTabTextActive,
                ]}
              >
                All ({getStatusCount("all")})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterTab,
                filterStatus === "Pending" && styles.filterTabActive,
              ]}
              onPress={() => setFilterStatus("Pending")}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filterStatus === "Pending" && styles.filterTabTextActive,
                ]}
              >
                Pending ({getStatusCount("Pending")})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterTab,
                filterStatus === "Approved" && styles.filterTabActive,
              ]}
              onPress={() => setFilterStatus("Approved")}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filterStatus === "Approved" && styles.filterTabTextActive,
                ]}
              >
                Approved ({getStatusCount("Approved")})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterTab,
                filterStatus === "Rejected" && styles.filterTabActive,
              ]}
              onPress={() => setFilterStatus("Rejected")}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filterStatus === "Rejected" && styles.filterTabTextActive,
                ]}
              >
                Rejected ({getStatusCount("Rejected")})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Requests List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.red]}
            />
          }
        >
          {filteredRequests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                No {filterStatus !== "all" ? filterStatus.toLowerCase() : ""}{" "}
                requests
              </Text>
              <Text style={styles.emptySubtext}>
                {filterStatus === "Pending"
                  ? "No pending requests to review"
                  : filterStatus === "all"
                  ? "You don't have any booking requests yet"
                  : `No ${filterStatus.toLowerCase()} requests found`}
              </Text>
            </View>
          ) : (
            filteredRequests.map((request, index) =>
              renderRequestCard(request, index)
            )
          )}
        </ScrollView>

        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowCreateModal(true)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#FF914D", "#ED2A46"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Create Modal */}
        {renderCreateModal()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.red,
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },

  filterContainer: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  filterTabActive: {
    backgroundColor: colors.red,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  filterTabTextActive: {
    color: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  requestCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    marginRight: 8,
  },
  titleTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardContent: {
    gap: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  approveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  approveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  rejectButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F44336",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  rejectButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fff",
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  datePickerText: {
    fontSize: 16,
    color: "#333",
  },
  placeholderText: {
    color: "#999",
  },
  submitButton: {
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
