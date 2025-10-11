import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { request } from "./request";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

// Configure notification handler
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: true,
//     shouldShowBanner: true,
//   }),
// });

export const addNotificationReceivedListener = (listener) => {
  return Notifications.addNotificationReceivedListener(listener);
};

export const addNotificationResponseReceivedListener = (listener) => {
  return Notifications.addNotificationResponseReceivedListener(listener);
};

// Default export object for backward compatibility
const notificationService = {
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,

  getNotifications: () => request("GET", "v1/notifications"),
  markAsRead: (id) => request("PUT", `v1/notifications/${id}/read`),
  markAllAsRead: () => request("PUT", "v1/notifications/read-all"),
  deleteNotification: (id) => request("DELETE", `v1/notifications/${id}`),
  deleteAllNotifications: () =>
    request("DELETE", "v1/notifications/delete-all"),
  registerDeviceToken: (data) =>
    request("POST", "v1/notifications/device-token", data),
};

export default notificationService;
