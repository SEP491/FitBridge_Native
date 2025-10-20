import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as signalR from "@microsoft/signalr";

// Private state using closures
let connection = null;
let connectionCallbacks = new Map(); // eventName -> callback : Map<string, Set<function>>
let groups = [];
let reconnectAttempts = 0;
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

export const startConnection = async () => {
  try {
    const hubUrl = process.env.EXPO_PUBLIC_HUB_URL_NOTI;
    console.log("hubUrl", hubUrl);
    if (!hubUrl) {
      throw new Error("HUB_URL not found in environment variables");
    }

    const accessToken = await AsyncStorage.getItem("token");
    console.log("accessToken", accessToken);

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

    const serverTimeoutMs = parseInt(
      process.env.EXPO_PUBLIC_SIGNALR_SERVER_TIMEOUT_MS ?? "90000",
      10
    );
    const keepAliveMs = parseInt(
      process.env.EXPO_PUBLIC_SIGNALR_KEEPALIVE_MS ?? "10000",
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
    triggerCallback("onConnected");
    setupLifeCycleHandlers();
  } catch (error) {
    console.error("SignalR: Initial connection failed", error);
    triggerCallback("onInitialConnectionFailed", error);

    await handleReconnection();
  }
};

export const addToGroup = async (groupName) => {
  if (connection.state !== signalR.HubConnectionState.Connected) {
    console.warn("SignalR: Cannot join group - not connected");
    return false;
  }

  try {
    await connection.invoke("AddToGroup", groupName);
    console.log(`SignalR: Successfully joined group: ${groupName}`);
    if (!groups.includes(groupName)) {
      groups.push(groupName);
    }
    return true;
  } catch (error) {
    console.error(`SignalR: Failed to join group ${groupName}:`, error);
    return false;
  }
};

export const removeFromGroup = async (groupName) => {
  if (connection.state !== signalR.HubConnectionState.Connected) {
    console.warn("SignalR: Cannot leave group - not connected");
    return false;
  }

  try {
    await connection.invoke("RemoveFromGroup", groupName);
    console.log(`SignalR: Successfully left group: ${groupName}`);
    groups = groups.filter((group) => group !== groupName);
    return true;
  } catch (error) {
    console.error(`SignalR: Failed to leave group ${groupName}:`, error);
    return false;
  }
};

export const handleReconnection = async () => {
  if (reconnectAttempts >= maxReconnectAttempts) {
    console.log("SignalR: Max reconnection attempts reached");
    triggerCallback("onMaxReconnectAttemptsReached");
    return;
  }

  reconnectAttempts++;
  console.log(
    `SignalR: Reconnection attempt ${reconnectAttempts}/${maxReconnectAttempts}`
  );

  setTimeout(async () => {
    console.log("SignalR: Reconnection attempt", connection.state);
    if (connection.state !== signalR.HubConnectionState.Connected) {
      await startConnection();
    }
  }, reconnectDelay);
};

export const stopConnection = async () => {
  if (connection) {
    try {
      await connection.stop();
      removeLifeCycleHandlers();
      console.log("SignalR: Connection stopped");
    } catch (error) {
      console.error("SignalR: Error stopping connection", error);
    } finally {
      connectionCallbacks.clear();
    }
  }
};

export const pauseConnection = async () => {
  if (connection) {
    try {
      await connection.stop();
      console.log("SignalR: Connection paused");
    } catch (error) {
      console.error("SignalR: Error pausing connection", error);
    } finally {
      connectionCallbacks.clear();
    }
  }
};

export const onEvent = (eventName, callback) => {
  if (typeof eventName !== "string" || !eventName.trim()) {
    throw new Error("Event name must be a non-empty string");
  }
  if (typeof callback !== "function") {
    throw new Error("Callback must be a function");
  }

  if (!connectionCallbacks.has(eventName)) {
    connectionCallbacks.set(eventName, new Set());
  }
  connectionCallbacks.get(eventName).add(callback);
};

export const offEvent = (eventName, callback) => {
  if (typeof eventName !== "string" || !eventName.trim()) {
    throw new Error("Event name must be a non-empty string");
  }
  if (typeof callback !== "function") {
    throw new Error("Callback must be a function");
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

// trigger callback once and then remove it
export const once = (eventName, callback) => {
  const wrappedCallback = () => {
    try {
      callback();
    } catch (error) {
      console.error(`SignalR: Error in ${eventName} callback:`, error);
    } finally {
      // remove callback after it is triggered
      offEvent(eventName, wrappedCallback);
    }
  };
  onEvent(eventName, wrappedCallback);
};

export const triggerCallback = (eventName, data = null) => {
  console.log("SignalR: Triggering callback", eventName, data);
  if (connectionCallbacks.has(eventName)) {
    connectionCallbacks.get(eventName).forEach((callback) => {
      try {
        if (!callback) return;
        callback(data);
      } catch (error) {
        console.error(`SignalR: Error in ${eventName} callback:`, error);
      }
    });
  }
};

const setupLifeCycleHandlers = () => {
  console.log("SignalR: Setting up life cycle handlers");
  connection.onclose = async (error) => {
    console.log("SignalR: Connection closed", error);
    triggerCallback("onDisconnected", error);

    // Attempt reconnection if not manually closed
    if (error) {
      await handleReconnection();
    }
  };

  connection.onreconnecting = (error) => {
    console.log("SignalR: Reconnecting...", error);
    triggerCallback("onReconnecting", error);
  };

  connection.onreconnected = (connectionId) => {
    reconnectAttempts = 0;
    console.log("SignalR: Reconnected", connectionId);
    // rejoin groups since signalr loses them on reconnect
    groups.forEach((group) => {
      addToGroup(group);
    });
    triggerCallback("onReconnected", connectionId);
  };
};

const removeLifeCycleHandlers = () => {
  connection.onclose = null;
  connection.onreconnecting = null;
  connection.onreconnected = null;
};

export const invokeHubMethod = (methodName, ...args) => {
  console.log("InvokeHubMethod", methodName, args);
  if (!connection) {
    return Promise.reject(new Error("Hub connection is not initialized."));
  }

  if (connection.state !== signalR.HubConnectionState.Connected) {
    return Promise.reject(
      new Error(
        `Hub connection is not connected. Current state: ${connection.state}`
      )
    );
  }

  return connection.invoke(methodName, ...args);
};

export const sendHubMethod = (methodName, ...args) => {
  console.log("SendHubMethod", methodName, args);
  if (!connection) {
    return Promise.reject(new Error("Hub connection is not initialized."));
  }

  if (connection.state !== signalR.HubConnectionState.Connected) {
    return Promise.reject(
      new Error(
        `Hub connection is not connected. Current state: ${connection.state}`
      )
    );
  }

  return connection.send(methodName, ...args);
};

export const getBoundTriggerCallback = () => {
  return triggerCallback;
};

// Default export object for backward compatibility
const signalrService = {
  get connection() {
    return connection;
  },
  get connectionStatus() {
    return getConnectionStatus();
  },
  startConnection,
  addToGroup,
  removeFromGroup,
  handleReconnection,
  stopConnection,
  onEvent,
  offEvent,
  once,
  triggerCallback,
  invokeHubMethod,
  sendHubMethod,
  pauseConnection,
  get boundTriggerCallback() {
    return triggerCallback;
  },
};

export default signalrService;
