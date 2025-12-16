import { request } from "./request";

const bookingService = {
  getBookingDetail: (bookingId) =>
    request("GET", `v1/session-activities/practice-content/${bookingId}`),

  // Get asset metadata used when creating session activities
  // Accepts optional query params: assetType, muscleGroup, doApplyPaging, page, size, etc.
  getActivityMetadata: (params) =>
    request("GET", `v1/gym-assets/session-activity`, null, {}, params),

  createSessionActivities: (data) =>
    request("POST", `v1/session-activities`, data),

  getSessionActivityDetail: (activityId) =>
    request("GET", `v1/session-activities/${activityId}`),

  addActivitySet: (data) => request("POST", `v1/activity-sets`, data),
  getSetsOfActivity: (activityId) =>
    request("GET", `v1/activity-sets/session-activity/${activityId}`),

  updateActivitySet: (data) =>
    request("PUT", `v1/activity-sets/activity-progress`, data),

  getBookingResult: (bookingId) =>
    request("GET", `v1/bookings/result/${bookingId}`),

  updateActivitySetPlan: (data) => request("PUT", `v1/activity-sets`, data),
  deleteActivitySet: (activitySetId) =>
    request("DELETE", `v1/activity-sets/${activitySetId}`),
  updateSessionActivity: (data) =>
    request("PUT", `v1/session-activities`, data),

  deleteSessionActivity: (sessionActivityId) =>
    request("DELETE", `v1/session-activities/${sessionActivityId}`),

  startSession: (data) =>
    request("POST", `v1/bookings/start-booking-session`, data),
  endSession: (data) =>
    request("POST", `v1/bookings/end-booking-session`, data),
  getBookingHistoryForPT: (params) =>
    request("GET", `v1/bookings/history`, params),
};

export default bookingService;
