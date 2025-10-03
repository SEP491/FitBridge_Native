import { request } from "./request";

const accountService = {
  getProfile: () => request("GET", "v1/accounts/profile"),
  updateProfileUser: (data) => request("PUT", "v1/user", data),
  uploadAvatar: (formData) =>
    request("POST", "v1/account/avatar", formData, {
      "Content-Type": "multipart/form-data",
    }),

  getCourseForUser: () =>
    request("GET", "v1/customer-purchased/customer-schedule"),
  getPTSlotforUser: (params) =>
    request("GET", `v1/bookings/get-gym-slot-for-booking`, null, {}, params),
  bookingSlot: (data) =>
    request("POST", "v1/gym-slots/customer-register-slot", data),
  getBookingForUser: (params) =>
    request("GET", "v1/bookings/get-customer-bookings", null, {}, params),
};

export default accountService;
