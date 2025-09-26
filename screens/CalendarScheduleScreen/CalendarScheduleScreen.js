import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Calendar } from "react-native-big-calendar";
import { useTranslation } from "../../hooks/useTranslation";
import colors from "../../constants/color";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import "dayjs/locale/en";
import Ionicons from "@expo/vector-icons/Ionicons";

const { width, height } = Dimensions.get("window");

export default function CalendarScheduleScreen() {
  const { t, currentLanguage } = useTranslation();
  const [mode, setMode] = useState("week"); // Can be 'month', 'week'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  // Set dayjs locale based on current language
  useEffect(() => {
    dayjs.locale(currentLanguage === "vi" ? "vi" : "en");
  }, [currentLanguage]);

  // Get array of 7 days for the current week (starting from Monday)
  const getCurrentWeekDays = (weekOffset = 0) => {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + weekOffset * 7);

    const currentMonday = new Date(targetDate);
    const dayOfWeek = targetDate.getDay();
    const daysFromMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    currentMonday.setDate(targetDate.getDate() + daysFromMonday);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentMonday);
      day.setDate(currentMonday.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Get day name
  const getDayName = (date) => {
    const daysShort = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return daysShort[date.getDay()];
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

  // Handle week navigation
  const goToPreviousWeek = () => {
    if (currentWeekOffset > 0) {
      setCurrentWeekOffset(currentWeekOffset - 1);
    }
  };

  const goToNextWeek = () => {
    setCurrentWeekOffset(currentWeekOffset + 1);
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const getWeekRangeText = () => {
    const weekDays = getCurrentWeekDays(currentWeekOffset);
    const startDate = weekDays[0];
    const endDate = weekDays[6];

    if (startDate.getMonth() === endDate.getMonth()) {
      return `${startDate.getDate()} - ${endDate.getDate()} ${t(
        "schedule.month"
      )} ${startDate.getMonth() + 1}, ${startDate.getFullYear()}`;
    } else {
      return `${startDate.getDate()}/${
        startDate.getMonth() + 1
      } - ${endDate.getDate()}/${
        endDate.getMonth() + 1
      }, ${startDate.getFullYear()}`;
    }
  };

  // Mock data for PT sessions with improved colors
  const mockPTSessions = [
    {
      title: "Strength Training with John",
      start: new Date(2025, 8, 26, 10, 0), // September 26, 2025, 10:00 AM
      end: new Date(2025, 8, 26, 11, 0), // September 26, 2025, 11:00 AM
      color: colors.red,
    },
    {
      title: "Cardio Session with Sarah",
      start: new Date(2025, 8, 26, 14, 30), // September 26, 2025, 2:30 PM
      end: new Date(2025, 8, 26, 15, 30), // September 26, 2025, 3:30 PM
      color: "#4CAF50",
    },
    {
      title: "Weight Training with Mike",
      start: new Date(2025, 8, 27, 9, 0), // September 27, 2025, 9:00 AM
      end: new Date(2025, 8, 27, 10, 0), // September 27, 2025, 10:00 AM
      color: colors.orange,
    },
    {
      title: "Yoga Session with Lisa",
      start: new Date(2025, 8, 28, 16, 0), // September 28, 2025, 4:00 PM
      end: new Date(2025, 8, 28, 17, 0), // September 28, 2025, 5:00 PM
      color: "#9C27B0",
    },
    {
      title: "HIIT Training with Alex",
      start: new Date(2025, 8, 29, 11, 0), // September 29, 2025, 11:00 AM
      end: new Date(2025, 8, 29, 12, 0), // September 29, 2025, 12:00 PM
      color: "#F44336",
    },
    {
      title: "Personal Training with David",
      start: new Date(2025, 8, 30, 8, 0), // September 30, 2025, 8:00 AM
      end: new Date(2025, 8, 30, 9, 30), // September 30, 2025, 9:30 AM
      color: "#2196F3",
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

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.red} barStyle="light-content" />

      {/* Calendar */}
      <View style={styles.calendarContainer}>
        {/* Mode switcher at top of calendar */}
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
        </View>
        {mode === "week" ? (
          // Week View with ScheduleScreen-style layout
          <View style={styles.weekViewContainer}>
            {/* Week Navigation - Matching ScheduleScreen */}
            <View style={styles.weekNavigationContainer}>
              <TouchableOpacity
                style={[
                  styles.navButton,
                  currentWeekOffset <= 0 && styles.disabledNavButton,
                ]}
                onPress={goToPreviousWeek}
                activeOpacity={0.7}
                disabled={currentWeekOffset <= 0}
              >
                <Text
                  style={[
                    styles.navButtonText,
                    currentWeekOffset <= 0 && styles.disabledNavButtonText,
                  ]}
                >
                  ‹
                </Text>
              </TouchableOpacity>

              <View style={styles.weekInfoContainer}>
                <Text style={styles.weekText}>{getWeekRangeText()}</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.navButton,
                  currentWeekOffset >= 1 && styles.disabledNavButton,
                ]}
                onPress={goToNextWeek}
                activeOpacity={0.7}
                disabled={currentWeekOffset >= 1}
              >
                <Text
                  style={[
                    styles.navButtonText,
                    currentWeekOffset >= 1 && styles.disabledNavButtonText,
                  ]}
                >
                  ›
                </Text>
              </TouchableOpacity>
            </View>

            {/* Date Picker - Matching ScheduleScreen */}
            <View style={styles.datePickerContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dateScrollContent}
              >
                {getCurrentWeekDays(currentWeekOffset).map((date, index) => {
                  const isSelectedDate = isSelected(date);
                  const isTodayDate = isToday(date);
                  const isPast = isPastDate(date);

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dateItem,
                        isSelectedDate && styles.selectedDateItem,
                        isTodayDate && !isSelectedDate && styles.todayDateItem,
                        isPast &&
                          !isSelectedDate &&
                          !isTodayDate &&
                          styles.pastDateItem,
                      ]}
                      onPress={() => handleDateSelect(date)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.dayName,
                          isSelectedDate && styles.selectedDayName,
                          isTodayDate && !isSelectedDate && styles.todayDayName,
                          isPast &&
                            !isSelectedDate &&
                            !isTodayDate &&
                            styles.pastDayName,
                        ]}
                      >
                        {getDayName(date)}
                      </Text>
                      <Text
                        style={[
                          styles.dateNumber,
                          isSelectedDate && styles.selectedDateNumber,
                          isTodayDate &&
                            !isSelectedDate &&
                            styles.todayDateNumber,
                          isPast &&
                            !isSelectedDate &&
                            !isTodayDate &&
                            styles.pastDateNumber,
                        ]}
                      >
                        {date.getDate()}
                      </Text>
                      <Text
                        style={[
                          styles.monthText,
                          isSelectedDate && styles.selectedMonthText,
                          isTodayDate &&
                            !isSelectedDate &&
                            styles.todayMonthText,
                          isPast &&
                            !isSelectedDate &&
                            !isTodayDate &&
                            styles.pastMonthText,
                        ]}
                      >
                        T{date.getMonth() + 1}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Sessions List - ScheduleScreen style */}
            <ScrollView style={styles.scrollView}>
              {mockPTSessions
                .filter(
                  (session) =>
                    session.start.toDateString() === selectedDate.toDateString()
                )
                .map((session, index) => (
                  <View key={index} style={styles.slotCard}>
                    <View style={styles.slotHeader}>
                      <Text style={styles.slotName}>{session.title}</Text>
                    </View>

                    <View style={styles.timeContainer}>
                      <View style={styles.timeItem}>
                        <Text style={styles.timeLabel}>Start Time</Text>
                        <Text style={styles.timeValue}>
                          {session.start.toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      </View>
                      <View style={styles.timeSeparator} />
                      <View style={styles.timeItem}>
                        <Text style={styles.timeLabel}>End Time</Text>
                        <Text style={styles.timeValue}>
                          {session.end.toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.bookButton}
                      onPress={() => handleEventPress(session)}
                    >
                      <Text style={styles.bookButtonText}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              {mockPTSessions.filter(
                (session) =>
                  session.start.toDateString() === selectedDate.toDateString()
              ).length === 0 && (
                <View style={styles.emptyContainer}>
                  <Ionicons name="calendar-outline" size={64} color="#ccc" />
                  <Text style={styles.emptyText}>No sessions scheduled</Text>
                  <Text style={styles.emptySubText}>
                    for{" "}
                    {selectedDate.toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  modeSwitcherContainer: {
    backgroundColor: colors.white,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  modeSwitcher: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
    marginHorizontal: 2,
  },
  activeModeButton: {
    backgroundColor: colors.red,
    shadowColor: colors.red,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeModeButtonText: {
    color: colors.white,
  },
  calendarContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  // Week View Styles - Matching ScheduleScreen
  weekViewContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  weekNavigationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.red,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledNavButton: {
    backgroundColor: "#e9ecef",
  },
  navButtonText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "700",
  },
  disabledNavButtonText: {
    color: "#6c757d",
  },
  weekInfoContainer: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 16,
  },
  weekText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1a1a1a",
    textAlign: "center",
  },
  datePickerContainer: {
    backgroundColor: colors.white,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  dateScrollContent: {
    paddingHorizontal: 20,
  },
  dateItem: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    minWidth: 70,
  },
  selectedDateItem: {
    backgroundColor: colors.red,
  },
  todayDateItem: {
    backgroundColor: "#e3f2fd",
    borderWidth: 1,
    borderColor: "#2196f3",
  },
  pastDateItem: {
    backgroundColor: "#f5f5f5",
  },
  dayName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6c757d",
    marginBottom: 4,
  },
  selectedDayName: {
    color: colors.white,
  },
  todayDayName: {
    color: "#2196f3",
  },
  pastDayName: {
    color: "#adb5bd",
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212529",
    marginBottom: 2,
  },
  selectedDateNumber: {
    color: colors.white,
  },
  todayDateNumber: {
    color: "#2196f3",
  },
  pastDateNumber: {
    color: "#adb5bd",
  },
  monthText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#6c757d",
  },
  selectedMonthText: {
    color: colors.white,
  },
  todayMonthText: {
    color: "#2196f3",
  },
  pastMonthText: {
    color: "#adb5bd",
  },
  scrollView: {
    flex: 1,
  },
  slotCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  bookButton: {
    backgroundColor: colors.red,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  bookButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
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
});
