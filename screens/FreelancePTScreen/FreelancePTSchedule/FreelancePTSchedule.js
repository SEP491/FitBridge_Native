import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "../../../hooks/useTranslation";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import colors from "../../../constants/color";
import Ionicons from "@expo/vector-icons/Ionicons";
import SessionBookingCard from "../../../components/SessionBookingCard/SessionBookingCard_New";
import WeekCalendar from "../../../components/WeekCalendar/WeekCalendar";
import accountService from "../../../services/accountService";
import { fetchUserFromStorage, formatDateForAPI } from "../../../lib";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const { width, height } = Dimensions.get("window");

export default function FreelancePTSchedule() {
  const { t, currentLanguage } = useTranslation();
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editFormData, setEditFormData] = useState({
    bookingName: "",
    bookingDate: new Date(),
    startTime: "",
    endTime: "",
    note: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [userRole, setUserRole] = useState(null);
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

  const loadBookingOfFreelancePT = async (date = selectedDate) => {
    try {
      setLoading(true);

      const formattedDate = formatDateForAPI(date);
      console.log("Loading bookings for date:", formattedDate);

      const response = await accountService.getBookingForPT({
        date: formattedDate,
      });
      console.log("Bookings data:", response.data);
      setBookings(response.data.items);
    } catch (error) {
      console.error("Error loading bookings:", error.response.data);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setLoading(true);
    loadBookingOfFreelancePT(date);
  };

useFocusEffect(
  useCallback(() => {
    setLoading(true);
    loadBookingOfFreelancePT();
  }, [])
);

  // Debug: Log picker state changes
  useEffect(() => {
    console.log("showDatePicker:", showDatePicker);
    console.log("showStartTimePicker:", showStartTimePicker);
    console.log("showEndTimePicker:", showEndTimePicker);
  }, [showDatePicker, showStartTimePicker, showEndTimePicker]);

  // Helper function to check if session is on selected date
  const isSessionOnDate = (session, targetDate) => {
    // Validate inputs
    if (!session || !session.bookingDate || !targetDate) {
      return false;
    }

    try {
      // Parse the booking date (expected format: "YYYY-MM-DD")
      const bookingDate = new Date(session.bookingDate);

      // Compare dates (ignore time)
      return bookingDate.toDateString() === targetDate.toDateString();
    } catch (error) {
      console.error("Error comparing dates:", error);
      return false;
    }
  };

  // Helper functions for session display
  const formatTime = (timeString) => {
    // Validate input parameter
    if (!timeString || typeof timeString !== "string") {
      return "00:00";
    }

    try {
      // Handle time string (e.g., "10:00:00" or "10:00")
      const timeParts = timeString.split(":");
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);

      const period = hours >= 12 ? t("schedule.pm") : t("schedule.am");
      const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      return `${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`;
    } catch (error) {
      console.error("Error formatting time:", error);
      return "00:00";
    }
  };

  const calculateDuration = (startTime, endTime) => {
    // Validate input parameters
    if (
      !startTime ||
      !endTime ||
      typeof startTime !== "string" ||
      typeof endTime !== "string"
    ) {
      console.warn("Invalid time parameters:", { startTime, endTime });
      return "0 minutes";
    }

    try {
      // Handle time strings from API (e.g., "10:00:00", "11:00:00")
      const start = new Date(`1970-01-01T${startTime}`);
      const end = new Date(`1970-01-01T${endTime}`);

      // Check if dates are valid
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.warn("Invalid date objects created from:", {
          startTime,
          endTime,
        });
        return "0 minutes";
      }

      const diffMs = end.getTime() - start.getTime();
      const diffMins = Math.round(diffMs / 60000);

      if (diffMins < 60) {
        return `${diffMins} ${t("calendar.minutes")}`;
      } else {
        const hours = Math.floor(diffMins / 60);
        const minutes = diffMins % 60;
        if (minutes === 0) {
          return `${hours} ${t(
            hours === 1 ? "calendar.hour" : "calendar.hours"
          )}`;
        } else {
          return `${hours}h ${minutes}m`;
        }
      }
    } catch (error) {
      console.error("Error calculating duration:", error, {
        startTime,
        endTime,
      });
      return "0 minutes";
    }
  };

  const handleCancelBooking = async (bookingId) => {
    Alert.alert(
      t("calendar.cancelSession"),
      t("calendar.confirmCancelSession"),
      [
        { text: t("calendar.no"), style: "cancel" },
        {
          text: t("calendar.yes"),
          onPress: async () => {
            try {
              const response = await accountService.cancelBooking({
                bookingId,
              });
              console.log("Cancel booking response:", response.data);
              Alert.alert(
                t("calendar.success"),
                t("calendar.cancellationSuccess")
              );
              loadBookingOfFreelancePT(selectedDate);
            } catch (error) {
              console.error("Error canceling booking:", error.response.data);
              Alert.alert(t("calendar.error"), t("calendar.cancellationError"));
            }
          },
        },
      ]
    );
  };

  const handleEditBooking = (bookingId) => {
    // Find the booking to edit
    const booking = bookings.find((b) => b.bookingId === bookingId);
    if (!booking) {
      Alert.alert(t("common.error"), t("bookingRequest.bookingNotFound"));
      return;
    }

    // Parse the booking date and times
    const bookingDate = new Date(booking.bookingDate);

    // Format times to HH:MM (remove seconds if present)
    const formatTimeDisplay = (timeString) => {
      if (!timeString) return "";
      const parts = timeString.split(":");
      return `${parts[0]}:${parts[1]}`;
    };

    setEditingBooking(booking);
    setEditFormData({
      bookingName: booking.bookingName || "",
      bookingDate: bookingDate,
      startTime: formatTimeDisplay(booking.startTime),
      endTime: formatTimeDisplay(booking.endTime),
      note: booking.note || "",
    });
    setShowEditModal(true);
  };

  const formatTimeForAPI = (timeString) => {
    // If already in HH:MM:SS format, return as is
    if (timeString && timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return timeString;
    }
    // If in HH:MM format, add seconds
    if (timeString && timeString.match(/^\d{2}:\d{2}$/)) {
      return `${timeString}:00`;
    }
    // Otherwise format from Date object
    const date = new Date(timeString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = "00";
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleSubmitEditRequest = async () => {
    if (!editFormData.bookingName.trim()) {
      Alert.alert(t("common.error"), t("bookingRequest.bookingNameRequired"));
      return;
    }

    if (!editFormData.startTime || !editFormData.endTime) {
      Alert.alert(t("common.error"), t("bookingRequest.selectStartEndTime"));
      return;
    }

    try {
      const payload = {
        targetBookingId: editingBooking.bookingId,
        bookingDate: formatDateForAPI(editFormData.bookingDate),
        startTime: formatTimeForAPI(editFormData.startTime),
        endTime: formatTimeForAPI(editFormData.endTime),
        bookingName: editFormData.bookingName,
        note: editFormData.note || "",
      };

      console.log("Edit request payload:", payload);

      const response = await accountService.requestEditBooking(payload);
      console.log("Edit request response:", response.data);

      Alert.alert(t("common.success"), t("bookingRequest.editRequestSuccess"));
      setShowEditModal(false);
      setEditingBooking(null);
      loadBookingOfFreelancePT(selectedDate);
    } catch (error) {
      console.error("Error requesting edit:", error);
      Alert.alert(t("common.error"), t("bookingRequest.editRequestError"));
    }
  };

  const handleDateConfirm = (date) => {
    console.log("Date confirmed:", date);
    setEditFormData({ ...editFormData, bookingDate: date });
    setShowDatePicker(false);
  };

  const handleStartTimeConfirm = (time) => {
    console.log("Start time confirmed:", time);

    // Check if the selected date is today
    const selectedDateOnly = new Date(editFormData.bookingDate);
    selectedDateOnly.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isToday = selectedDateOnly.getTime() === today.getTime();

    // If today, check if selected time is in the past
    if (isToday) {
      const now = new Date();
      const selectedDateTime = new Date();
      selectedDateTime.setHours(time.getHours(), time.getMinutes(), 0, 0);

      if (selectedDateTime < now) {
        Alert.alert(t("common.error"), t("bookingRequest.pastTimeError"));
        return;
      }
    }
    const hours = time.getHours().toString().padStart(2, "0");
    const minutes = time.getMinutes().toString().padStart(2, "0");
    const timeString = `${hours}:${minutes}`;
    setEditFormData({ ...editFormData, startTime: timeString });
    setShowStartTimePicker(false);
  };

  const handleEndTimeConfirm = (time) => {
    console.log("End time confirmed:", time);

    if (!editFormData.startTime) {
      Alert.alert(t("common.error"), t("bookingRequest.selectStartTimeFirst"));
      return;
    }

    // Parse start time
    const [startHour, startMin] = editFormData.startTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;

    // Parse end time
    const endHour = time.getHours();
    const endMin = time.getMinutes();
    const endMinutes = endHour * 60 + endMin;

    // Check if end time is at least 1 hour after start time
    const diffMinutes = endMinutes - startMinutes;
    if (diffMinutes < 60) {
      Alert.alert(t("common.error"), t("bookingRequest.endTimeMinimum"));
      return;
    }

    const hours = endHour.toString().padStart(2, "0");
    const minutes = endMin.toString().padStart(2, "0");
    const timeString = `${hours}:${minutes}`;
    setEditFormData({ ...editFormData, endTime: timeString });
    setShowEndTimePicker(false);
  };

  const resetEditForm = () => {
    setEditFormData({
      bookingName: "",
      bookingDate: new Date(),
      startTime: "",
      endTime: "",
      note: "",
    });
    setEditingBooking(null);
  };

  return (
    <>
      <View style={styles.container}>
        {/* Calendar */}
        <View style={styles.calendarContainer}>
          {/* Week View Container */}
          <View style={styles.weekViewContainer}>
            {/* Week Calendar Component */}
            <WeekCalendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              initialDate={selectedDate}
            />

            {/* Sessions List */}
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.red} />
                  <Text style={styles.loadingText}>
                    {t("calendar.loadingSessions")}
                  </Text>
                </View>
              ) : (
                <>
                  {bookings
                    .filter((session) => isSessionOnDate(session, selectedDate))
                    .map((session, index) => (
                      <SessionBookingCard
                        key={session.bookingId}
                        booking={session}
                        formatTime={formatTime}
                        calculateDuration={calculateDuration}
                        buttonText={t("calendar.cancelSession")}
                        editButtonText={t("calendar.requestEdit")}
                        showEditButton={
                          !session.ptGymSlotId &&
                          session.sessionStatus !== "WaitingForEdit"
                        }
                        editButtonAction={() => {
                          handleEditBooking(session.bookingId);
                        }}
                        viewDetailAction={() => {
                          // Navigate to BookingDetailScreen in Schedule stack
                          navigation.navigate("BookingDetailScreen", {
                            Booking: session,
                          });
                        }}
                        ptName={session.customerName}
                        ptAvatar={session.customerAvatarUrl}
                        currentLanguage={currentLanguage}
                        t={t}
                        buttonAction={() => {
                          handleCancelBooking(session.bookingId);
                        }}
                      />
                    ))}

                  {bookings.filter((session) =>
                    isSessionOnDate(session, selectedDate)
                  ).length === 0 && (
                    <View style={styles.emptyContainer}>
                      <Ionicons
                        name="calendar-outline"
                        size={64}
                        color="#ccc"
                      />
                      <Text style={styles.emptyText}>
                        {t("calendar.noSessionsScheduled")}
                      </Text>
                      <Text style={styles.emptySubText}>
                        {t("calendar.noSessionsFor")}{" "}
                        {selectedDate.toLocaleDateString(
                          currentLanguage === "vi" ? "vi-VN" : "en-US",
                          {
                            day: "2-digit",
                            month: "2-digit",
                          }
                        )}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>

        {/* Edit Booking Modal */}
        <Modal
          visible={showEditModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setShowEditModal(false);
            resetEditForm();
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {t("calendar.requestEditBooking")}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowEditModal(false);
                    resetEditForm();
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
                    <Ionicons
                      name="create-outline"
                      size={16}
                      color={colors.red}
                    />{" "}
                    {t("bookingRequest.bookingName")} *
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    value={editFormData.bookingName}
                    onChangeText={(text) =>
                      setEditFormData({ ...editFormData, bookingName: text })
                    }
                    placeholder={t("bookingRequest.bookingNamePlaceholder")}
                    placeholderTextColor="#999"
                  />
                </View>

                {/* Booking Date */}
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
                    onPress={() => {
                      console.log("Date picker button pressed");
                      setShowDatePicker(true);
                    }}
                  >
                    <Text style={styles.datePickerText}>
                      {editFormData.bookingDate.toLocaleDateString("en-GB")}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* Start Time */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={colors.red}
                    />{" "}
                    {t("bookingRequest.startTime")} *
                  </Text>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => {
                      console.log("Start time picker button pressed");
                      setShowStartTimePicker(true);
                    }}
                  >
                    <Text
                      style={[
                        styles.datePickerText,
                        !editFormData.startTime && styles.placeholderText,
                      ]}
                    >
                      {editFormData.startTime ||
                        t("bookingRequest.selectStartTime")}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* End Time */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={colors.red}
                    />{" "}
                    {t("bookingRequest.endTime")} *
                  </Text>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => {
                      console.log("End time picker button pressed");
                      setShowEndTimePicker(true);
                    }}
                  >
                    <Text
                      style={[
                        styles.datePickerText,
                        !editFormData.endTime && styles.placeholderText,
                      ]}
                    >
                      {editFormData.endTime ||
                        t("bookingRequest.selectEndTime")}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* Note */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    <Ionicons
                      name="document-text-outline"
                      size={16}
                      color={colors.red}
                    />{" "}
                    {t("bookingRequest.note")}
                  </Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={editFormData.note}
                    onChangeText={(text) =>
                      setEditFormData({ ...editFormData, note: text })
                    }
                    placeholder={t("bookingRequest.notePlaceholder")}
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmitEditRequest}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>
                    {t("calendar.sendEditRequest")}
                  </Text>
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
            date={editFormData.bookingDate}
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

          {/* End Time Picker Modal */}
          <DateTimePickerModal
            isVisible={showEndTimePicker}
            mode="time"
            onConfirm={handleEndTimeConfirm}
            onCancel={() => setShowEndTimePicker(false)}
            is24Hour={true}
          />
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },

  calendarContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  // Week View Styles - New Design
  weekViewContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  // Sessions List Header

  // New Session Card Styles
  scrollView: {
    flex: 1,
    backgroundColor: "#f8f9fa",
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
    color: "#6c757d",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#adb5bd",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: "#6c757d",
    marginTop: 16,
    textAlign: "center",
  },
  // Modal Styles
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
  textArea: {
    height: 100,
    paddingTop: 12,
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
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.red,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 8,
    gap: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
