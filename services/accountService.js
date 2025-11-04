import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { request } from "./request";

const accountService = {
  getProfile: () => request("GET", "v1/accounts/profile"),
  updateProfileUser: (data) =>
    request("PUT", "v1/accounts/update-profile", data),
  uploadAvatar: (formData) =>
    request("PUT", "v1/accounts/update-avatar", formData, {
      "Content-Type": "multipart/form-data",
    }),
  changePassword: (data) =>
    request("PUT", "v1/identities/update-password", data),
  getCourseForUser: () =>
    request("GET", "v1/customer-purchased/customer-schedule"),
  getPTSlotforUser: (params) =>
    request("GET", `v1/bookings/get-gym-slot-for-booking`, null, {}, params),
  bookingSlot: (data) =>
    request("POST", "v1/gym-slots/customer-register-slot", data),
  cancelBooking: (data) => request("POST", "v1/bookings/cancel-booking", data),
  getBookingForUser: (params) =>
    request("GET", "v1/bookings/get-customer-bookings", null, {}, params),

  getAllFreelancePT: (params) =>
    request("GET", "v1/accounts/freelance-pts", null, {}, params),
  getFreelancePTDetail: (ptId) =>
    request("GET", `v1/accounts/freelance-pt/${ptId}`),
  getFreelancePTCustomers: (params) =>
    request("GET", "v1/accounts/freelance-pt/customers", null, {}, params),

  getBookingForPT: (params) =>
    request("GET", "v1/bookings/freelance-pt-schedule", null, {}, params),
  getBookingForGymPT: (params) =>
    request("GET", "v1/bookings/gym-pt-schedule", null, {}, params),
  getAllRequestForUser: (params) =>
    request("GET", "v1/bookings/booking-request", null, {}, params),
  createBookingRequest: (data) =>
    request("POST", "v1/bookings/request-booking", data),

  acceptBookingRequest: (data) =>
    request("POST", "v1/bookings/accept-booking-request", data),
  rejectBookingRequest: (data) =>
    request("POST", "v1/bookings/reject-booking-request", data),
  requestEditBooking: (data) =>
    request("POST", "v1/bookings/request-edit-booking", data),
  acceptEditBooking: (data) =>
    request("POST", "v1/bookings/accept-edit-booking", data),

  getCustomerPurchasedFreelancePT: () =>
    request("GET", "v1/customer-purchased/freelance-pt"),

  getKeywords: (params) =>
    request("GET", "v1/accounts/hot-research", null, {}, params),

  searchAllAccounts: (params) =>
    request("GET", "v1/accounts/search", null, {}, params),
};

export default accountService;
