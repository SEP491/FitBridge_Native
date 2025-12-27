import { requestChatBot } from "./requestChatBot";
import EventSource from "@jeongshin/react-native-sse";

const chatbotService = {
  // `params` is used for query parameters such as `thread_id`
  sendMessage: (data, params = {}) =>
    requestChatBot("POST", "invoke", data, {}, params),

  /**
   * Stream messages from the /stream endpoint using Server-Sent Events (SSE)
   * Uses @jeongshin/react-native-sse EventSource for React Native compatibility
   * @param {string} message - The user's message
   * @param {string} threadId - Unique thread ID for conversation persistence
   * @param {Function} onToken - Callback for each token received
   * @param {Function} onEvent - Callback for other events (node_end, tool_start, tool_end, done, error)
   * @param {Object} coords - Optional coordinates object with latitude and longitude
   * @returns {Promise<void>}
   */
  streamMessage: async (message, threadId, onToken, onEvent, coords = null) => {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_CHATBOT_URL;

    return new Promise((resolve, reject) => {
      // Build query parameters
      const params = new URLSearchParams({
        thread_id: threadId,
        message: message,
        format: "json", // Request JSON format for tokens
      });

      // Add coordinates if provided
      if (
        coords &&
        coords.latitude !== undefined &&
        coords.longitude !== undefined
      ) {
        params.append("latitude", coords.latitude.toString());
        params.append("longitude", coords.longitude.toString());
      }

      const url = `${API_BASE_URL}/stream?${params.toString()}`;

      const eventSource = new EventSource(url, {
        headers: {
          Accept: "text/event-stream",
        },
      });

      // Helper function to parse event data
      // According to spec, tokens are streamed directly as strings
      // Empty strings are valid tokens (spaces, etc.)
      const parseEventData = (data) => {
        // Handle null/undefined
        if (data === null || data === undefined) return null;

        // Empty string is a valid token, don't treat as null
        if (data === "") return "";

        try {
          // Try to parse as JSON (for structured events like done/error)
          return JSON.parse(data);
        } catch (e) {
          // If not JSON, return as-is (token strings)
          return data;
        }
      };

      // Helper function to extract token from event data
      // Supports both JSON format: {"token": "text"} and raw string format: "text"
      const extractToken = (data) => {
        if (data === null || data === undefined) return null;
        if (data === "") return "";

        // Try to parse as JSON first (for JSON token format)
        try {
          const parsed = JSON.parse(data);
          // If parsed successfully, extract token from common JSON structures
          if (typeof parsed === "object") {
            return (
              parsed.token || parsed.content || parsed.text || parsed.data || ""
            );
          }
          // If parsed to a string, use it directly
          if (typeof parsed === "string") {
            return parsed;
          }
        } catch (e) {
          // Not JSON, continue to handle as raw string
        }

        // Handle URL-encoded strings if needed (server sends %20 for spaces)
        if (typeof data === "string") {
          try {
            return decodeURIComponent(data);
          } catch (e) {
            // If decoding fails, use original data
            return data;
          }
        }

        // Fallback: return as-is
        return data;
      };

      // Handle token events
      eventSource.addEventListener("token", (event) => {
        const rawData = event.data;
        const token = extractToken(rawData);

        // Handle token events - supports both JSON and raw string formats
        if (token !== null && token !== undefined && onToken) {
          onToken(token, rawData);
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
        const rawData = event.data;
        const token = extractToken(rawData);

        // Handle message events - supports both JSON and raw string formats
        if (token !== null && token !== undefined && onToken) {
          onToken(token, rawData);
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
