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
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import accountService from "../../../services/accountService";
import colors from "../../../constants/color";
import { useTranslation } from "../../../hooks/useTranslation";
import { fetchUserFromStorage, formatDateForAPI } from "../../../lib";
import BookingRequestCard from "../../../components/BookingRequestCard";

export default function FreelancePTRequestScreen({ route }) {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const { customerPurchasedId } = route.params;
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await fetchUserFromStorage();
        console.log("Current user:", user.role);
        setUserRole(user.role);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  const loadAllRequestsForPT = async () => {
    try {
      const response = await accountService.getAllRequestForUser({
        customerPurchasedId: customerPurchasedId,
        doApplyPaging: false,
      });
      setRequests(response.data?.items || []);
      console.log("PT request data:", response.data?.items || []);
    } catch (error) {
      console.error("Error loading request slots:", error);
      Alert.alert(t("common.error"), t("bookingRequest.loadSlotsError"));
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

  const handleStartTimeConfirm = () => {
    // Always base start time on current time
    const now = new Date();

    // Check if the selected date is today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateOnly = new Date(selectedDate);
    selectedDateOnly.setHours(0, 0, 0, 0);

    const isToday = selectedDateOnly.getTime() === today.getTime();

    // If today, ensure "now" is not in the past (it never is) – for future dates we still use current time of day
    if (!isToday) {
      // If booking for a future date, we still take the current clock time as start time
      // No extra validation needed here
    }

    // Format and save start time from current time
    const startHours = now.getHours().toString().padStart(2, "0");
    const startMinutes = now.getMinutes().toString().padStart(2, "0");
    const startTimeString = `${startHours}:${startMinutes}`;
    setStartTime(startTimeString);

    // Automatically set end time to 1 hour after start time
    const endDateTime = new Date(now);
    endDateTime.setHours(endDateTime.getHours() + 1);
    const endHours = endDateTime.getHours().toString().padStart(2, "0");
    const endMinutes = endDateTime.getMinutes().toString().padStart(2, "0");
    setEndTime(`${endHours}:${endMinutes}`);

    setShowStartTimePicker(false);
  };

  const resetForm = () => {
    setBookingName("");
    setSelectedDate(new Date());
    setStartTime("");
    setEndTime("");
  };

  const validateForm = () => {
    if (!bookingName.trim()) {
      Alert.alert(t("common.error"), t("bookingRequest.bookingNameRequired"));
      return false;
    }
    if (!startTime) {
      Alert.alert(t("common.error"), t("bookingRequest.startTimeRequired"));
      return false;
    }
    if (!endTime) {
      Alert.alert(t("common.error"), t("bookingRequest.endTimeRequired"));
      return false;
    }

    // Validate time range
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const diffMinutes = endMinutes - startMinutes;

    if (diffMinutes < 60) {
      Alert.alert(t("common.error"), t("bookingRequest.endTimeMinimum"));
      return false;
    }

    return true;
  };

  const handleCreateRequest = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        customerPurchasedId: customerPurchasedId,
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

      Alert.alert(t("common.success"), t("bookingRequest.createSuccess"), [
        {
          text: t("common.ok"),
          onPress: () => {
            setShowCreateModal(false);
            resetForm();
            loadAllRequestsForPT();
          },
        },
      ]);
    } catch (error) {
      console.error("Error creating booking request:", error);
      Alert.alert(
        t("common.error"),
        error.response?.data?.message || t("bookingRequest.createError")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveRequest = async (request) => {
    Alert.alert(
      t("bookingRequest.approveConfirmTitle"),
      `${t("bookingRequest.approveConfirmMessage")} "${request.bookingName}"?`,
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("bookingRequest.approve"),
          style: "default",
          onPress: async () => {
            try {
              if (
                request.requestType === "CustomerCreate" ||
                request.requestType === "PTCreate"
              ) {
                await accountService.acceptBookingRequest({
                  bookingRequestId: request.id,
                });
                console.log("Approving request:", request);
                Alert.alert(
                  t("common.success"),
                  t("bookingRequest.approveSuccess")
                );
              } else if (
                request.requestType === "CustomerUpdate" ||
                request.requestType === "PtUpdate"
              ) {
                await accountService.acceptEditBooking({
                  bookingRequestId: request.id,
                });
                console.log("Approving request Edit:", request);
                Alert.alert(
                  t("common.success"),
                  t("bookingRequest.approveSuccess")
                );
              }

              loadAllRequestsForPT();
            } catch (error) {
              Alert.alert(
                t("common.error"),
                error.response.data.message || t("bookingRequest.approveError")
              );
            }
          },
        },
      ]
    );
  };

  const handleRejectRequest = async (request) => {
    Alert.alert(
      t("bookingRequest.rejectConfirmTitle"),
      `${t("bookingRequest.rejectConfirmMessage")} "${request.bookingName}"?`,
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("bookingRequest.reject"),
          style: "destructive",
          onPress: async () => {
            try {
              // TODO: Implement reject API call
              await accountService.rejectBookingRequest({
                bookingRequestId: request.id,
              });
              console.log("Rejecting request:", request);
              Alert.alert(
                t("common.success"),
                t("bookingRequest.rejectSuccess")
              );
              loadAllRequestsForPT();
            } catch (error) {
              Alert.alert(t("common.error"), t("bookingRequest.rejectError"));
            }
          },
        },
      ]
    );
  };

  const getFilteredRequests = () => {
    let filteredList = [];

    // Display all requests or filter by status
    if (filterStatus === "all") {
      filteredList = requests;
    } else {
      filteredList = requests.filter(
        (req) => req.requestStatus === filterStatus
      );
    }

    // Sort by date and time (latest first)
    return filteredList.sort((a, b) => {
      const dateTimeA = new Date(`${a.bookingDate}T${a.startTime}`);
      const dateTimeB = new Date(`${b.bookingDate}T${b.startTime}`);
      return dateTimeB - dateTimeA; // Descending order (latest first)
    });
  };

  const getStatusCount = (status) => {
    // Count all requests
    if (status === "all") return requests.length;
    return requests.filter((req) => req.requestStatus === status).length;
  };

  const renderRequestCard = (request, index) => (
    <BookingRequestCard
      key={index}
      request={request}
      userRole={userRole}
      onApprove={handleApproveRequest}
      onReject={handleRejectRequest}
      formatDate={formatDate}
      formatTime={formatTime}
    />
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
                {t("bookingRequest.bookingName")} *
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder={t("bookingRequest.bookingNamePlaceholder")}
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
                {t("bookingRequest.date")} *
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
                {t("bookingRequest.startTime")} *
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
                  {startTime || t("bookingRequest.selectStartTime")}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {/* End Time (auto 1 hour after start time) */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <Ionicons name="time-outline" size={16} color={colors.red} />{" "}
                {t("bookingRequest.endTime")} *
              </Text>
              <View style={styles.datePickerButton}>
                <Text
                  style={[
                    styles.datePickerText,
                    !endTime && styles.placeholderText,
                  ]}
                >
                  {endTime || t("bookingRequest.selectEndTime")}
                </Text>
              </View>
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
                    <Text style={styles.submitButtonText}>
                      {t("bookingRequest.createRequest")}
                    </Text>
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
      />
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.red} />
        <Text style={styles.loadingText}>
          {t("bookingRequest.loadingRequests")}
        </Text>
      </View>
    );
  }

  const filteredRequests = getFilteredRequests();

  return (
    <SafeAreaView style={styles.safeArea}>
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
                {t("bookingRequest.filters.all")} ({getStatusCount("all")})
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
                {t("bookingRequest.filters.pending")} (
                {getStatusCount("Pending")})
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
                {t("bookingRequest.filters.approved")} (
                {getStatusCount("Approved")})
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
                {t("bookingRequest.filters.rejected")} (
                {getStatusCount("Rejected")})
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
                {t("bookingRequest.noRequests")}
              </Text>
              <Text style={styles.emptySubtext}>
                {filterStatus === "Pending"
                  ? t("bookingRequest.noPendingRequests")
                  : filterStatus === "Approved"
                  ? t("bookingRequest.noApprovedRequests")
                  : filterStatus === "Rejected"
                  ? t("bookingRequest.noRejectedRequests")
                  : t("bookingRequest.noRequestsYet")}
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
  originalBookingSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
  },
  originalBookingTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  infoLabelSmall: {
    fontSize: 13,
    color: "#999",
    fontWeight: "500",
  },
  infoValueSmall: {
    fontSize: 13,
    color: "#666",
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
