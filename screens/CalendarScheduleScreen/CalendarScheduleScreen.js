import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { useNavigation } from "@react-navigation/native";
import colors from "../../constants/color";
import Ionicons from "@expo/vector-icons/Ionicons";
import SessionBookingCard from "../../components/SessionBookingCard/SessionBookingCard_New";
import WeekCalendar from "../../components/WeekCalendar/WeekCalendar";
import accountService from "../../services/accountService";
import { fetchUserFromStorage, formatDateForAPI } from "../../lib";

const { width, height } = Dimensions.get("window");

export default function CalendarScheduleScreen() {
  const { t, currentLanguage } = useTranslation();
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadBookingOfUser = async (date = selectedDate) => {
    try {
      setLoading(true);
      const user = await fetchUserFromStorage();
      if (!user || !user.id) {
        console.warn("User not found or invalid");
        return;
      }

      const formattedDate = formatDateForAPI(date);
      console.log("Loading bookings for date:", formattedDate);

      const response = await accountService.getBookingForUser({
        customerId: user.id,
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
    loadBookingOfUser(date);
  };

  // Load bookings when component mounts
  useEffect(() => {
    setLoading(true);
    loadBookingOfUser();
  }, []);

  const handleBookSession = () => {
    navigation.navigate("ChoosingCourseScreen");
  };

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
              loadBookingOfUser(selectedDate);
            } catch (error) {
              console.error("Error canceling booking:", error.response.data);
              Alert.alert(t("calendar.error"), t("calendar.cancellationError"));
            }
          },
        },
      ]
    );
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
                      ptName={session.ptName}
                      ptAvatar={session.ptAvatarUrl}
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
});
