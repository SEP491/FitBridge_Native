import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../constants/color";
import notificationService from "../../services/notificationService";

/**
 * Notification Test Helper Component
 *
 * Use this component to test notification functionality in development.
 * Add it to your app temporarily to test different notification scenarios.
 *
 * Usage:
 * import NotificationTestHelper from '../components/NotificationTestHelper';
 * <NotificationTestHelper />
 */
export default function NotificationTestHelper() {
  const [title, setTitle] = useState("Test Notification");
  const [body, setBody] = useState(
    "This is a test notification from FitBridge"
  );
  const [scheduledCount, setScheduledCount] = useState(0);

  const sendImmediateNotification = async (type = "system") => {
    try {
      const icons = {
        booking: "calendar",
        payment: "card",
        promotion: "pricetag",
        system: "person",
        fitness: "alarm",
      };

      const colors = {
        booking: "#17a2b8",
        payment: "#28a745",
        promotion: "#FF914D",
        system: "#6f42c1",
        fitness: "#ED2A46",
      };

      await notificationService.presentNotification({
        title: title,
        body: body,
        data: {
          type: type,
          icon: icons[type],
          color: colors[type],
          timestamp: new Date().toISOString(),
        },
        sound: "default",
        badge: 1,
      });

      Alert.alert("Success", "Notification sent!");
    } catch (error) {
      console.error("Error sending notification:", error);
      Alert.alert("Error", "Failed to send notification: " + error.message);
    }
  };

  const schedule30SecondsNotification = async () => {
    try {
      const date = new Date();
      date.setSeconds(date.getSeconds() + 30);

      await notificationService.scheduleNotificationForDate(
        {
          title: "Scheduled Notification",
          body: "This notification was scheduled 30 seconds ago",
          data: { type: "system" },
        },
        date
      );

      setScheduledCount((prev) => prev + 1);
      Alert.alert("Scheduled", "Notification will appear in 30 seconds");
    } catch (error) {
      console.error("Error scheduling notification:", error);
      Alert.alert("Error", "Failed to schedule notification: " + error.message);
    }
  };

  const scheduleDailyNotification = async () => {
    try {
      await notificationService.scheduleDailyNotification(
        {
          title: "Daily Fitness Reminder",
          body: "Don't forget your workout today! 💪",
          data: { type: "fitness" },
        },
        9,
        0
      ); // 9:00 AM daily

      Alert.alert("Success", "Daily notification scheduled for 9:00 AM");
    } catch (error) {
      console.error("Error scheduling daily notification:", error);
      Alert.alert(
        "Error",
        "Failed to schedule daily notification: " + error.message
      );
    }
  };

  const checkScheduledNotifications = async () => {
    try {
      const notifications =
        await notificationService.getAllScheduledNotifications();
      Alert.alert(
        "Scheduled Notifications",
        `You have ${
          notifications.length
        } scheduled notifications:\n\n${notifications
          .map((n) => n.content.title)
          .join("\n")}`
      );
    } catch (error) {
      console.error("Error checking notifications:", error);
      Alert.alert("Error", "Failed to check notifications: " + error.message);
    }
  };

  const cancelAllNotifications = async () => {
    try {
      await notificationService.cancelAllNotifications();
      setScheduledCount(0);
      Alert.alert("Success", "All scheduled notifications cancelled");
    } catch (error) {
      console.error("Error cancelling notifications:", error);
      Alert.alert("Error", "Failed to cancel notifications: " + error.message);
    }
  };

  const setBadgeNumber = async (count) => {
    try {
      await notificationService.setBadgeCount(count);
      Alert.alert("Success", `Badge count set to ${count}`);
    } catch (error) {
      console.error("Error setting badge:", error);
      Alert.alert("Error", "Failed to set badge: " + error.message);
    }
  };

  const requestPermissions = async () => {
    try {
      const token = await notificationService.registerForPushNotifications();
      if (token) {
        Alert.alert(
          "Success",
          `Notifications enabled!\n\nPush Token:\n${token}`,
          [{ text: "Copy", onPress: () => console.log("Token:", token) }]
        );
      } else {
        Alert.alert("Error", "Failed to get push token. Check permissions.");
      }
    } catch (error) {
      console.error("Error requesting permissions:", error);
      Alert.alert("Error", "Failed to request permissions: " + error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="notifications" size={32} color={colors.red} />
        <Text style={styles.headerTitle}>Notification Test Helper</Text>
        <Text style={styles.headerSubtitle}>
          Test notification functionality
        </Text>
      </View>

      {/* Custom Notification */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Custom Notification</Text>
        <TextInput
          style={styles.input}
          placeholder="Notification Title"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Notification Body"
          value={body}
          onChangeText={setBody}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Notification Types */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Send by Type</Text>
        <View style={styles.buttonGrid}>
          <TouchableOpacity
            style={[styles.typeButton, { backgroundColor: "#17a2b8" }]}
            onPress={() => sendImmediateNotification("booking")}
          >
            <Ionicons name="calendar" size={24} color="#fff" />
            <Text style={styles.typeButtonText}>Booking</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeButton, { backgroundColor: "#28a745" }]}
            onPress={() => sendImmediateNotification("payment")}
          >
            <Ionicons name="card" size={24} color="#fff" />
            <Text style={styles.typeButtonText}>Payment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeButton, { backgroundColor: "#FF914D" }]}
            onPress={() => sendImmediateNotification("promotion")}
          >
            <Ionicons name="pricetag" size={24} color="#fff" />
            <Text style={styles.typeButtonText}>Promo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeButton, { backgroundColor: "#6f42c1" }]}
            onPress={() => sendImmediateNotification("system")}
          >
            <Ionicons name="person" size={24} color="#fff" />
            <Text style={styles.typeButtonText}>System</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeButton, { backgroundColor: colors.red }]}
            onPress={() => sendImmediateNotification("fitness")}
          >
            <Ionicons name="alarm" size={24} color="#fff" />
            <Text style={styles.typeButtonText}>Fitness</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scheduled Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Scheduled Notifications ({scheduledCount})
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={schedule30SecondsNotification}
        >
          <Ionicons name="time" size={20} color="#fff" />
          <Text style={styles.buttonText}>Schedule in 30 seconds</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#FF914D" }]}
          onPress={scheduleDailyNotification}
        >
          <Ionicons name="repeat" size={20} color="#fff" />
          <Text style={styles.buttonText}>Schedule Daily (9:00 AM)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#17a2b8" }]}
          onPress={checkScheduledNotifications}
        >
          <Ionicons name="list" size={20} color="#fff" />
          <Text style={styles.buttonText}>View Scheduled</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#dc3545" }]}
          onPress={cancelAllNotifications}
        >
          <Ionicons name="trash" size={20} color="#fff" />
          <Text style={styles.buttonText}>Cancel All Scheduled</Text>
        </TouchableOpacity>
      </View>

      {/* Badge Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Badge Control</Text>
        <View style={styles.badgeButtons}>
          {[1, 5, 10, 99].map((count) => (
            <TouchableOpacity
              key={count}
              style={styles.badgeButton}
              onPress={() => setBadgeNumber(count)}
            >
              <Text style={styles.badgeButtonText}>{count}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.badgeButton, { backgroundColor: "#dc3545" }]}
            onPress={() => setBadgeNumber(0)}
          >
            <Text style={styles.badgeButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Permissions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Permissions</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#28a745" }]}
          onPress={requestPermissions}
        >
          <Ionicons name="shield-checkmark" size={20} color="#fff" />
          <Text style={styles.buttonText}>Request Permissions</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          ⚠️ This is a development tool. Remove before production.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: colors.red,
    padding: 24,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  typeButton: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  typeButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.red,
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  badgeButtons: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  badgeButton: {
    backgroundColor: colors.red,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 60,
    alignItems: "center",
  },
  badgeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    padding: 24,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#dc3545",
    fontStyle: "italic",
  },
});
