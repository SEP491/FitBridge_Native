import { HubConnectionBuilder } from "@microsoft/signalr";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as signalR from "@microsoft/signalr";
import {
  registerMessagingHandlers,
  unregisterMessagingHandlers,
} from "./registerMessagingHandlers";
import { HUB_METHODS } from "./hubMethods";

// Private state using closures
let connection = null;
let connectionCallbacks = new Map(); // eventName -> callback : Map<string, Set<function>>
let groups = [];
let reconnectAttempts = 0;
let hasConnectedSuccessfully = false;
let handlersRegistered = false;
let handlersUnregisterFn = null;

const maxReconnectAttempts = 5;
const reconnectDelay = 5000; // 5 seconds

// Public getters
export const getConnection = () => connection;

export const getConnectionStatus = () => {
  const state = connection?.state ?? signalR.HubConnectionState.Disconnected;
  return {
    state, // Connected | Connecting | Reconnecting | Disconnected
    connectionId: connection?.connectionId ?? null,
  };
};

export const areHandlersRegistered = () => handlersRegistered;

/**
 * Start SignalR connection for messaging
 */
export const startConnection = async () => {
  try {
    // Get messaging hub URL from environment
    const hubUrl = process.env.EXPO_PUBLIC_API_CHAT_MESSAGE_URL;
    console.log("SignalR Messaging: Hub URL", hubUrl);

    if (!hubUrl) {
      throw new Error(
        "EXPO_PUBLIC_API_CHAT_MESSAGE_URL not found in environment variables"
      );
    }

    // Check if already connected
    if (connection?.state === signalR.HubConnectionState.Connected) {
      console.warn("SignalR Messaging: Connection already established");
      return;
    }

    // const accessToken = await AsyncStorage.getItem("token");
    const accessToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiIxMjZlYzNkNC00ZDM0LTQ1ZjItYmJmNy05OGI5YTNkZmMzMWMiLCJ1bmlxdWVfbmFtZSI6ImpvaG4iLCJyb2xlIjoiQ3VzdG9tZXIiLCJBdmF0YXJVcmwiOiJodHRwczovL3N0YXRpYy53aWtpYS5ub2Nvb2tpZS5uZXQvZ29rdXJha3VnYWkvaW1hZ2VzLzAvMGEvVGFvX1Nhb3RvbWVfUG9ydHJhaXQucG5nL3JldmlzaW9uL2xhdGVzdD9jYj0yMDI0MDYwODAzMTE0MCIsIm5iZiI6MTc2MjkzMDYzOCwiZXhwIjoxNzYyOTM0MjM4LCJpYXQiOjE3NjI5MzA2Mzh9.MaF4P1gz2A8yISRqNlC58YucuBPcpwJ4Epl4kuvqFS0";
    console.log("SignalR Messaging: Access token retrieved");

    // Build connection with authentication
    connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => accessToken,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount === 0) {
            return 0;
          }
          return Math.min(
            1000 * Math.pow(2, retryContext.previousRetryCount),
            30000
          );
        },
      })
      .build();

    // Configure timeouts
    const serverTimeoutMs = parseInt(
      process.env.EXPO_PUBLIC_SIGNALR_SERVER_TIMEOUT_MS ?? "90000",
      10
    );
    const keepAliveMs = parseInt(
      process.env.EXPO_PUBLIC_SIGNALR_KEEPALIVE_MS ?? "30000",
      10
    );

    connection.serverTimeoutInMilliseconds = serverTimeoutMs;
    connection.keepAliveIntervalInMilliseconds = keepAliveMs;

    // Start connection with 15 second timeout
    await Promise.race([
      connection.start(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Connection timeout after 15 seconds")),
          15000
        )
      ),
    ]);

    // Mark that we've successfully connected at least once
    hasConnectedSuccessfully = true;
    reconnectAttempts = 0; // Reset counter on successful connection

    console.log("SignalR Messaging: Connection established successfully");
    triggerCallback("onConnected");
    setupLifeCycleHandlers();

    // Register messaging handlers
    if (!handlersRegistered) {
      const { unregister } = registerMessagingHandlers(
        connection,
        triggerCallback
      );
      handlersUnregisterFn = unregister;
      handlersRegistered = true;
    }
  } catch (error) {
    console.error("SignalR Messaging: Initial connection failed", error);
    triggerCallback("onInitialConnectionFailed", error);

    // Only use custom reconnection for INITIAL connection failures
    if (!hasConnectedSuccessfully) {
      await handleReconnection();
    }
  }
};

/**
 * Add to a conversation group
 */
export const addToGroup = async (groupName) => {
  if (connection?.state !== signalR.HubConnectionState.Connected) {
    console.warn("SignalR Messaging: Cannot join group - not connected");
    return false;
  }

  try {
    await connection.invoke("AddToGroup", groupName);
    console.log(`SignalR Messaging: Successfully joined group: ${groupName}`);
    if (!groups.includes(groupName)) {
      groups.push(groupName);
    }
    return true;
  } catch (error) {
    console.error(
      `SignalR Messaging: Failed to join group ${groupName}:`,
      error
    );
    return false;
  }
};

/**
 * Remove from a conversation group
 */
export const removeFromGroup = async (groupName) => {
  if (connection?.state !== signalR.HubConnectionState.Connected) {
    console.warn("SignalR Messaging: Cannot leave group - not connected");
    return false;
  }

  try {
    await connection.invoke("RemoveFromGroup", groupName);
    console.log(`SignalR Messaging: Successfully left group: ${groupName}`);
    groups = groups.filter((group) => group !== groupName);
    return true;
  } catch (error) {
    console.error(
      `SignalR Messaging: Failed to leave group ${groupName}:`,
      error
    );
    return false;
  }
};

/**
 * Handle reconnection logic
 */
export const handleReconnection = async () => {
  if (reconnectAttempts >= maxReconnectAttempts) {
    console.log("SignalR Messaging: Max reconnection attempts reached");
    triggerCallback("onMaxReconnectAttemptsReached");
    return;
  }

  reconnectAttempts++;
  console.log(
    `SignalR Messaging: Reconnection attempt ${reconnectAttempts}/${maxReconnectAttempts}`
  );

  setTimeout(async () => {
    console.log(
      "SignalR Messaging: Attempting reconnection...",
      connection?.state
    );

    // Only reconnect if not already connected or connecting
    if (
      !connection ||
      (connection.state !== signalR.HubConnectionState.Connected &&
        connection.state !== signalR.HubConnectionState.Connecting)
    ) {
      await startConnection();
    } else {
      console.log(
        "SignalR Messaging: Skipping reconnection - already connected or connecting"
      );
    }
  }, reconnectDelay);
};

/**
 * Stop the SignalR connection and clear all callbacks
 */
export const stopConnection = async () => {
  if (connection) {
    try {
      await connection.stop();
      removeLifeCycleHandlers();

      // Unregister messaging handlers
      if (handlersRegistered && handlersUnregisterFn) {
        handlersUnregisterFn();
        handlersRegistered = false;
        handlersUnregisterFn = null;
      }

      console.log("SignalR Messaging: Connection stopped");
    } catch (error) {
      console.error("SignalR Messaging: Error stopping connection", error);
    } finally {
      connectionCallbacks.clear();
      groups = [];
      connection = null;
    }
  }
};

/**
 * Pause the connection (for app backgrounding)
 */
export const pauseConnection = async () => {
  if (connection) {
    try {
      await connection.stop();
      console.log("SignalR Messaging: Connection paused");
    } catch (error) {
      console.error("SignalR Messaging: Error pausing connection", error);
      throw error;
    }
  }
};

/**
 * Resume the connection (for app foregrounding)
 */
export const resumeConnection = async () => {
  if (connection) {
    try {
      await connection.start();
      triggerCallback("onReconnecting");
      console.log("SignalR Messaging: Connection resumed");
    } catch (error) {
      console.error("SignalR Messaging: Error resuming connection", error);
      throw error;
    }
  }
};

/**
 * Register an event listener
 */
export const onEvent = (eventName, callback) => {
  if (typeof eventName !== "string" || !eventName.trim()) {
    throw new TypeError("Event name must be a non-empty string");
  }
  if (typeof callback !== "function") {
    throw new TypeError("Callback must be a function");
  }

  if (!connectionCallbacks.has(eventName)) {
    connectionCallbacks.set(eventName, new Set());
  }
  connectionCallbacks.get(eventName).add(callback);
  console.log(
    `SignalR Messaging: Event '${eventName}' now has ${
      connectionCallbacks.get(eventName).size
    } callback(s)`
  );
};

/**
 * Unregister an event listener
 */
export const offEvent = (eventName, callback) => {
  if (typeof eventName !== "string" || !eventName.trim()) {
    throw new TypeError("Event name must be a non-empty string");
  }
  if (typeof callback !== "function") {
    throw new TypeError("Callback must be a function");
  }

  if (connectionCallbacks.has(eventName)) {
    const callbacksSet = connectionCallbacks.get(eventName);
    if (callbacksSet) {
      callbacksSet.delete(callback);
      if (callbacksSet.size === 0) {
        connectionCallbacks.delete(eventName);
      }
    }
  }
};

/**
 * Register callback that triggers once and then removes itself
 */
export const once = (eventName, callback) => {
  if (typeof eventName !== "string" || !eventName.trim()) {
    throw new TypeError("Event name must be a non-empty string");
  }
  if (typeof callback !== "function") {
    throw new TypeError("Callback must be a function");
  }

  const wrappedCallback = (data) => {
    try {
      callback(data);
    } catch (error) {
      console.error(
        `SignalR Messaging: Error in ${eventName} callback:`,
        error
      );
    } finally {
      // remove callback after it is triggered
      offEvent(eventName, wrappedCallback);
    }
  };
  onEvent(eventName, wrappedCallback);
};

/**
 * Trigger all callbacks for a given event
 */
export const triggerCallback = (eventName, data = null) => {
  console.log("SignalR Messaging: Triggering callback", eventName, data);
  if (connectionCallbacks.has(eventName)) {
    connectionCallbacks.get(eventName).forEach((callback) => {
      try {
        if (!callback) return;
        callback(data);
      } catch (error) {
        console.error(
          `SignalR Messaging: Error in ${eventName} callback:`,
          error
        );
      }
    });
  }
};

/**
 * Setup lifecycle handlers for connection events
 */
const setupLifeCycleHandlers = () => {
  console.log("SignalR Messaging: Setting up lifecycle handlers");

  connection.onclose = async (error) => {
    console.log("SignalR Messaging: Connection closed", error);
    triggerCallback("onDisconnected", error);
  };

  connection.onreconnecting = (error) => {
    console.log("SignalR Messaging: Reconnecting...", error);
    triggerCallback("onReconnecting", error);
  };

  connection.onreconnected = async (connectionId) => {
    reconnectAttempts = 0;
    console.log("SignalR Messaging: Reconnected", connectionId);

    // Rejoin groups since SignalR loses them on reconnect
    for (const group of groups) {
      await addToGroup(group);
    }

    triggerCallback("onReconnected", connectionId);
  };
};

/**
 * Remove lifecycle handlers
 */
const removeLifeCycleHandlers = () => {
  if (connection) {
    connection.onclose = null;
    connection.onreconnecting = null;
    connection.onreconnected = null;
  }
};

/**
 * Invoke a hub method and wait for result
 */
export const invokeHubMethod = async (methodName, ...args) => {
  console.log("SignalR Messaging: InvokeHubMethod", methodName, args);

  if (!connection) {
    throw new Error("Hub connection is not initialized.");
  }

  if (connection.state !== signalR.HubConnectionState.Connected) {
    throw new Error(
      `Hub connection is not connected. Current state: ${connection.state}`
    );
  }

  try {
    return await connection.invoke(methodName, ...args);
  } catch (error) {
    console.error(
      "SignalR Messaging: Error invoking hub method",
      methodName,
      args,
      error
    );
    throw error;
  }
};

/**
 * Send a hub method without waiting for result
 */
export const sendHubMethod = async (methodName, ...args) => {
  console.log("SignalR Messaging: SendHubMethod", methodName, args);

  if (!connection) {
    throw new Error("Hub connection is not initialized.");
  }

  if (connection.state !== signalR.HubConnectionState.Connected) {
    throw new Error(
      `Hub connection is not connected. Current state: ${connection.state}`
    );
  }

  try {
    return await connection.send(methodName, ...args);
  } catch (error) {
    console.error(
      "SignalR Messaging: Error sending hub method",
      methodName,
      args,
      error
    );
    throw error;
  }
};

/**
 * Get bound trigger callback function
 */
export const getBoundTriggerCallback = () => {
  return triggerCallback;
};

// === Messaging-specific helper methods ===

/**
 * Send typing indicator
 */
export const sendTypingIndicator = async (conversationId, isTyping) => {
  try {
    await invokeHubMethod(HUB_METHODS.USER_TYPING, conversationId, isTyping);
    console.log(
      `SignalR Messaging: Typing indicator sent - ${
        isTyping ? "typing" : "stopped"
      }`
    );
    return true;
  } catch (error) {
    console.error("SignalR Messaging: Failed to send typing indicator", error);
    return false;
  }
};

/**
 * Join a conversation group
 */
export const joinConversation = async (conversationId) => {
  return await addToGroup(`conversation_${conversationId}`);
};

/**
 * Leave a conversation group
 */
export const leaveConversation = async (conversationId) => {
  return await removeFromGroup(`conversation_${conversationId}`);
};

/**
 * Confirm handshake with server
 */
export const confirmHandshake = async () => {
  try {
    await invokeHubMethod(HUB_METHODS.CONFIRM_HANDSHAKE);
    console.log("SignalR Messaging: Handshake confirmed");
    return true;
  } catch (error) {
    console.error("SignalR Messaging: Failed to confirm handshake", error);
    return false;
  }
};

// Default export object for backward compatibility
const signalrMessagingService = {
  get connection() {
    return connection;
  },
  get connectionStatus() {
    return getConnectionStatus();
  },
  get boundTriggerCallback() {
    return triggerCallback;
  },
  areHandlersRegistered,
  startConnection,
  stopConnection,
  pauseConnection,
  resumeConnection,
  addToGroup,
  removeFromGroup,
  handleReconnection,
  onEvent,
  offEvent,
  once,
  triggerCallback,
  invokeHubMethod,
  sendHubMethod,
  // Messaging-specific methods
  sendTypingIndicator,
  joinConversation,
  leaveConversation,
  confirmHandshake,
};

export default signalrMessagingService;
