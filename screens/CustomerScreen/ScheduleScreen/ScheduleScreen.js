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
import colors from "../../../constants/color";
import { useTranslation } from "../../../hooks/useTranslation";
import { formatDateForAPI } from "../../../lib";
import Ionicons from "@expo/vector-icons/Ionicons";
import accountService from "../../../services/accountService";
import SessionCard from "../../../components/SessionCard/SessionCard_New";
import WeekCalendar from "../../../components/WeekCalendar/WeekCalendar";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

export default function ScheduleScreen({ route }) {
  const { t, currentLanguage } = useTranslation();
  const navigation = useNavigation();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [booking, setBooking] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { ptId } = route.params || {};
  const { customerPurchasedId } = route.params || {};
  const loadPTSlotOfUser = async (date = selectedDate) => {
    try {
      const selectDate = formatDateForAPI(date);
      const response = await accountService.getPTSlotforUser({
        date: selectDate,
        ptId,
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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPTSlotOfUser(selectedDate);
    setRefreshing(false);
  };

  // Handle booking a PT slot
  const handleBookSlot = async (slot) => {
    console.log("Attempting to book slot:", slot);
    Alert.alert(
      t("schedule.confirmBooking"),
      t("schedule.bookSlotConfirm", {
        slotName: slot.slotName,
      }),
      [
        {
          text: t("schedule.cancel"),
          style: "cancel",
        },
        {
          text: t("schedule.confirmBook"),
          onPress: async () => {
            setBooking(slot.slotId);
            try {
              const today = new Date();
              const bookingDate = selectedDate;

              // Validate date
              if (bookingDate < today.setHours(0, 0, 0, 0)) {
                Alert.alert(
                  t("schedule.error"),
                  t("schedule.cannotBookPastDate")
                );
                return;
              }

              await accountService.bookingSlot({
                ptGymSlotId: slot.ptGymSlotId,
                customerPurchasedId,
              });

              Alert.alert(
                t("schedule.success"),
                t("schedule.slotBookedSuccessfully")
              );
              loadPTSlotOfUser(selectedDate); // Refresh the slots
            } catch (error) {
              console.error("Error booking PT slot:", error.response.data);
              Alert.alert(
                t("schedule.error"),
                error.message || t("schedule.bookingError")
              );
            } finally {
              setBooking(null);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    const loadData = async () => {
      const today = new Date();
      setSelectedDate(today);
      loadPTSlotOfUser(today);
    };
    loadData();
  }, []);

  const formatTime = (timeString) => {
    let hours, minutes;

    if (timeString instanceof Date) {
      // If it's a Date object, extract hours and minutes
      hours = timeString.getHours();
      minutes = timeString.getMinutes();
    } else if (typeof timeString === "string") {
      // If it's a string, split and parse
      [hours, minutes] = timeString.split(":").map(Number);
    } else {
      console.error("formatTime received invalid input:", timeString);
      return "";
    }

    const period = hours >= 12 ? t("schedule.pm") : t("schedule.am");
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const calculateDuration = (startTime, endTime) => {
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes > 0 ? diffMinutes + "m" : ""}`.trim();
    } else {
      return `${diffMinutes}m`;
    }
  };

  // Transform slot data to session format for SessionCard
  const transformSlotToSession = (slot) => {
    return {
      ...slot,
      bookingId: slot.slotId,
      ptName: slot.ptName || "Personal Trainer",
      startTime: slot.startTime,
      endTime: slot.endTime,
      title: slot.slotName, // "PT Training Session" or similar
    };
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
        />

        

        {/* Sessions List */}
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
              .map((slot) => {
                const sessionData = transformSlotToSession(slot);
                return (
                  <SessionCard
                    key={slot.slotId}
                    session={sessionData}
                    formatTime={formatTime}
                    calculateDuration={calculateDuration}
                    buttonText={
                      booking === slot.slotId
                        ? t("schedule.booking")
                        : t("schedule.bookSlot")
                    }
                    t={t}
                    buttonAction={() => handleBookSlot(slot)}
                    isLoading={booking === slot.slotId}
                    buttonDisabled={booking !== null}
                  />
                );
              })
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
  bookingButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  bookSessionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.red,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookSessionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
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
});
