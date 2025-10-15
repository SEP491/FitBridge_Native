import { request } from "./request";

const bookingService = {
  getBookingDetail: (bookingId) =>
    request("GET", `v1/session-activities/practice-content/${bookingId}`),

  createSessionActivities: (data) =>
    request("POST", `v1/session-activities`, data),

  getSessionActivityDetail: (activityId) =>
    request("GET", `v1/session-activities/${activityId}`),

  addActivitySet: (data) => request("POST", `v1/activity-sets`, data),
  getSetsOfActivity: (activityId) =>
    request("GET", `v1/activity-sets/session-activity/${activityId}`),

  updateActivitySet: (data) =>
    request("PUT", `v1/activity-sets/activity-progress`, data),
};

export default bookingService;
