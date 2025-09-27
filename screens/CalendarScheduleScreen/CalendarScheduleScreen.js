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
} from "react-native";
import React, { useState, useEffect } from "react";
import { Calendar } from "react-native-big-calendar";
import { useTranslation } from "../../hooks/useTranslation";
import { useNavigation } from "@react-navigation/native";
import colors from "../../constants/color";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import "dayjs/locale/en";
import Ionicons from "@expo/vector-icons/Ionicons";
import SessionCard from "../../components/SessionCard/SessionCard";

const { width, height } = Dimensions.get("window");

export default function CalendarScheduleScreen() {
  const { t, currentLanguage } = useTranslation();
  const navigation = useNavigation();
  const [mode, setMode] = useState("week"); // Can be 'month', 'week'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

  // Set dayjs locale based on current language
  useEffect(() => {
    dayjs.locale(currentLanguage === "vi" ? "vi" : "en");
  }, [currentLanguage]);

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

  // Mock data for PT sessions with enhanced details
  const mockPTSessions = [
    {
      id: 1,
      title: "Strength Training",
      pt: {
        name: "John Smith",
        avatar:
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face",
        initials: "JS",
      },
      start: new Date(2025, 8, 26, 10, 0), // September 26, 2025, 10:00 AM
      end: new Date(2025, 8, 26, 11, 0), // September 26, 2025, 11:00 AM
      color: colors.red,
      category: "Strength",
    },
    {
      id: 2,
      title: "Cardio Session",
      pt: {
        name: "Sarah Wilson",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b25aa3cc?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face",
        initials: "SW",
      },
      start: new Date(2025, 8, 26, 14, 30), // September 26, 2025, 2:30 PM
      end: new Date(2025, 8, 26, 15, 30), // September 26, 2025, 3:30 PM
      color: "#4CAF50",
      category: "Cardio",
    },
    {
      id: 3,
      title: "Weight Training",
      pt: {
        name: "Mike Johnson",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face",
        initials: "MJ",
      },
      start: new Date(2025, 8, 27, 9, 0), // September 27, 2025, 9:00 AM
      end: new Date(2025, 8, 27, 10, 0), // September 27, 2025, 10:00 AM
      color: colors.orange,
      category: "Weight Training",
    },
    {
      id: 4,
      title: "Yoga Session",
      pt: {
        name: "Lisa Chen",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face",
        initials: "LC",
      },
      start: new Date(2025, 8, 28, 16, 0), // September 28, 2025, 4:00 PM
      end: new Date(2025, 8, 28, 17, 0), // September 28, 2025, 5:00 PM
      color: "#9C27B0",
      category: "Yoga",
    },
    {
      id: 5,
      title: "HIIT Training",
      pt: {
        name: "Alex Rodriguez",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face",
        initials: "AR",
      },
      start: new Date(2025, 8, 29, 11, 0), // September 29, 2025, 11:00 AM
      end: new Date(2025, 8, 29, 12, 0), // September 29, 2025, 12:00 PM
      color: "#F44336",
      category: "HIIT",
    },
    {
      id: 6,
      title: "Personal Training",
      pt: {
        name: "David Brown",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&w=150&h=150&fit=crop&crop=face",
        initials: "DB",
      },
      start: new Date(2026, 9, 30, 9, 0), // October 30, 2026, 9:00 AM
      end: new Date(2026, 9, 30, 9, 30), // October 30, 2026, 9:30 AM
      color: "#2196F3",
      category: "Personal Training",
    },
  ];

  const handleEventPress = (event) => {
    // Handle event press - could navigate to session details
  };

  const handleDatePress = (date) => {
    // Handle date press - could show add session option
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
  };

  const handleBookSession = () => {
    navigation.navigate("ChoosingCourseScreen");
  };

  // Helper functions for session display
  const formatTime = (date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const calculateDuration = (start, end) => {
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
        {/* Mode switcher and Book Session button row */}
        <View style={styles.modeSwitcherContainer}>
          <View style={styles.modeSwitcher}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === "week" && styles.activeModeButton,
              ]}
              onPress={() => handleModeChange("week")}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  mode === "week" && styles.activeModeButtonText,
                ]}
              >
                {t("calendar.week") || "Week"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === "month" && styles.activeModeButton,
              ]}
              onPress={() => handleModeChange("month")}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  mode === "month" && styles.activeModeButtonText,
                ]}
              >
                {t("calendar.month") || "Month"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Book Session Button */}
          <TouchableOpacity
            style={styles.bookSessionButton}
            onPress={handleBookSession}
          >
            <Text style={styles.bookSessionButtonText}>
              {t("calendar.bookSession")}
            </Text>
          </TouchableOpacity>
        </View>
        {mode === "week" ? (
          // Week View with ScheduleScreen-style layout
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
              {mockPTSessions
                .filter(
                  (session) =>
                    session.start.toDateString() === selectedDate.toDateString()
                )
                .map((session, index) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    formatTime={formatTime}
                    calculateDuration={calculateDuration}
                    buttonText={t("calendar.cancelSession")}
                    withText={t("calendar.with")}
                    t={t}
                    buttonAction={() => {
                      // Handle cancel session action
                      console.log("Cancel session:", session.id);
                    }}
                  />
                ))}

              {mockPTSessions.filter(
                (session) =>
                  session.start.toDateString() === selectedDate.toDateString()
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
            </ScrollView>
          </View>
        ) : (
          // Month View with Big Calendar
          <Calendar
            events={mockPTSessions}
            height={height - 280}
            width={width - 32}
            mode="month"
            onPressEvent={handleEventPress}
            onPressDate={handleDatePress}
            eventCellStyle={(event) => ({
              backgroundColor: event.color || colors.red,
              borderRadius: 8,
              padding: 4,
            })}
            calendarHeaderStyle={styles.calendarHeader}
            bodyContainerStyle={styles.calendarBody}
            showTime={true}
            swipeEnabled={true}
            scrollOffsetMinutes={480} // Start view at 8:00 AM
            date={new Date()} // Current date
            locale={currentLanguage}
            showAdjacentMonths={true}
            theme={{
              palette: {
                primary: {
                  main: colors.red,
                  contrastText: colors.white,
                },
                gray: {
                  100: "#f8f9fa",
                  200: "#e9ecef",
                  300: "#dee2e6",
                  500: "#6c757d",
                  800: "#495057",
                },
              },
            }}
          />
        )}
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
  modeSwitcherContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  modeSwitcher: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    padding: 3,
    flex: 1,
    marginRight: 12,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: "center",
    marginHorizontal: 1,
  },
  activeModeButton: {
    backgroundColor: colors.red,
    shadowColor: colors.red,
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modeButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  activeModeButtonText: {
    color: colors.white,
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
