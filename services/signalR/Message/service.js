import { HubConnectionBuilder } from "@microsoft/signalr";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as signalR from "@microsoft/signalr";

class SignalRService {
  #connection = null;
  #connectionCallbacks = new Map(); // eventName -> callback : Map<string, Set<function>>
  #groups = [];
  #reconnectAttempts = 0;
  #maxReconnectAttempts = 5;
  #reconnectDelay = 5000; // 5 seconds
  #url = null;
  #hubName = null;
  #isDisposed = false;
  #areHandlersRegistered = false;
  #hasConnectedSuccessfully = false;

  constructor(url, hubName) {
    if (!url) {
      console.warn("SignalR: connection URL is required");
      return;
    }

    if (!hubName) {
      console.warn("SignalR: hub name is required");
      return;
    }

    this.#url = url;
    this.#hubName = hubName;
    this.#isDisposed = false;
  }

  // === Public getters,setters ===
  get areHandlersRegistered() {
    console.log("SignalR: areHandlersRegistered getter called");
    return this.#areHandlersRegistered;
  }
  set areHandlersRegistered(value) {
    console.log("SignalR: areHandlersRegistered setter called");
    this.#areHandlersRegistered = value;
  }
  get connection() {
    console.log("SignalR: connection getter called");
    this.#checkDisposed();
    return this.#connection;
  }
  get connectionStatus() {
    console.log("SignalR: connectionStatus getter called");
    this.#checkDisposed();
    const state =
      this.#connection?.state ?? signalR.HubConnectionState.Disconnected;
    return {
      state, // Connected | Connecting | Reconnecting | Disconnected
      connectionId: this.#connection?.connectionId ?? null,
    };
  }
  get url() {
    console.log("SignalR: url getter called");
    this.#checkDisposed();
    return this.#url;
  }

  get hubName() {
    console.log("SignalR: hubName getter called");
    this.#checkDisposed();
    return this.#hubName;
  }

  get isDisposed() {
    console.log("SignalR: isDisposed getter called");
    return this.#isDisposed;
  }

  // === Methods ===
  async startConnection() {
    console.log("SignalR: startConnection() called");
    this.#checkDisposed();

    if (this.#checkConnectionConnected("startConnection")) {
      console.warn("SignalR: Connection already established");
      return;
    }

    try {
      const accessToken = await AsyncStorage.getItem("accessToken");
      console.log("accessToken", accessToken);

      // Build connection with authentication
      this.#connection = new HubConnectionBuilder()
        .withUrl(this.#url, {
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

      const serverTimeoutMs = Number.parseInt(
        process.env.EXPO_PUBLIC_SIGNALR_SERVER_TIMEOUT_MS ?? "90000",
        10
      );
      const keepAliveMs = Number.parseInt(
        process.env.EXPO_PUBLIC_SIGNALR_KEEPALIVE_MS ?? "30000",
        10
      );

      this.#connection.serverTimeoutInMilliseconds = serverTimeoutMs;
      this.#connection.keepAliveIntervalInMilliseconds = keepAliveMs;
      // Start connection with 15 second timeout
      await Promise.race([
        this.#connection.start(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Connection timeout after 15 seconds")),
            15000
          )
        ),
      ]);

      // Mark that we've successfully connected at least once
      this.#hasConnectedSuccessfully = true;
      this.#reconnectAttempts = 0; // Reset counter on successful connection

      this.triggerCallback("onConnected");
      this.#setupLifeCycleHandlers();
    } catch (error) {
      console.error("SignalR: Initial connection failed", error);
      this.triggerCallback("onInitialConnectionFailed", error);

      // Only use custom reconnection for INITIAL connection failures
      if (!this.#hasConnectedSuccessfully) {
        await this.handleReconnection();
      }
    }
  }

  async addToGroup(groupName) {
    console.log("SignalR: addToGroup() called");
    this.#checkDisposed();

    if (!this.#checkConnectionConnected("addToGroup")) {
      return false;
    }

    try {
      await this.#connection.invoke("AddToGroup", groupName);
      console.log(`SignalR: Successfully joined group: ${groupName}`);
      if (!this.#groups.includes(groupName)) {
        this.#groups.push(groupName);
      }
      return true;
    } catch (error) {
      console.error(`SignalR: Failed to join group ${groupName}:`, error);
      return false;
    }
  }

  async removeFromGroup(groupName) {
    console.log("SignalR: removeFromGroup() called");
    this.#checkDisposed();

    if (!this.#checkConnectionConnected("removeFromGroup")) {
      return false;
    }

    try {
      await this.#connection.invoke("RemoveFromGroup", groupName);
      console.log(`SignalR: Successfully left group: ${groupName}`);
      this.#groups = this.#groups.filter((group) => group !== groupName);
      return true;
    } catch (error) {
      console.error(`SignalR: Failed to leave group ${groupName}:`, error);
      return false;
    }
  }

  async handleReconnection() {
    console.log("SignalR: handleReconnection() called");
    this.#checkDisposed();

    if (this.#reconnectAttempts >= this.#maxReconnectAttempts) {
      console.log("SignalR: Max reconnection attempts reached");
      this.triggerCallback("onMaxReconnectAttemptsReached");
      return;
    }

    this.#reconnectAttempts++;
    console.log(
      `SignalR: Reconnection attempt ${this.#reconnectAttempts}/${
        this.#maxReconnectAttempts
      }`
    );

    setTimeout(async () => {
      console.log(
        "SignalR: Attempting reconnection...",
        this.#connection?.state
      );

      // Only reconnect if not already connected or connecting
      if (
        !this.#connection ||
        (this.#connection.state !== signalR.HubConnectionState.Connected &&
          this.#connection.state !== signalR.HubConnectionState.Connecting)
      ) {
        await this.startConnection();
      } else {
        console.log(
          "SignalR: Skipping reconnection - already connected or connecting"
        );
      }
    }, this.#reconnectDelay);
  }

  /**
   * Stop the SignalR connection and clear all callbacks (deprecated, use dispose instead)
   * @deprecated use dispose instead
   */
  async stopConnection() {
    console.log("SignalR: stopConnection() called");
    this.#checkDisposed();

    if (!this.#checkConnectionConnected("stopConnection")) {
      this.#connectionCallbacks.clear();
      return;
    }

    try {
      await this.#connection.stop();
      this.#removeLifeCycleHandlers();
      console.log("SignalR: Connection stopped");
    } catch (error) {
      console.error("SignalR: Error stopping connection", error);
    } finally {
      this.#connectionCallbacks.clear();
    }
  }

  async resumeConnection() {
    console.log("SignalR: resumeConnection() called");
    this.#checkDisposed();
    if (this.#checkConnectionConnected("resumeConnection")) {
      return;
    }

    try {
      console.log("SignalR: Resuming connection");
      await this.#connection.start();
      this.triggerCallback("onReconnecting");
      console.log("SignalR: Connection resumed");
    } catch (error) {
      console.error("SignalR: Error resuming connection", error);
      throw error;
    }
  }

  async pauseConnection() {
    console.log("SignalR: pauseConnection() called");
    this.#checkDisposed();
    if (!this.#checkConnectionConnected("pauseConnection")) {
      return;
    }

    try {
      await this.#connection.stop();
      console.log("SignalR: Connection paused");
    } catch (error) {
      console.error("SignalR: Error pausing connection", error);
      throw error;
    }
  }

  onEvent(eventName, callback) {
    console.log("SignalR: onEvent() called");
    this.#checkDisposed();

    if (typeof eventName !== "string" || !eventName.trim()) {
      throw new TypeError("Event name must be a non-empty string");
    }
    if (typeof callback !== "function") {
      throw new TypeError("Callback must be a function");
    }

    if (!this.#checkConnectionExists("onEvent")) {
      console.warn(
        "SignalR: Connection not initialized, event listener will be added when connection is established"
      );
    }

    if (!this.#connectionCallbacks.has(eventName)) {
      this.#connectionCallbacks.set(eventName, new Set());
    }
    this.#connectionCallbacks.get(eventName).add(callback);
    console.log(
      `SignalR: Event '${eventName}' now has ${
        this.#connectionCallbacks.get(eventName).size
      } callback(s)`
    );
  }

  offEvent(eventName, callback) {
    console.log("SignalR: offEvent() called");
    this.#checkDisposed();

    if (typeof eventName !== "string" || !eventName.trim()) {
      throw new TypeError("Event name must be a non-empty string");
    }
    if (typeof callback !== "function") {
      throw new TypeError("Callback must be a function");
    }

    if (!this.#checkConnectionExists("offEvent")) {
      console.warn(
        "SignalR: Connection not initialized, but removing event listener anyway"
      );
    }

    if (this.#connectionCallbacks.has(eventName)) {
      const callbacksSet = this.#connectionCallbacks.get(eventName);
      if (callbacksSet) {
        callbacksSet.delete(callback);
        if (callbacksSet.size === 0) {
          this.#connectionCallbacks.delete(eventName);
        }
      }
    }
  }

  // trigger callback once and then remove it
  once(eventName, callback) {
    console.log("SignalR: once() called");
    this.#checkDisposed();

    if (typeof eventName !== "string" || !eventName.trim()) {
      throw new TypeError("Event name must be a non-empty string");
    }
    if (typeof callback !== "function") {
      throw new TypeError("Callback must be a function");
    }

    const wrappedCallback = () => {
      try {
        callback();
      } catch (error) {
        console.error(`SignalR: Error in ${eventName} callback:`, error);
      } finally {
        // remove callback after it is triggered
        this.offEvent(eventName, wrappedCallback);
      }
    };
    this.onEvent(eventName, wrappedCallback);
  }

  triggerCallback(eventName, data = null) {
    console.log("SignalR: triggerCallback() called");
    this.#checkDisposed();

    if (typeof eventName !== "string" || !eventName.trim()) {
      console.warn("SignalR: Invalid event name for triggerCallback");
      return;
    }

    console.log("SignalR: Triggering callback", eventName, data);
    if (this.#connectionCallbacks.has(eventName)) {
      for (const callback of this.#connectionCallbacks.get(eventName)) {
        try {
          if (!callback) continue;
          callback(data);
        } catch (error) {
          console.error(`SignalR: Error in ${eventName} callback:`, error);
        }
      }
    }
  }

  #setupLifeCycleHandlers() {
    console.log("SignalR: #setupLifeCycleHandlers() called");
    this.#checkDisposed();

    if (!this.#checkConnectionExists("#setupLifeCycleHandlers")) {
      return;
    }

    console.log("SignalR: Setting up life cycle handlers");
    this.#connection.onclose = async (error) => {
      console.log("SignalR: Connection closed", error);
      this.triggerCallback("onDisconnected", error);
    };

    this.#connection.onreconnecting = (error) => {
      console.log("SignalR: Reconnecting...", error);
      this.triggerCallback("onReconnecting", error);
    };

    this.#connection.onreconnected = async (connectionId) => {
      this.#reconnectAttempts = 0;
      console.log("SignalR: Reconnected", connectionId);

      // Rejoin groups since SignalR loses them on reconnect
      for (const group of this.#groups) {
        await this.addToGroup(group);
      }

      this.triggerCallback("onReconnected", connectionId);
    };
  }

  #removeLifeCycleHandlers() {
    console.log("SignalR: #removeLifeCycleHandlers() called");
    this.#checkDisposed();

    if (!this.#checkConnectionExists("#removeLifeCycleHandlers")) {
      return;
    }

    this.#connection.onclose = null;
    this.#connection.onreconnecting = null;
    this.#connection.onreconnected = null;
  }

  async invokeHubMethod(methodName, ...args) {
    console.log("SignalR: invokeHubMethod() called");
    this.#checkDisposed();

    console.log("InvokeHubMethod", methodName, args);
    if (!this.#checkConnectionConnected("invokeHubMethod")) {
      throw new Error("Hub connection is not initialized or not connected.");
    }

    try {
      return await this.#connection.invoke(methodName, ...args);
    } catch (error) {
      console.error(
        "SignalR: Error invoking hub method",
        methodName,
        args,
        error
      );
      throw error;
    }
  }

  async sendHubMethod(methodName, ...args) {
    console.log("SignalR: sendHubMethod() called");
    this.#checkDisposed();

    console.log("SendHubMethod", methodName, args);
    if (!this.#checkConnectionConnected("sendHubMethod")) {
      throw new Error("Hub connection is not initialized or not connected.");
    }

    try {
      return await this.#connection.send(methodName, ...args);
    } catch (error) {
      console.error(
        "SignalR: Error sending hub method",
        methodName,
        args,
        error
      );
      throw error;
    }
  }

  get boundTriggerCallback() {
    console.log("SignalR: boundTriggerCallback getter called");
    this.#checkDisposed();
    return this.triggerCallback.bind(this);
  }

  /**
   * Dispose the SignalR service and clean up all resources
   * This method should be called when the service is no longer needed
   */
  async dispose() {
    console.log("SignalR: dispose() called");
    if (this.#isDisposed) {
      console.warn("SignalR: Service already disposed");
      return;
    }

    console.log("SignalR: Disposing service...");

    try {
      // Stop the connection if it exists and is connected
      if (
        this.#connection &&
        this.#connection.state !== signalR.HubConnectionState.Disconnected
      ) {
        await this.#connection.stop();
        console.log("SignalR: Connection stopped during disposal");
      }
    } catch (error) {
      console.error(
        "SignalR: Error stopping connection during disposal",
        error
      );
    }

    try {
      // Remove all lifecycle handlers
      this.#removeLifeCycleHandlers();
    } catch (error) {
      console.error(
        "SignalR: Error removing lifecycle handlers during disposal",
        error
      );
    }

    // Clear all callbacks
    this.#connectionCallbacks.clear();

    // Clear groups
    this.#groups = [];

    // Reset connection state
    this.#connection = null;

    // Mark as disposed
    this.#isDisposed = true;

    console.log("SignalR: Service disposed successfully");
  }

  /**
   * Check if the service has been disposed and throw an error if it has
   * @private
   */
  #checkDisposed() {
    if (this.#isDisposed) {
      throw new Error("SignalR service has been disposed and cannot be used");
    }
  }

  /**
   * Check if connection exists and is initialized
   * @private
   * @param {string} methodName - Name of the calling method for logging
   * @returns {boolean} true if connection exists
   */
  #checkConnectionExists(methodName) {
    if (!this.#connection) {
      console.warn(`SignalR [${methodName}]: Connection not initialized`);
      return false;
    }
    return true;
  }

  /**
   * Check if connection is in connected state
   * @private
   * @param {string} methodName - Name of the calling method for logging
   * @returns {boolean} true if connection is connected
   */
  #checkConnectionConnected(methodName) {
    if (!this.#checkConnectionExists(methodName)) {
      return false;
    }

    if (this.#connection.state !== signalR.HubConnectionState.Connected) {
      console.warn(
        `SignalR [${methodName}]: Connection not connected. Current state: ${
          this.#connection.state
        }`
      );
      return false;
    }
    return true;
  }
}

export default SignalRService;
