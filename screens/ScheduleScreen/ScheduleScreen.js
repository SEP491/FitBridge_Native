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
  Modal,
  FlatList,
  Dimensions,
} from "react-native";
import React, { useState, useEffect } from "react";
import colors from "../../constants/color";
import { useTranslation } from "../../hooks/useTranslation";
import { fetchUserFromStorage, formatDateForAPI } from "../../lib";
import Ionicons from "@expo/vector-icons/Ionicons";
import accountService from "../../services/accountService";

const { width, height } = Dimensions.get("window");

export default function ScheduleScreen({ route }) {
  const { t } = useTranslation();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [registering, setRegistering] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Dropdown states
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showWeekDropdown, setShowWeekDropdown] = useState(false);

  // Helper function to get current week number
  const getCurrentWeekInMonth = (date = new Date()) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const currentDate = date.getDate();

    const firstDay = new Date(year, month, 1);
    const firstMonday = new Date(firstDay);
    const firstDayOfWeek = firstDay.getDay();
    const daysToSubtract = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    firstMonday.setDate(firstDay.getDate() - daysToSubtract);

    // Calculate which week the current date falls into
    let weekNum = 1;
    let currentWeekStart = new Date(firstMonday);

    while (
      currentWeekStart.getMonth() <= month &&
      currentWeekStart.getFullYear() <= year
    ) {
      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setDate(currentWeekStart.getDate() + 6);

      // Check if current date falls in this week
      if (
        currentDate >= currentWeekStart.getDate() &&
        currentDate <= currentWeekEnd.getDate() &&
        currentWeekStart.getMonth() <= month &&
        currentWeekEnd.getMonth() >= month
      ) {
        return weekNum;
      }

      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      weekNum++;

      if (weekNum > 6) break; // Safety check
    }

    return 1; // Default to week 1 if calculation fails
  };

  // Initialize with current week number
  const [selectedWeekInMonth, setSelectedWeekInMonth] = useState(() =>
    getCurrentWeekInMonth()
  );

  // Get day name with translation
  const getDayName = (date) => {
    const dayKeys = [
      "calendar.sunday",
      "calendar.monday",
      "calendar.tuesday",
      "calendar.wednesday",
      "calendar.thursday",
      "calendar.friday",
      "calendar.saturday",
    ];
    return t(dayKeys[date.getDay()]);
  };

  // Get current month and year for header with translation
  const getCurrentMonth = () => {
    const monthKeys = [
      "calendar.january",
      "calendar.february",
      "calendar.march",
      "calendar.april",
      "calendar.may",
      "calendar.june",
      "calendar.july",
      "calendar.august",
      "calendar.september",
      "calendar.october",
      "calendar.november",
      "calendar.december",
    ];
    return `${t(monthKeys[selectedMonth])} ${t(
      "calendar.year"
    )} ${selectedYear}`;
  };

  // Get total weeks in selected month
  const getWeeksInMonth = (month, year) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Get the Monday of the week containing the first day
    const firstMonday = new Date(firstDay);
    const firstDayOfWeek = firstDay.getDay();
    const daysToSubtract = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    firstMonday.setDate(firstDay.getDate() - daysToSubtract);

    // Count weeks that contain days from the selected month
    let weekCount = 0;
    let currentWeekStart = new Date(firstMonday);

    while (
      currentWeekStart.getMonth() <= month &&
      currentWeekStart.getFullYear() <= year
    ) {
      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setDate(currentWeekStart.getDate() + 6);

      // Check if this week contains any days from the selected month
      if (
        (currentWeekStart.getMonth() === month &&
          currentWeekStart.getFullYear() === year) ||
        (currentWeekEnd.getMonth() === month &&
          currentWeekEnd.getFullYear() === year) ||
        (currentWeekStart.getMonth() < month &&
          currentWeekEnd.getMonth() > month)
      ) {
        weekCount++;
      }

      currentWeekStart.setDate(currentWeekStart.getDate() + 7);

      if (weekCount > 6) break; // Safety check
    }

    return Math.max(1, weekCount);
  };

  // Get the current week days based on selected month and week
  const getCurrentWeekDaysForMonth = () => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const firstMonday = new Date(firstDay);
    const firstDayOfWeek = firstDay.getDay();
    const daysToSubtract = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    firstMonday.setDate(firstDay.getDate() - daysToSubtract);

    // Get the start of the selected week
    const weekStart = new Date(firstMonday);
    weekStart.setDate(firstMonday.getDate() + (selectedWeekInMonth - 1) * 7);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const loadPTSlotOfUser = async (date = selectedDate) => {
    try {
      const registerDate = formatDateForAPI(date);
      const response = await accountService.getPTSlotforUser({
        registerDate,
      });
      setSlots(response.data?.items || []);
      console.log("Slots data:", response.data?.items || []);
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
    loadPTSlotOfUser(date);
  };

  // Generate months data for dropdown - only current and future months
  const generateMonthsData = () => {
    const monthKeys = [
      "calendar.january",
      "calendar.february",
      "calendar.march",
      "calendar.april",
      "calendar.may",
      "calendar.june",
      "calendar.july",
      "calendar.august",
      "calendar.september",
      "calendar.october",
      "calendar.november",
      "calendar.december",
    ];

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const data = [];

    // Generate data for current year (from current month onwards) and next year
    for (let year = currentYear; year <= currentYear + 1; year++) {
      monthKeys.forEach((monthKey, index) => {
        // For current year, only include current month and future months
        // For next year, include all months
        if (year === currentYear && index < currentMonth) {
          return; // Skip past months in current year
        }

        data.push({
          id: `${year}-${index}`,
          month: index,
          year: year,
          display: `${t(monthKey)} ${t("calendar.year")} ${year}`,
        });
      });
    }
    return data;
  };

  // Generate weeks data for selected month - only current and future weeks
  const generateWeeksData = () => {
    const totalWeeks = getWeeksInMonth(selectedMonth, selectedYear);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const data = [];

    for (let week = 1; week <= totalWeeks; week++) {
      // If this is the current month and year, check if the week is in the past
      if (selectedYear === currentYear && selectedMonth === currentMonth) {
        // Get the days for this week
        const firstDay = new Date(selectedYear, selectedMonth, 1);
        const firstMonday = new Date(firstDay);
        const firstDayOfWeek = firstDay.getDay();
        const daysToSubtract = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
        firstMonday.setDate(firstDay.getDate() - daysToSubtract);

        // Get the start of the selected week
        const weekStart = new Date(firstMonday);
        weekStart.setDate(firstMonday.getDate() + (week - 1) * 7);

        // Get the end of the week (Sunday)
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999); // End of Sunday

        // If the entire week is in the past, skip it
        if (weekEnd < currentDate) {
          continue;
        }
      }

      data.push({
        id: week,
        week: week,
        display: `${t("calendar.week")} ${week}`,
      });
    }
    return data;
  };

  // Handle month selection
  const handleMonthSelect = (monthData) => {
    setSelectedMonth(monthData.month);
    setSelectedYear(monthData.year);

    // If selecting current month, set to current week; otherwise set to week 1
    const currentDate = new Date();
    if (
      monthData.year === currentDate.getFullYear() &&
      monthData.month === currentDate.getMonth()
    ) {
      setSelectedWeekInMonth(getCurrentWeekInMonth());
    } else {
      setSelectedWeekInMonth(1);
    }

    setShowMonthDropdown(false);
  };

  // Handle week selection
  const handleWeekSelect = (weekData) => {
    setSelectedWeekInMonth(weekData.week);
    setShowWeekDropdown(false);
  };

  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is selected
  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
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
                  ptGymSlotId: slot.ptGymSlotId,
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
              loadPTSlotOfUser(selectedDate); // Refresh the slots
            } catch (error) {
              console.error("Error toggling slot activation:", error);
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
      setSelectedMonth(today.getMonth());
      setSelectedYear(today.getFullYear());
      setSelectedWeekInMonth(getCurrentWeekInMonth(today));
      loadPTSlotOfUser(today);
    };
    loadData();
  }, []);

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const minute = parseInt(minutes);
    const period = hour >= 12 ? t("schedule.pm") : t("schedule.am");
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  const calculateDuration = (startTime, endTime) => {
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours === 0) {
      return `${diffMinutes} ${t("schedule.minutes")}`;
    } else if (diffMinutes === 0) {
      return `${diffHours} ${
        diffHours === 1 ? t("schedule.hour") : t("schedule.hours")
      }`;
    } else {
      return `${diffHours} ${
        diffHours === 1 ? t("schedule.hour") : t("schedule.hours")
      } ${diffMinutes} ${t("schedule.minutes")}`;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.red} />

      <View style={styles.container}>
        {/* Combined Month and Week Selector */}
        <View style={styles.combinedSelectorContainer}>
          {/* Week Selector */}
          <TouchableOpacity
            style={styles.weekSelector}
            onPress={() => setShowWeekDropdown(true)}
          >
            <Text style={styles.weekText}>
              {t("calendar.week")} {selectedWeekInMonth}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          {/* Month Selector */}
          <TouchableOpacity
            style={styles.monthSelector}
            onPress={() => setShowMonthDropdown(true)}
          >
            <Text style={styles.monthText}>{getCurrentMonth()}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Full Width Date Picker - 7 days without scroll */}
        <View style={styles.fullWidthDateContainer}>
          {getCurrentWeekDaysForMonth().map((date, index) => {
            const isSelectedDate = isSelected(date);
            const isTodayDate = isToday(date);

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.fullWidthDateItem,
                  isSelectedDate && styles.selectedFullWidthDateItem,
                  isTodayDate &&
                    !isSelectedDate &&
                    styles.todayFullWidthDateItem,
                ]}
                onPress={() => handleDateSelect(date)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.fullWidthDayName,
                    isSelectedDate && styles.selectedFullWidthDayName,
                  ]}
                >
                  {getDayName(date)}
                </Text>
                <Text
                  style={[
                    styles.fullWidthDateNumber,
                    isSelectedDate && styles.selectedFullWidthDateNumber,
                  ]}
                >
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
            slots.map((slot) => (
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

                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    registering === slot.slotId && styles.toggleButtonDisabled,
                    slot.isActivated
                      ? styles.deactivateButton
                      : styles.activateButton,
                  ]}
                  onPress={() => handleToggleSlotActivation(slot)}
                  disabled={registering === slot.slotId}
                >
                  {registering === slot.slotId ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.toggleButtonText}>
                      {slot.isActivated
                        ? t("schedule.deactivateSlot")
                        : t("schedule.activateSlot")}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>

        {/* Month Dropdown Modal */}
        <Modal
          visible={showMonthDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMonthDropdown(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowMonthDropdown(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {t("calendar.selectMonth")}
                </Text>
                <TouchableOpacity onPress={() => setShowMonthDropdown(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={generateMonthsData()}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.dropdownItem,
                      item.month === selectedMonth &&
                        item.year === selectedYear &&
                        styles.selectedDropdownItem,
                    ]}
                    onPress={() => handleMonthSelect(item)}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        item.month === selectedMonth &&
                          item.year === selectedYear &&
                          styles.selectedDropdownItemText,
                      ]}
                    >
                      {item.display}
                    </Text>
                    {item.month === selectedMonth &&
                      item.year === selectedYear && (
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color={colors.red}
                        />
                      )}
                  </TouchableOpacity>
                )}
                style={styles.dropdownList}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Week Dropdown Modal */}
        <Modal
          visible={showWeekDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowWeekDropdown(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowWeekDropdown(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {t("calendar.selectWeek")}
                </Text>
                <TouchableOpacity onPress={() => setShowWeekDropdown(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={generateWeeksData()}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.dropdownItem,
                      item.week === selectedWeekInMonth &&
                        styles.selectedDropdownItem,
                    ]}
                    onPress={() => handleWeekSelect(item)}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        item.week === selectedWeekInMonth &&
                          styles.selectedDropdownItemText,
                      ]}
                    >
                      {item.display}
                    </Text>
                    {item.week === selectedWeekInMonth && (
                      <Ionicons name="checkmark" size={20} color={colors.red} />
                    )}
                  </TouchableOpacity>
                )}
                style={styles.dropdownList}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </TouchableOpacity>
        </Modal>
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
  combinedSelectorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  weekSelector: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingVertical: 8,
    paddingRight: 16,
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: "#e9ecef",
  },
  weekText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginRight: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginRight: 8,
  },
  fullWidthDateContainer: {
    flexDirection: "row",
    backgroundColor: colors.white,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  fullWidthDateItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  selectedFullWidthDateItem: {
    backgroundColor: colors.red,
    marginHorizontal: 4,
    borderRadius: 12,
  },
  todayFullWidthDateItem: {
    backgroundColor: "#e3f2fd",
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2196f3",
  },
  fullWidthDayName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6c757d",
    marginBottom: 4,
  },
  selectedFullWidthDayName: {
    color: colors.white,
  },
  fullWidthDateNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212529",
  },
  selectedFullWidthDateNumber: {
    color: colors.white,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 0,
    width: width * 0.85,
    maxHeight: height * 0.7,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  dropdownList: {
    maxHeight: height * 0.5,
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  selectedDropdownItem: {
    backgroundColor: "#fff5f5",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#1a1a1a",
    flex: 1,
  },
  selectedDropdownItemText: {
    color: colors.red,
    fontWeight: "600",
  },
});
