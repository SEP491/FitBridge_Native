import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  /**
   * Request notification permissions
   * @returns {Promise<boolean>} Whether permission was granted
   */
  async registerForPushNotifications() {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#ED2A46",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return false;
      }

      try {
        token = await Notifications.getExpoPushTokenAsync({
          projectId:
            Constants.expoConfig?.extra?.eas?.projectId || "your-project-id",
        });
        console.log("Expo Push Token:", token.data);

        // TODO: Send this token to your backend
        // await this.sendTokenToBackend(token.data);

        return token.data;
      } catch (error) {
        console.error("Error getting push token:", error);
        return false;
      }
    } else {
      console.log("Must use physical device for Push Notifications");
      return false;
    }
  }

  /**
   * Send push token to backend
   * @param {string} token - The Expo push token
   */
  async sendTokenToBackend(token) {
    try {
      // TODO: Replace with your actual API endpoint
      // await request.post('/api/notifications/register', { token });
      console.log("Token sent to backend:", token);
    } catch (error) {
      console.error("Error sending token to backend:", error);
      throw error;
    }
  }

  /**
   * Schedule a local notification
   * @param {Object} notification - Notification content
   * @param {Object} trigger - Trigger configuration
   */
  async scheduleNotification(notification, trigger = null) {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: notification.sound || "default",
          badge: notification.badge,
        },
        trigger: trigger || null, // null means immediate
      });
      return id;
    } catch (error) {
      console.error("Error scheduling notification:", error);
      throw error;
    }
  }

  /**
   * Cancel a scheduled notification
   * @param {string} notificationId - The notification ID
   */
  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error("Error canceling notification:", error);
      throw error;
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error canceling all notifications:", error);
      throw error;
    }
  }

  /**
   * Get all scheduled notifications
   * @returns {Promise<Array>} List of scheduled notifications
   */
  async getAllScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error getting scheduled notifications:", error);
      throw error;
    }
  }

  /**
   * Set notification badge count
   * @param {number} count - Badge count
   */
  async setBadgeCount(count) {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error("Error setting badge count:", error);
      throw error;
    }
  }

  /**
   * Get current badge count
   * @returns {Promise<number>} Current badge count
   */
  async getBadgeCount() {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error("Error getting badge count:", error);
      return 0;
    }
  }

  /**
   * Add notification received listener
   * @param {Function} listener - Callback function
   * @returns {Subscription} Subscription object
   */
  addNotificationReceivedListener(listener) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  /**
   * Add notification response listener (when user taps notification)
   * @param {Function} listener - Callback function
   * @returns {Subscription} Subscription object
   */
  addNotificationResponseReceivedListener(listener) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  /**
   * Present a local notification immediately
   * @param {Object} notification - Notification content
   */
  async presentNotification(notification) {
    return await this.scheduleNotification(notification, null);
  }

  /**
   * Schedule notification for specific date/time
   * @param {Object} notification - Notification content
   * @param {Date} date - When to trigger the notification
   */
  async scheduleNotificationForDate(notification, date) {
    return await this.scheduleNotification(notification, {
      date: date,
    });
  }

  /**
   * Schedule daily notification
   * @param {Object} notification - Notification content
   * @param {number} hour - Hour (0-23)
   * @param {number} minute - Minute (0-59)
   */
  async scheduleDailyNotification(notification, hour, minute) {
    return await this.scheduleNotification(notification, {
      hour: hour,
      minute: minute,
      repeats: true,
    });
  }

  /**
   * Check notification permissions
   * @returns {Promise<Object>} Permission status
   */
  async checkPermissions() {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return {
        granted: status === "granted",
        status: status,
      };
    } catch (error) {
      console.error("Error checking permissions:", error);
      return { granted: false, status: "undetermined" };
    }
  }

  /**
   * Get notification settings (iOS)
   * @returns {Promise<Object>} Notification settings
   */
  async getNotificationSettings() {
    try {
      if (Platform.OS === "ios") {
        const settings = await Notifications.getPermissionsAsync();
        return settings;
      }
      return null;
    } catch (error) {
      console.error("Error getting notification settings:", error);
      return null;
    }
  }
}

export default new NotificationService();
