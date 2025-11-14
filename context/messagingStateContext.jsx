import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { AppState } from "react-native";
import * as signalR from "@microsoft/signalr";
import SignalRServiceFactory from "../services/signalR/Message/factory";
import { ServiceName } from "../services/signalR/Message/constants/ServiceConfigs";
import registerHandlers from "../services/signalR/Message/handlers/registerMainHandlers";
import unregisterHandlers from "../services/signalR/Message/handlers/unregisterMainHandlers";
import { CLIENT_METHODS } from "../services/signalR/Message/constants/hubMethods";
// Initial state
const initialState = {
  messagingService: null,
  currentUser: null,
  conversations: [],
  activeConversation: null,
  isLoading: false,
  typingStatus: null,
  error: null,
  connectionStatus: "disconnected",
  selectedMessage: null,
  messages: [],
  tempNewConversation: null,
  bypassAppStateChange: false,
};

// Action types
const actionTypes = {
  SET_MESSAGING_SERVICE: "SET_MESSAGING_SERVICE",
  SET_CURRENT_USER: "SET_CURRENT_USER",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  SET_CONNECTION_STATUS: "SET_CONNECTION_STATUS",
  SET_MESSAGES: "SET_MESSAGES",
  ADD_MESSAGE: "ADD_MESSAGE",
  REMOVE_MESSAGE: "REMOVE_MESSAGE",
  ADD_MESSAGES: "ADD_MESSAGES",
  REACTION_RECEIVED: "REACTION_RECEIVED",
  REACTION_REMOVED: "REACTION_REMOVED",
  UPDATE_MESSAGE_STATUS: "UPDATE_MESSAGE_STATUS",
  MESSAGE_UPDATED: "MESSAGE_UPDATED",
  SET_CONVERSATIONS: "SET_CONVERSATIONS",
  ADD_CONVERSATION: "ADD_CONVERSATION",
  SET_ACTIVE_CONVERSATION: "SET_ACTIVE_CONVERSATION",
  UPDATE_CONVERSATION: "UPDATE_CONVERSATION",
  SET_TYPING_STATUS: "SET_TYPING_STATUS",
  CLEAR_STATE: "CLEAR_STATE",
  SET_SELECTED_MESSAGE: "SET_SELECTED_MESSAGE",
  SET_TEMP_NEW_CONVERSATION: "SET_TEMP_NEW_CONVERSATION",
  SET_UNIQUE_ID: "SET_UNIQUE_ID",
  SET_BYPASS_APP_STATE_CHANGE: "SET_BYPASS_APP_STATE_CHANGE",
};

// Reducer
const messagingReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_MESSAGING_SERVICE:
      return { ...state, messagingService: action.payload };
    case actionTypes.SET_CURRENT_USER:
      return { ...state, currentUser: action.payload };
    case actionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    case actionTypes.SET_CONNECTION_STATUS:
      return { ...state, connectionStatus: action.payload };
    case actionTypes.SET_MESSAGES:
      return { ...state, messages: action.payload };
    case actionTypes.ADD_MESSAGE:
      return {
        ...state,
        messages: [action.payload, ...state.messages],
      };
    case actionTypes.ADD_MESSAGES:
      const existingMessageIds = new Set(state.messages.map((msg) => msg.id));
      const uniqueNewMessages = action.payload.filter(
        (msg) => !existingMessageIds.has(msg.id)
      );
      return {
        ...state,
        messages: [...state.messages, ...uniqueNewMessages],
      };
    case actionTypes.REMOVE_MESSAGE:
      return {
        ...state,
        messages: state.messages.filter(
          (msg) => msg.id !== action.payload.messageId
        ),
      };
    case actionTypes.REACTION_RECEIVED:
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.messageId
            ? { ...msg, reaction: action.payload.reaction }
            : msg
        ),
      };
    case actionTypes.REACTION_REMOVED:
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.messageId ? { ...msg, reaction: null } : msg
        ),
      };
    case actionTypes.UPDATE_MESSAGE_STATUS:
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.messageId
            ? { ...msg, deliveryStatus: action.payload.status }
            : msg
        ),
      };
    case actionTypes.MESSAGE_UPDATED:
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.id
            ? {
                ...msg,
                content: action.payload.newContent,
                isDeleted: action.payload.isDeleted,
                updatedAt: action.payload.updatedAt,
                bookingRequest: action.payload.bookingRequest,
              }
            : msg
        ),
      };
    case actionTypes.SET_CONVERSATIONS:
      return {
        ...state,
        conversations: [...action.payload].sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        ),
      };
    case actionTypes.ADD_CONVERSATION:
      const conversationExists = state.conversations.some(
        (conv) => conv.id === action.payload.id
      );
      if (conversationExists) {
        return state;
      }
      const newConversations = [...state.conversations, action.payload];
      return {
        ...state,
        conversations: newConversations.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        ),
      };
    case actionTypes.SET_ACTIVE_CONVERSATION:
      return { ...state, activeConversation: action.payload };
    case actionTypes.UPDATE_CONVERSATION:
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === action.payload.id ? { ...conv, ...action.payload } : conv
        ),
      };
    case actionTypes.SET_TYPING_STATUS:
      return {
        ...state,
        typingStatus: action.payload,
      };
    case actionTypes.SET_SELECTED_MESSAGE:
      return {
        ...state,
        selectedMessage: action.payload,
      };
    case actionTypes.SET_TEMP_NEW_CONVERSATION:
      return {
        ...state,
        tempNewConversation: action.payload,
      };
    case actionTypes.SET_BYPASS_APP_STATE_CHANGE:
      return {
        ...state,
        bypassAppStateChange: action.payload,
      };
    case actionTypes.CLEAR_STATE:
      return initialState;
    default:
      return state;
  }
};

// Context
const MessagingStateContext = createContext(null);

// Provider component
export const MessagingStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(messagingReducer, initialState);
  const [joinedGroup, setJoinedGroup] = useState("");

  useEffect(() => {
    const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    dispatch({ type: actionTypes.SET_UNIQUE_ID, payload: uid });
    console.log("MessagingStateProvider useEffect called.");

    const startConnection = async () => {
      const messagingService = await SignalRServiceFactory.getInstance(
        ServiceName.MESSAGING
      );

      dispatch({
        type: actionTypes.SET_MESSAGING_SERVICE,
        payload: messagingService,
      });
      if (!messagingService) return;

      // Set initial connection status
      const status = messagingService.connectionStatus;
      console.log("Initial connection status:", status);
      if (status.state === signalR.HubConnectionState.Connected) {
        dispatch({
          type: actionTypes.SET_CONNECTION_STATUS,
          payload: "connected",
        });
      } else if (status.state === signalR.HubConnectionState.Connecting) {
        dispatch({
          type: actionTypes.SET_CONNECTION_STATUS,
          payload: "connecting",
        });
      } else {
        dispatch({
          type: actionTypes.SET_CONNECTION_STATUS,
          payload: "disconnected",
        });
      }

      try {
        registerHandlers(
          messagingService,
          messagingService.boundTriggerCallback
        );
      } catch (error) {
        console.error("Error registering handlers", error);
      }
    };

    startConnection();

    return () => {
      dispatch({ type: actionTypes.CLEAR_STATE });
      console.log("unregistering handlers", state.messagingService);
      unregisterHandlers(state.messagingService);
      SignalRServiceFactory.dispose(ServiceName.MESSAGING);
    };
  }, []);

  // Hanlde join/leave groups
  useEffect(() => {
    const handleGroupJoinLeave = async () => {
      console.log("state.activeConversation", state.activeConversation);
      if (!state.messagingService) return;
      try {
        if (state.activeConversation) {
          await state.messagingService.addToGroup(
            state.activeConversation.id.toString()
          );
          setJoinedGroup(state.activeConversation.id.toString());
        } else {
          if (joinedGroup) {
            await state.messagingService.removeFromGroup(joinedGroup);
            setJoinedGroup("");
          }
        }
      } catch (error) {
        console.error("Error handling group join leave", error);
      }
    };

    handleGroupJoinLeave();

    return () => {
      if (state.messagingService && joinedGroup) {
        try {
          state.messagingService.removeFromGroup(joinedGroup);
          setJoinedGroup("");
        } catch (error) {
          console.error("Error removing from group on cleanup", error);
        }
      }
    };
  }, [state.activeConversation, state.messagingService]);

  // Listen to lifecycle events for connection status tracking
  useEffect(() => {
    if (!state.messagingService) return;

    const handleConnected = () => {
      console.log("MessagingStateProvider: Connection established");
      dispatch({
        type: actionTypes.SET_CONNECTION_STATUS,
        payload: "connected",
      });
    };

    const handleDisconnected = (error) => {
      console.log("MessagingStateProvider: Connection disconnected", error);
      dispatch({
        type: actionTypes.SET_CONNECTION_STATUS,
        payload: "disconnected",
      });
    };

    const handleReconnecting = (error) => {
      console.log("MessagingStateProvider: Connection reconnecting", error);
      dispatch({
        type: actionTypes.SET_CONNECTION_STATUS,
        payload: "reconnecting",
      });
    };

    const handleReconnected = (connectionId) => {
      console.log(
        "MessagingStateProvider: Connection reconnected",
        connectionId
      );
      dispatch({
        type: actionTypes.SET_CONNECTION_STATUS,
        payload: "connected",
      });
    };

    try {
      state.messagingService.onEvent("onConnected", handleConnected);
      state.messagingService.onEvent("onDisconnected", handleDisconnected);
      state.messagingService.onEvent("onReconnecting", handleReconnecting);
      state.messagingService.onEvent("onReconnected", handleReconnected);
    } catch (error) {
      console.error("Error setting up lifecycle event listeners", error);
    }

    return () => {
      if (state.messagingService) {
        try {
          state.messagingService.offEvent("onConnected", handleConnected);
          state.messagingService.offEvent("onDisconnected", handleDisconnected);
          state.messagingService.offEvent("onReconnecting", handleReconnecting);
          state.messagingService.offEvent("onReconnected", handleReconnected);
        } catch (error) {
          console.error("Error removing lifecycle event listeners", error);
        }
      }
    };
  }, [state.messagingService]);

  useEffect(() => {
    if (!state.messagingService) return;

    const handleTypingStatusUpdated = (typingData) => {
      dispatch({
        type: actionTypes.SET_TYPING_STATUS,
        payload: typingData,
      });
    };

    try {
      state.messagingService.onEvent(
        CLIENT_METHODS.USER_TYPING,
        handleTypingStatusUpdated
      );
    } catch (error) {
      console.error("Error handling typing status updated", error);
    }

    return () => {
      if (state.messagingService) {
        state.messagingService.offEvent(
          CLIENT_METHODS.USER_TYPING,
          handleTypingStatusUpdated
        );
      }
    };
  }, [state.messagingService]);

  // Handle app state changes to pause/resume SignalR connection
  const appState = useRef(AppState.currentState);
  const bypassAppStateChangeRef = useRef(state.bypassAppStateChange);

  useEffect(() => {
    if (!state.messagingService) return;

    const handleAppStateChange = async (nextAppState) => {
      if (
        appState.current.match(/active/) &&
        nextAppState.match(/inactive|background/)
      ) {
        if (bypassAppStateChangeRef.current) {
          console.log("Bypassing app state change (image picker open)");
          return;
        }
        console.log(
          "App has gone to the background, pausing SignalR connection"
        );
        try {
          await state.messagingService.pauseConnection();
        } catch (error) {
          console.error("Error pausing SignalR connection:", error);
        }
      } else if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        if (bypassAppStateChangeRef.current) {
          console.log("Bypassing app state change (was in image picker)");
          // Reset bypass flag synchronously
          bypassAppStateChangeRef.current = false;
          dispatch({
            type: actionTypes.SET_BYPASS_APP_STATE_CHANGE,
            payload: false,
          });
          return;
        }
        console.log(
          "App has come to the foreground, starting SignalR connection"
        );
        try {
          await state.messagingService.resumeConnection();
        } catch (error) {
          console.error("Error starting SignalR connection:", error);
        }
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
    };
  }, [state.messagingService]);

  // Actions
  const actions = {
    setTypingStatus: (typingStatus) =>
      dispatch({
        type: actionTypes.SET_TYPING_STATUS,
        payload: typingStatus,
      }),
    setLoading: (loading) =>
      dispatch({ type: actionTypes.SET_LOADING, payload: loading }),
    setError: (error) =>
      dispatch({ type: actionTypes.SET_ERROR, payload: error }),
    setConnectionStatus: (status) =>
      dispatch({ type: actionTypes.SET_CONNECTION_STATUS, payload: status }),
    addMessage: (message) =>
      dispatch({ type: actionTypes.ADD_MESSAGE, payload: message }),
    removeMessage: (messageId) =>
      dispatch({ type: actionTypes.REMOVE_MESSAGE, payload: { messageId } }),
    addMessages: (messages) =>
      dispatch({ type: actionTypes.ADD_MESSAGES, payload: messages }),
    setMessages: (messages) =>
      dispatch({ type: actionTypes.SET_MESSAGES, payload: messages }),
    reactionReceived: (messageId, reaction) =>
      dispatch({
        type: actionTypes.REACTION_RECEIVED,
        payload: { messageId, reaction },
      }),
    reactionRemoved: (messageId) =>
      dispatch({ type: actionTypes.REACTION_REMOVED, payload: { messageId } }),
    updateMessageStatus: (messageId, status) =>
      dispatch({
        type: actionTypes.UPDATE_MESSAGE_STATUS,
        payload: { messageId, status },
      }),
    messageUpdated: (message) =>
      dispatch({ type: actionTypes.MESSAGE_UPDATED, payload: message }),
    setConversations: (conversations) =>
      dispatch({ type: actionTypes.SET_CONVERSATIONS, payload: conversations }),
    addConversation: (conversation) =>
      dispatch({ type: actionTypes.ADD_CONVERSATION, payload: conversation }),
    setSelectedMessage: (message) =>
      dispatch({ type: actionTypes.SET_SELECTED_MESSAGE, payload: message }),
    setActiveConversation: (conversation) =>
      dispatch({
        type: actionTypes.SET_ACTIVE_CONVERSATION,
        payload: conversation,
      }),
    updateConversation: (conversation) =>
      dispatch({
        type: actionTypes.UPDATE_CONVERSATION,
        payload: conversation,
      }),
    setTempNewConversation: (conversation) =>
      dispatch({
        type: actionTypes.SET_TEMP_NEW_CONVERSATION,
        payload: conversation,
      }),
    setBypassAppStateChange: (bypass) => {
      // Update ref synchronously to avoid race condition with app state change
      bypassAppStateChangeRef.current = bypass;
      dispatch({
        type: actionTypes.SET_BYPASS_APP_STATE_CHANGE,
        payload: bypass,
      });
    },
    clearState: () => dispatch({ type: actionTypes.CLEAR_STATE }),
  };

  const value = useMemo(
    () => ({
      ...state,
      ...actions,
    }),
    [state] // dont need to memoize actions as they are not changing, no closures are captured when use actions
  );

  return (
    <MessagingStateContext.Provider value={value}>
      {children}
    </MessagingStateContext.Provider>
  );
};

export const useMessagingState = () => {
  const context = useContext(MessagingStateContext);
  if (!context) {
    throw new Error(
      "useMessagingState must be used within a MessagingStateProvider"
    );
  }
  return context;
};
