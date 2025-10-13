import { request } from "./request";

const notificationService = {
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
