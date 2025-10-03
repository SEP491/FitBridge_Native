import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from "react-native";
import React, { useState, useEffect } from "react";
import ptService from "../../services/ptService";
import colors from "../../constants/color";
import { useTranslation } from "../../hooks/useTranslation";
import { fetchUserFromStorage, formatDateForAPI } from "../../lib";
import Ionicons from "@expo/vector-icons/Ionicons";
import WeekCalendar from "../../components/WeekCalendar/WeekCalendar";

const { width, height } = Dimensions.get("window");

export default function SchedulePTScreen() {
  const { t } = useTranslation();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [registering, setRegistering] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const loadSlotOfGym = async (date = selectedDate) => {
    try {
      setLoading(true);
      const user = await fetchUserFromStorage();
      const selectDate = formatDateForAPI(date);
      const response = await ptService.getAllSlotsOfGym({
        ptId: user.id,
        registerDate: selectDate,
      });
      console.log("Slots data:", response.data?.items || []);
      setSlots(response.data?.items || []);
    } catch (error) {
      console.error("Error loading gym slots:", error);
      Alert.alert(t("schedule.error"), t("schedule.loadSlotsError"));
    } finally {
      setLoading(false);
    }
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setLoading(true);
    loadSlotOfGym(date);
  };

  // Handle minimum slot check response
  const handleMinimumSlotCheck = (response, dateRange, error) => {
    if (error) {
      console.error("Minimum slot check failed:", error);
      return;
    }

    if (response) {
      console.log("Minimum slot check result:", response);
      console.log("Date range checked:", dateRange);

      // You can handle the response here, for example:
      // - Show alerts or notifications based on the response
      // - Update UI to show warnings if minimum slots are not met
      // - Store the result in state for later use

      // Example: If the API returns a flag indicating insufficient slots
      if (!response.isAccepted) {
        Alert.alert(
          "Canh Bao",
          `chưa đạt số slot tối thiểu, Bạn cần đăng ký tối thiểu ${response.minimumSlot} slot`
        );
      }
    }
  };

  const handleToggleSlotActivation = async (slot) => {
    const action = slot.isActivated ? "deactivate" : "activate";
    const actionText = slot.isActivated
      ? t("schedule.deactivate")
      : t("schedule.activate");
    Alert.alert(
      t("schedule.confirmAction"),
      t("schedule.toggleSlotConfirm", {
        slotName: slot.name,
        action: actionText,
      }),
      [
        {
          text: t("schedule.cancel"),
          style: "cancel",
        },
        {
          text: actionText,
          onPress: async () => {
            setRegistering(slot.slotId);
            try {
              if (slot.isActivated) {
                await ptService.deactivateSlot({
                  ptGymSlotId: slot?.ptSlots?.ptGymSlotId,
                });
              } else {
                await ptService.registerSlot({
                  slotId: slot.slotId,
                  registerDate: formatDateForAPI(selectedDate),
                });
              }
              Alert.alert(
                t("schedule.success"),
                t("schedule.toggleSlotSuccess", { action: actionText })
              );
              loadSlotOfGym(selectedDate); // Refresh the slots
            } catch (error) {
              console.error(
                "Error toggling slot activation:",
                error.response.data
              );
              Alert.alert(t("schedule.error"), t("schedule.toggleSlotError"));
            } finally {
              setRegistering(null);
            }
          },
        },
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSlotOfGym(selectedDate);
    setRefreshing(false);
  };

  useEffect(() => {
    const loadData = async () => {
      const today = new Date();
      setSelectedDate(today);
      loadSlotOfGym(today);
    };
    loadData();
  }, []);

  const formatTime = (timeString) => {
    if (!timeString) return "00:00";

    const [hours, minutes] = timeString.split(":").map(Number);
    const period = hours >= 12 ? t("schedule.pm") : t("schedule.am");
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "0 minutes";

    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
      return `${diffMins} ${t("schedule.minutes")}`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const minutes = diffMins % 60;
      if (minutes === 0) {
        return `${hours} ${t(
          hours === 1 ? "schedule.hour" : "schedule.hours"
        )}`;
      } else {
        return `${hours}h ${minutes}m`;
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.red} />

      <View style={styles.container}>
        {/* Week Calendar Component */}
        <WeekCalendar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          initialDate={selectedDate}
          checkMinimumSlot={true}
          onMinimumSlotCheck={handleMinimumSlotCheck}
        />

        {/* Slots List */}
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.red]}
            />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.red} />
              <Text style={styles.loadingText}>
                {t("schedule.loadingSchedule")}
              </Text>
            </View>
          ) : slots.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                {t("schedule.noSlotsAvailable")}
              </Text>
              <Text style={styles.emptySubText}>
                {t("schedule.onDate", {
                  date: selectedDate.toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                  }),
                })}
              </Text>
            </View>
          ) : (
            slots
              .sort((a, b) => {
                const timeA = new Date(`1970-01-01T${a.startTime}`);
                const timeB = new Date(`1970-01-01T${b.startTime}`);
                return timeA - timeB;
              })
              .map((slot) => (
                <View key={slot.slotId} style={styles.slotCard}>
                  <View style={styles.slotHeader}>
                    <Text style={styles.slotName}>{slot.name}</Text>
                    <View style={styles.statusContainer}>
                      <View
                        style={[
                          styles.statusBadge,
                          slot.isActivated
                            ? styles.activeBadge
                            : styles.inactiveBadge,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            slot.isActivated
                              ? styles.activeStatusText
                              : styles.inactiveStatusText,
                          ]}
                        >
                          {slot.isActivated
                            ? t("schedule.active")
                            : t("schedule.inactive")}
                        </Text>
                      </View>

                      {/* Booking Badge - Only show when slot is activated */}
                      {slot.isActivated && slot.ptSlots && (
                        <View
                          style={[
                            styles.bookingBadge,
                            slot.ptSlots.isBooking
                              ? styles.bookedBadge
                              : styles.availableBadge,
                          ]}
                        >
                          <Text
                            style={[
                              styles.bookingText,
                              slot.ptSlots.isBooking
                                ? styles.bookedText
                                : styles.availableText,
                            ]}
                          >
                            {slot.ptSlots.isBooking
                              ? t("schedule.booked")
                              : t("schedule.available")}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.timeContainer}>
                    <View style={styles.timeItem}>
                      <Text style={styles.timeLabel}>
                        {t("schedule.startTime")}
                      </Text>
                      <Text style={styles.timeValue}>
                        {formatTime(slot.startTime)}
                      </Text>
                    </View>
                    <View style={styles.timeSeparator} />
                    <View style={styles.timeItem}>
                      <Text style={styles.timeLabel}>
                        {t("schedule.endTime")}
                      </Text>
                      <Text style={styles.timeValue}>
                        {formatTime(slot.endTime)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.durationContainer}>
                    <Text style={styles.durationLabel}>
                      {t("schedule.duration")}
                    </Text>
                    <Text style={styles.durationValue}>
                      {calculateDuration(slot.startTime, slot.endTime)}
                    </Text>
                  </View>

                  {/* Show customer name when slot is booked */}
                  {slot.isActivated &&
                    slot.ptSlots &&
                    slot.ptSlots.isBooking &&
                    slot.ptSlots.customerName && (
                      <View style={styles.customerContainer}>
                        <Text style={styles.customerLabel}>
                          {t("schedule.customer")}:
                        </Text>
                        <Text style={styles.customerName}>
                          {slot.ptSlots.customerName}
                        </Text>
                      </View>
                    )}

                  {(() => {
                    const now = new Date();
                    const slotDateTime = new Date(selectedDate);
                    const [hours, minutes] = slot.startTime
                      .split(":")
                      .map(Number);
                    slotDateTime.setHours(hours, minutes, 0, 0);
                    const isSlotInPast = slotDateTime < now;

                    // Hide button if slot is in the past (regardless of activation status)
                    if (isSlotInPast) {
                      return null;
                    }

                    return (
                      <TouchableOpacity
                        style={[
                          styles.toggleButton,
                          registering === slot.slotId &&
                            styles.toggleButtonDisabled,
                          slot.isActivated
                            ? styles.deactivateButton
                            : styles.activateButton,
                        ]}
                        onPress={() => handleToggleSlotActivation(slot)}
                        disabled={registering === slot.slotId}
                      >
                        {registering === slot.slotId ? (
                          <ActivityIndicator
                            size="small"
                            color={colors.white}
                          />
                        ) : (
                          <Text style={styles.toggleButtonText}>
                            {slot.isActivated
                              ? t("schedule.deactivateSlot")
                              : t("schedule.activateSlot")}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })()}
                </View>
              ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: "#6c757d",
    marginTop: 16,
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
  slotCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  slotHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  slotName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212529",
    flex: 1,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: "#d4edda",
  },
  inactiveBadge: {
    backgroundColor: "#f8d7da",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  activeStatusText: {
    color: "#155724",
  },
  inactiveStatusText: {
    color: "#721c24",
  },
  // Booking Badge Styles
  bookingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  bookedBadge: {
    backgroundColor: "#fff3cd",
    borderColor: "#ffc107",
  },
  availableBadge: {
    backgroundColor: "#d1ecf1",
    borderColor: "#17a2b8",
  },
  bookingText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  bookedText: {
    color: "#856404",
  },
  availableText: {
    color: "#0c5460",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  timeItem: {
    flex: 1,
    alignItems: "center",
  },
  timeLabel: {
    fontSize: 12,
    color: "#6c757d",
    marginBottom: 4,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  timeValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#212529",
  },
  timeSeparator: {
    width: 1,
    height: 30,
    backgroundColor: "#e9ecef",
    marginHorizontal: 16,
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  durationLabel: {
    fontSize: 14,
    color: "#6c757d",
    marginRight: 8,
  },
  durationValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212529",
  },
  // Customer Info Styles
  customerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107",
  },
  customerLabel: {
    fontSize: 14,
    color: "#6c757d",
    marginRight: 8,
    fontWeight: "600",
  },
  customerName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#212529",
    flex: 1,
  },
  toggleButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  activateButton: {
    backgroundColor: colors.red,
  },
  deactivateButton: {
    backgroundColor: "#6c757d",
  },
  toggleButtonDisabled: {
    backgroundColor: "#ccc",
  },
  toggleButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
