import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { useNavigation } from "@react-navigation/native";
import colors from "../../constants/color";
import Ionicons from "@expo/vector-icons/Ionicons";
import SessionCard from "../../components/SessionCard/SessionCard";
import accountService from "../../services/accountService";
import { fetchUserFromStorage, formatDateForAPI } from "../../lib";

const { width, height } = Dimensions.get("window");

export default function CalendarScheduleScreen() {
  const { t, currentLanguage } = useTranslation();
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const loadBookingOfUser = async (date = selectedDate) => {
    try {
      const user = await fetchUserFromStorage();
      const selectDate = formatDateForAPI(date);
      const response = await accountService.getBookingForUser({
        customerId: user.id,
        date: selectDate,
      });
      console.log("Slots data:", response.data?.items || []);

      // Transform booking data to match SessionCard expected format
      const transformedBookings = (response.data?.items || []).map(
        (booking) => ({
          ...booking,
          // Map API fields to SessionCard expected fields
          ptGymSlotId: booking.ptGymSlotId,
          startTime: booking.gymSlotStartTime,
          endTime: booking.gymSlotEndTime,
          ptName: booking.ptName || "Personal Trainer", // Default if not available
          avatarUrl: booking.avatarUrl, // May be null
          title: t("calendar.ptSession") || "PT Session",
          status: booking.sessionStatus,
        })
      );

      setBookings(transformedBookings);
      console.log("Transformed bookings data:", transformedBookings);
    } catch (error) {
      console.error("Error loading gym bookings:", error);
      Alert.alert(t("schedule.error"), t("schedule.loadSlotsError"));
    } finally {
      setLoading(false);
    }
  };
  // Helper function to get current week number
  const getCurrentWeekInMonth = (date = new Date()) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const currentDate = date.getDate();

    // Get the first day of the month
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

  // Dropdown states
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showWeekDropdown, setShowWeekDropdown] = useState(false);

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

  // Helper functions for date checking
  const isSelected = (date) => {
    return selectedDate.toDateString() === date.toDateString();
  };

  const isToday = (date) => {
    return new Date().toDateString() === date.toDateString();
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setLoading(true);
    loadBookingOfUser(date);
  };

  // Load bookings when component mounts
  useEffect(() => {
    setLoading(true);
    loadBookingOfUser();
  }, []);

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

  // Mock data for PT sessions matching API response format

  const handleDatePress = (date) => {
    setSelectedDate(date);
  };

  const handleBookSession = () => {
    navigation.navigate("ChoosingCourseScreen");
  };

  // Helper function to check if session is on selected date
  const isSessionOnDate = (session, targetDate) => {
    // Validate inputs
    if (!session || !session.bookingDate || !targetDate) {
      console.warn("Invalid session or target date:", { session, targetDate });
      return false;
    }

    try {
      // Convert bookingDate (YYYY-MM-DD) to comparable format
      const sessionDate = new Date(session.bookingDate);

      // Check if date is valid
      if (isNaN(sessionDate.getTime())) {
        console.warn("Invalid session date:", session.bookingDate);
        return false;
      }

      return sessionDate.toDateString() === targetDate.toDateString();
    } catch (error) {
      console.error("Error comparing dates:", error, { session, targetDate });
      return false;
    }
  };

  // Helper functions for session display
  const formatTime = (timeString) => {
    // Validate input parameter
    if (!timeString || typeof timeString !== "string") {
      console.warn("Invalid time string:", timeString);
      return "--:--";
    }

    try {
      // Handle time strings from API (e.g., "10:00:00")
      const timeParts = timeString.split(":");
      if (timeParts.length < 2) {
        console.warn("Invalid time format:", timeString);
        return "--:--";
      }

      const [hours, minutes] = timeParts;
      return `${hours}:${minutes}`;
    } catch (error) {
      console.error("Error formatting time:", error, timeString);
      return "--:--";
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

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.red} barStyle="light-content" />

      {/* Calendar */}
      <View style={styles.calendarContainer}>
        {/* Book Session button */}
        <View style={styles.bookSessionContainer}>
          <TouchableOpacity
            style={styles.bookSessionButton}
            onPress={handleBookSession}
          >
            <Text style={styles.bookSessionButtonText}>
              {t("calendar.bookSession")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Week View with ScheduleScreen-style layout */}
        <View style={styles.weekViewContainer}>
          {/* Combined Month and Week Selector */}
          <View style={styles.combinedSelectorContainer}>
            {/* Month Selector */}

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
              const isPast = isPastDate(date);

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

          {/* Sessions List Header */}
          <View style={styles.sessionsHeader}>
            <Text style={styles.sessionsHeaderText}>
              {t("calendar.sessionsList")}
            </Text>
          </View>

          {/* Sessions List - New Layout */}
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
                    <SessionCard
                      key={session.bookingId}
                      session={session}
                      formatTime={formatTime}
                      calculateDuration={calculateDuration}
                      buttonText={t("calendar.cancelSession")}
                      withText={t("calendar.with")}
                      t={t}
                      buttonAction={() => {
                        // Handle cancel session action
                        console.log("Cancel session:", session.bookingId);
                      }}
                    />
                  ))}

                {bookings.filter((session) =>
                  isSessionOnDate(session, selectedDate)
                ).length === 0 && (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="calendar-outline" size={64} color="#ccc" />
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
              <Text style={styles.modalTitle}>{t("calendar.selectMonth")}</Text>
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
              <Text style={styles.modalTitle}>{t("calendar.selectWeek")}</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  bookSessionContainer: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    alignItems: "flex-end",
  },
  bookSessionButton: {
    backgroundColor: colors.red,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 100,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.red,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookSessionButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "600",
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
  // Combined Month and Week Selector
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
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",

    paddingVertical: 8,
    paddingLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: "#e9ecef",
  },
  monthText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginRight: 8,
  },
  weekSelector: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingVertical: 8,
    paddingRight: 16,
  },
  weekText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginRight: 8,
  },
  // Week Navigation// Full Width Date Container
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
  // Sessions List Header
  sessionsHeader: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sessionsHeaderText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
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
  calendarHeader: {
    backgroundColor: colors.red,
    paddingVertical: 12,
  },
  calendarBody: {
    backgroundColor: colors.white,
  },
  // Modal styles
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
