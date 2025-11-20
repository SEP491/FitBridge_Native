import { request } from "./request";
import { requestMessage } from "./requestMessage";

const messageService = {
  getConversations: (params) =>
    requestMessage("GET", "/conversations", null, {}, params),

  getMessages: (convoId, params) =>
    requestMessage(
      "GET",
      `/conversations/${convoId}/messages`,
      null,
      {},
      params
    ),

  getMessagesRange: (convoId, params) =>
    requestMessage(
      "GET",
      `/conversations/${convoId}/messages/range`,
      null,
      {},
      params
    ),

  sendMessage: (data) => requestMessage("POST", `/messages`, data),
  reactMessage: (data) => requestMessage("POST", `/messages/react`, data),
  deleteMessage: (messageId) =>
    requestMessage("DELETE", `/messages/${messageId}`),

  updateMessage: (data) =>
    requestMessage("PUT", `/messages/${data.messageId}`, {
      conversationId: data.conversationId,
      newContent: data.newContent,
    }),
  createConversation: (data) => requestMessage("POST", `/conversations`, data),
  updateBookingRequest: (data) =>
    request("POST", `v1/bookings/request-edit-booking`, data, {
      "Content-Type": "application/json",
    }),
  approveBookingRequest: (requestId) =>
    request(
      "POST",
      `v1/bookings/accept-booking-request`,
      { bookingRequestId: requestId },
      {
        "Content-Type": "application/json",
      }
    ),
  rejectBookingRequest: (requestId) =>
    request(
      "POST",
      `v1/bookings/reject-booking-request`,
      { bookingRequestId: requestId },
      {
        "Content-Type": "application/json",
      }
    ),

  markAsRead: (data) => requestMessage("POST", `/messages/read`, data),

  getUsersConversations: (params) =>
    requestMessage("GET", `/users`, null, {}, params),
  getConversationWithUserId: (userId) =>
    requestMessage("GET", `/conversation/${userId}`),

  uploadImage: (data) => requestMessage("POST", `/upload`, data),
  checkCustomerPurchased: (params) =>
    request("GET", `v1/customer-purchased/check`, null, {}, params),
};

export default messageService;
