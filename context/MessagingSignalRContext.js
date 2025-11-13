import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import messagingService, {
  startConnection,
  stopConnection,
  onEvent,
  offEvent,
  getConnectionStatus,
  joinConversation,
  leaveConversation,
  sendTypingIndicator,
} from "../services/signalR/signalR-messagingService";
import { CLIENT_METHODS } from "../services/signalR/hubMethods";

const MessagingSignalRContext = createContext(null);

export const MessagingSignalRProvider = ({ children }) => {
  const [connectionState, setConnectionState] = useState("Disconnected");
  const [connectionId, setConnectionId] = useState(null);
  const [activeConversations, setActiveConversations] = useState(new Set());

  // Initialize connection
  useEffect(() => {
    let isMounted = true;

    const initConnection = async () => {
      try {
        console.log("MessagingSignalR: Initializing connection...");
        await startConnection();
      } catch (error) {
        console.error("MessagingSignalR: Failed to start connection", error);
      }
    };

    initConnection();

    // Setup lifecycle event handlers
    const handleConnected = () => {
      if (!isMounted) return;
      console.log("MessagingSignalR: Connected");
      const status = getConnectionStatus();
      setConnectionState(status.state);
      setConnectionId(status.connectionId);
    };

    const handleDisconnected = (error) => {
      if (!isMounted) return;
      console.log("MessagingSignalR: Disconnected", error);
      setConnectionState("Disconnected");
      setConnectionId(null);
    };

    const handleReconnecting = (error) => {
      if (!isMounted) return;
      console.log("MessagingSignalR: Reconnecting...", error);
      setConnectionState("Reconnecting");
    };

    const handleReconnected = (connId) => {
      if (!isMounted) return;
      console.log("MessagingSignalR: Reconnected", connId);
      setConnectionState("Connected");
      setConnectionId(connId);
    };

    const handleConnectionFailed = (error) => {
      if (!isMounted) return;
      console.error("MessagingSignalR: Connection failed", error);
    };

    const handleMaxReconnectAttempts = () => {
      if (!isMounted) return;
      console.error("MessagingSignalR: Max reconnection attempts reached");
      setConnectionState("Failed");
    };

    // Register lifecycle event listeners
    onEvent("onConnected", handleConnected);
    onEvent("onDisconnected", handleDisconnected);
    onEvent("onReconnecting", handleReconnecting);
    onEvent("onReconnected", handleReconnected);
    onEvent("onInitialConnectionFailed", handleConnectionFailed);
    onEvent("onMaxReconnectAttemptsReached", handleMaxReconnectAttempts);

    // Cleanup
    return () => {
      isMounted = false;
      offEvent("onConnected", handleConnected);
      offEvent("onDisconnected", handleDisconnected);
      offEvent("onReconnecting", handleReconnecting);
      offEvent("onReconnected", handleReconnected);
      offEvent("onInitialConnectionFailed", handleConnectionFailed);
      offEvent("onMaxReconnectAttemptsReached", handleMaxReconnectAttempts);
      stopConnection();
    };
  }, []);

  // Join a conversation
  const joinConversationHandler = useCallback(async (conversationId) => {
    try {
      const success = await joinConversation(conversationId);
      if (success) {
        setActiveConversations((prev) => new Set([...prev, conversationId]));
      }
      return success;
    } catch (error) {
      console.error("MessagingSignalR: Error joining conversation", error);
      return false;
    }
  }, []);

  // Leave a conversation
  const leaveConversationHandler = useCallback(async (conversationId) => {
    try {
      const success = await leaveConversation(conversationId);
      if (success) {
        setActiveConversations((prev) => {
          const newSet = new Set(prev);
          newSet.delete(conversationId);
          return newSet;
        });
      }
      return success;
    } catch (error) {
      console.error("MessagingSignalR: Error leaving conversation", error);
      return false;
    }
  }, []);

  // Send typing indicator
  const sendTyping = useCallback(async (conversationId, isTyping) => {
    try {
      return await sendTypingIndicator(conversationId, isTyping);
    } catch (error) {
      console.error("MessagingSignalR: Error sending typing indicator", error);
      return false;
    }
  }, []);

  // Subscribe to messaging events
  const subscribeToEvent = useCallback((eventName, callback) => {
    onEvent(eventName, callback);
    // Return unsubscribe function
    return () => offEvent(eventName, callback);
  }, []);

  const value = {
    // Connection state
    connectionState,
    connectionId,
    isConnected: connectionState === "Connected",
    isReconnecting: connectionState === "Reconnecting",

    // Active conversations
    activeConversations: Array.from(activeConversations),

    // Actions
    joinConversation: joinConversationHandler,
    leaveConversation: leaveConversationHandler,
    sendTypingIndicator: sendTyping,

    // Event subscription
    subscribeToEvent,

    // Direct access to service (for advanced use)
    messagingService,

    // Client methods constants
    CLIENT_METHODS,
  };

  return (
    <MessagingSignalRContext.Provider value={value}>
      {children}
    </MessagingSignalRContext.Provider>
  );
};

// Hook to use messaging SignalR context
export const useMessagingSignalR = () => {
  const context = useContext(MessagingSignalRContext);
  if (!context) {
    throw new Error(
      "useMessagingSignalR must be used within MessagingSignalRProvider"
    );
  }
  return context;
};

export default MessagingSignalRContext;
