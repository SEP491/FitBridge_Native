import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Dimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import colors from "../../constants/color";
import { useTranslation } from "../../hooks/useTranslation";
import ptService from "../../services/ptService";
import { formatDateForAPI, fetchUserFromStorage } from "../../lib";

const { width, height } = Dimensions.get("window");

const WeekCalendar = ({
  onDateSelect,
  selectedDate = new Date(),
  initialDate = new Date(),
  checkMinimumSlot = false,
  onMinimumSlotCheck = null, // Callback for minimum slot check result
}) => {
  const { t } = useTranslation();

  // State for calendar navigation
  const [currentSelectedDate, setCurrentSelectedDate] = useState(selectedDate);
  const [selectedMonth, setSelectedMonth] = useState(initialDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear());

  // Dropdown states
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showWeekDropdown, setShowWeekDropdown] = useState(false);

  const handleCheckMinimumSlot = async (startWeek, endWeek) => {
    if (!checkMinimumSlot) return;

    try {
      const response = await ptService.checkMinimumSlot({
        startWeek: formatDateForAPI(startWeek),
        endWeek: formatDateForAPI(endWeek),
      });

      console.log("Check minimum slot response:", response.data);

      // Call the callback if provided
      if (onMinimumSlotCheck) {
        onMinimumSlotCheck(response.data, { startWeek, endWeek });
      }

      return response.data;
    } catch (error) {
      console.error("Error checking minimum slot:", error);

      // Call the callback with error if provided
      if (onMinimumSlotCheck) {
        onMinimumSlotCheck(null, { startWeek, endWeek }, error);
      }

      return null;
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
    getCurrentWeekInMonth(initialDate)
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
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      days.push(date);
    }
    return days;
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
      const startMonth = year === currentYear ? currentMonth : 0;
      const endMonth = year === currentYear ? 11 : 11;

      for (let month = startMonth; month <= endMonth; month++) {
        data.push({
          id: `${year}-${month}`,
          month,
          year,
          display: `${t(monthKeys[month])} ${t("calendar.year")} ${year}`,
        });
      }
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
      // Check if this week contains any future dates for current month
      const isCurrentMonth =
        selectedYear === currentYear && selectedMonth === currentMonth;

      if (isCurrentMonth) {
        // For current month, check if week contains current or future dates
        const firstDay = new Date(selectedYear, selectedMonth, 1);
        const firstMonday = new Date(firstDay);
        const firstDayOfWeek = firstDay.getDay();
        const daysToSubtract = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
        firstMonday.setDate(firstDay.getDate() - daysToSubtract);

        const weekStart = new Date(firstMonday);
        weekStart.setDate(firstMonday.getDate() + (week - 1) * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        // Check if week contains any future dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (weekEnd >= today) {
          data.push({
            id: week,
            week,
            display: `${t("calendar.week")} ${week}`,
          });
        }
      } else {
        // For future months, include all weeks
        data.push({
          id: week,
          week,
          display: `${t("calendar.week")} ${week}`,
        });
      }
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

  // Handle date selection
  const handleDateSelect = (date) => {
    // Prevent selecting past dates
    if (isPastDate(date)) {
      return;
    }

    setCurrentSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  // Check if date is in the past
  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is selected
  const isSelected = (date) => {
    return date.toDateString() === currentSelectedDate.toDateString();
  };

  // Update selected date when prop changes
  useEffect(() => {
    if (selectedDate) {
      setCurrentSelectedDate(selectedDate);
    }
  }, [selectedDate]);

  // Call check minimum slot API when week changes
  useEffect(() => {
    if (checkMinimumSlot) {
      const currentWeekDays = getCurrentWeekDaysForMonth();
      if (currentWeekDays.length > 0) {
        const startWeek = currentWeekDays[0]; // Monday (start of week)
        const endWeek = currentWeekDays[6]; // Sunday (end of week)

        // Call the API with the current week range
        handleCheckMinimumSlot(startWeek, endWeek);
      }
    }
  }, [selectedMonth, selectedYear, selectedWeekInMonth, checkMinimumSlot]);

  return (
    <>
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

      {/* Week Days Container */}
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
                isTodayDate && !isSelectedDate && styles.todayFullWidthDateItem,
                isPast && styles.pastFullWidthDateItem,
              ]}
              onPress={() => handleDateSelect(date)}
              disabled={isPast}
            >
              <Text
                style={[
                  styles.fullWidthDayName,
                  isSelectedDate && styles.selectedFullWidthDayName,
                  isPast && styles.pastFullWidthDayName,
                ]}
              >
                {getDayName(date)}
              </Text>
              <Text
                style={[
                  styles.fullWidthDateNumber,
                  isSelectedDate && styles.selectedFullWidthDateNumber,
                  isPast && styles.pastFullWidthDateNumber,
                ]}
              >
                {date.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

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
    </>
  );
};

const styles = StyleSheet.create({
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
  // Full Width Date Container
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
  pastFullWidthDateItem: {
    backgroundColor: "#f8f9fa",
    marginHorizontal: 4,
    borderRadius: 12,
    opacity: 0.5,
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
  pastFullWidthDayName: {
    color: "#adb5bd",
  },
  fullWidthDateNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212529",
  },
  selectedFullWidthDateNumber: {
    color: colors.white,
  },
  pastFullWidthDateNumber: {
    color: "#adb5bd",
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

export default WeekCalendar;
