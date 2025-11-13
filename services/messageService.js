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

  sendMessage: (data) => requestMessage("POST", `/messages/send`, data),

  deleteMessage: (messageId) =>
    requestMessage("PUT", `/messages/${messageId}/delete`),

  updateMessage: (data) => requestMessage("PUT", `/messages`, data),
  createConversation: (data) => requestMessage("POST", `/conversations`, data),
  createBookingRequest: (data) =>
    requestMessage("POST", `/booking-request`, data),
  updateBookingRequest: (data) =>
    requestMessage("PUT", `/booking-request`, data),
  approveBookingRequest: (requestId) =>
    requestMessage("PUT", `/booking-request/approve`, requestId),
  rejectBookingRequest: (requestId) =>
    requestMessage("PUT", `/booking-request/reject`, requestId),

  markAsRead: (data) => requestMessage("POST", `/messages/read`, data),

  getUsersConversations: (params) =>
    requestMessage("GET", `/users`, null, {}, params),
  getConversationWithUserId: (userId) =>
    requestMessage("GET", `/conversation/${userId}`),

  uploadImage: (data) => requestMessage("POST", `/upload`, data),
};

export default messageService;
