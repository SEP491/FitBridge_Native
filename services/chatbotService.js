import { requestChatBot } from "./requestChatBot";

const chatbotService = {
  // `params` is used for query parameters such as `thread_id`
  sendMessage: (data, params = {}) =>
    requestChatBot("POST", "invoke", data, {}, params),
};

export default chatbotService;
