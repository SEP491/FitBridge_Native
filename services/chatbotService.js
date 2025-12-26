import { requestChatBot } from "./requestChatBot";
import EventSource from "react-native-sse";

const chatbotService = {
  // `params` is used for query parameters such as `thread_id`
  sendMessage: (data, params = {}) =>
    requestChatBot("POST", "invoke", data, {}, params),

  /**
   * Stream messages from the /stream endpoint using Server-Sent Events (SSE)
   * Uses react-native-sse EventSource for React Native compatibility
   * @param {string} message - The user's message
   * @param {string} threadId - Unique thread ID for conversation persistence
   * @param {Function} onToken - Callback for each token received
   * @param {Function} onEvent - Callback for other events (node_end, tool_start, tool_end, done, error)
   * @returns {Promise<void>}
   */
  streamMessage: async (message, threadId, onToken, onEvent) => {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_CHATBOT_URL;

    return new Promise((resolve, reject) => {
      // Build query parameters
      const params = new URLSearchParams({
        thread_id: threadId,
        message: message,
      });

      const url = `${API_BASE_URL}/stream?${params.toString()}`;

      const eventSource = new EventSource(url, {
        headers: {
          Accept: "text/event-stream",
        },
      });

      // Helper function to parse event data
      const parseEventData = (data) => {
        if (!data) return null;

        try {
          // Try to parse as JSON
          return JSON.parse(data);
        } catch (e) {
          // If not JSON, return as raw string (don't trim - preserve spaces)
          return data;
        }
      };

      // Helper function to extract token from event data
      const extractToken = (eventData) => {
        if (typeof eventData === "string") {
          return eventData;
        }
        return eventData?.token || eventData?.content || "";
      };

      // Handle token events
      eventSource.addEventListener("token", (event) => {
        const eventData = parseEventData(event.data);
        if (eventData && onToken) {
          const token = extractToken(eventData);
          if (token) {
            onToken(token, eventData);
          }
        }
      });

      // Handle other event types
      const eventTypes = [
        "node_end",
        "tool_start",
        "tool_end",
        "done",
        "error",
      ];
      eventTypes.forEach((eventType) => {
        eventSource.addEventListener(eventType, (event) => {
          const eventData = parseEventData(event.data);
          if (onEvent) {
            onEvent(eventType, eventData || {});
          }

          // Handle done and error events to resolve/reject the promise
          if (eventType === "done") {
            eventSource.close();
            resolve();
          } else if (eventType === "error") {
            eventSource.close();
            const error = new Error(
              eventData?.error || "Streaming error occurred"
            );
            reject(error);
          }
        });
      });

      // Handle default message event (when no event type is specified, defaults to "message")
      eventSource.addEventListener("message", (event) => {
        const eventData = parseEventData(event.data);
        if (eventData && onToken) {
          const token = extractToken(eventData);
          if (token) {
            onToken(token, eventData);
          }
        }
      });

      // Handle connection opened
      eventSource.onopen = () => {
        console.log("SSE connection opened");
      };

      // Handle connection errors
      eventSource.onerror = (error) => {
        console.error("SSE connection error:", error);
        eventSource.close();
        if (onEvent) {
          onEvent("error", { error: error.message || "Connection error" });
        }
        reject(error);
      };
    });
  },
};

export default chatbotService;
