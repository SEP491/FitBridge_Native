import { request } from "./request";

const bookingService = {
  getBookingDetail: (bookingId) =>
    request("GET", `v1/session-activities/practice-content/${bookingId}`),

  createSessionActivities: (data) =>
    request("POST", `v1/session-activities`, data),

  getSessionActivityDetail: (activityId) =>
    request("GET", `v1/session-activities/${activityId}`),
};

export default bookingService;
