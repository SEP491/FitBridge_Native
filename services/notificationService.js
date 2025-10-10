import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { request } from "./request";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
  }),
});

/**
 * Request notification permissions
 * @returns {Promise<boolean>} Whether permission was granted
 */
export const registerForPushNotifications = async () => {
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
      let pushSubscription = await Notifications.getDevicePushTokenAsync();
      const token = pushSubscription.data;
      console.log("Push notification token:", token);
      const platform = Platform.OS;
      // TODO: Send this token to your backend
      const response = await request("POST", "v1/notifications/device-token", {
        deviceToken: token,
        platform,
      });
      console.log("Backend response:", response);
      return token;
    } catch (error) {
      console.error("Error getting push token:", error);
      return false;
    }
  } else {
    console.log("Must use physical device for Push Notifications");
    return false;
  }
};

/**
 * Present an immediate notification (for real-time notifications from SignalR)
 * @param {Object} notification - Notification content
 */
export const presentNotification = async (notification) => {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        sound: notification.sound || "default",
        badge: notification.badge,
      },
      trigger: null, // null means immediate
    });
    console.log("Notification presented:", id);
    return id;
  } catch (error) {
    console.error("Error presenting notification:", error);
    throw error;
  }
};

/**
 * Schedule a local notification
 * @param {Object} notification - Notification content
 * @param {Object} trigger - Trigger configuration
 */
export const scheduleNotification = async (notification, trigger = null) => {
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
};

/**
 * Cancel a scheduled notification
 * @param {string} notificationId - The notification ID
 */
export const cancelNotification = async (notificationId) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error("Error canceling notification:", error);
    throw error;
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Error canceling all notifications:", error);
    throw error;
  }
};

export const setBadgeCount = async (count) => {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error("Error setting badge count:", error);
    throw error;
  }
};

export const getBadgeCount = async () => {
  try {
    return await Notifications.getBadgeCountAsync();
  } catch (error) {
    console.error("Error getting badge count:", error);
    return 0;
  }
};

export const addNotificationReceivedListener = (listener) => {
  return Notifications.addNotificationReceivedListener(listener);
};

/**
 * Add notification response listener (when user taps notification)
 * @param {Function} listener - Callback function
 * @returns {Subscription} Subscription object
 */
export const addNotificationResponseReceivedListener = (listener) => {
  return Notifications.addNotificationResponseReceivedListener(listener);
};

export const checkPermissions = async () => {
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
};

export const getNotificationSettings = async () => {
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
};

// Default export object for backward compatibility
const notificationService = {
  registerForPushNotifications,
  presentNotification,
  scheduleNotification,
  cancelNotification,
  cancelAllNotifications,
  setBadgeCount,
  getBadgeCount,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  checkPermissions,
  getNotificationSettings,
};

export default notificationService;
