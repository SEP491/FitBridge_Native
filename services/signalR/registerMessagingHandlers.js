import { CLIENT_METHODS } from "./hubMethods";

/**
 * Register all messaging-related SignalR handlers
 * @param {object} connection - SignalR connection instance
 * @param {function} triggerCallback - Callback trigger function
 * @returns {object} - Object containing unregister function
 */
export function registerMessagingHandlers(connection, triggerCallback) {
  if (!connection) {
    console.error("SignalR Messaging: Connection not initialized");
    return { unregister: () => {} };
  }

  console.log("SignalR Messaging: Registering handlers");

  // Message received handler
  const messageReceivedHandler = (message) => {
    console.log("SignalR Messaging: Message received", message);
    triggerCallback(CLIENT_METHODS.MESSAGE_RECEIVED, message);
  };

  // Message updated handler
  const messageUpdatedHandler = (updatedMessage) => {
    console.log("SignalR Messaging: Message updated", updatedMessage);
    triggerCallback(CLIENT_METHODS.MESSAGE_UPDATED, updatedMessage);
  };

  // Message deleted handler
  const messageDeletedHandler = (deletedMessageData) => {
    console.log("SignalR Messaging: Message deleted", deletedMessageData);
    triggerCallback(CLIENT_METHODS.MESSAGE_DELETED, deletedMessageData);
  };

  // User typing handler
  const userTypingHandler = (typingData) => {
    console.log("SignalR Messaging: User typing", typingData);
    triggerCallback(CLIENT_METHODS.USER_TYPING, typingData);
  };

  // Reaction received handler
  const reactionReceivedHandler = (reactionData) => {
    console.log("SignalR Messaging: Reaction received", reactionData);
    triggerCallback(CLIENT_METHODS.REACTION_RECEIVED, reactionData);
  };

  // Reaction removed handler
  const reactionRemovedHandler = (reactionData) => {
    console.log("SignalR Messaging: Reaction removed", reactionData);
    triggerCallback(CLIENT_METHODS.REACTION_REMOVED, reactionData);
  };

  // Update message status handler
  const updateMessageStatusHandler = (statusUpdate) => {
    console.log("SignalR Messaging: Update message status", statusUpdate);
    triggerCallback(CLIENT_METHODS.UPDATE_MESSAGE_STATUS, statusUpdate);
  };

  // User presence update handler
  const userPresenceUpdateHandler = (presenceUpdate) => {
    console.log("SignalR Messaging: User presence update", presenceUpdate);
    triggerCallback(CLIENT_METHODS.USER_PRESENCE_UPDATE, presenceUpdate);
  };

  // User joined conversation handler
  const userJoinedConversationHandler = (joinData) => {
    console.log("SignalR Messaging: User joined conversation", joinData);
    triggerCallback(CLIENT_METHODS.USER_JOINED_CONVERSATION, joinData);
  };

  // User left conversation handler
  const userLeftConversationHandler = (leaveData) => {
    console.log("SignalR Messaging: User left conversation", leaveData);
    triggerCallback(CLIENT_METHODS.USER_LEFT_CONVERSATION, leaveData);
  };

  // Register all handlers
  connection.on(CLIENT_METHODS.MESSAGE_RECEIVED, messageReceivedHandler);
  connection.on(CLIENT_METHODS.MESSAGE_UPDATED, messageUpdatedHandler);
  connection.on(CLIENT_METHODS.MESSAGE_DELETED, messageDeletedHandler);
  connection.on(CLIENT_METHODS.USER_TYPING, userTypingHandler);
  connection.on(CLIENT_METHODS.REACTION_RECEIVED, reactionReceivedHandler);
  connection.on(CLIENT_METHODS.REACTION_REMOVED, reactionRemovedHandler);
  connection.on(CLIENT_METHODS.UPDATE_MESSAGE_STATUS, updateMessageStatusHandler);
  connection.on(CLIENT_METHODS.USER_PRESENCE_UPDATE, userPresenceUpdateHandler);
  connection.on(CLIENT_METHODS.USER_JOINED_CONVERSATION, userJoinedConversationHandler);
  connection.on(CLIENT_METHODS.USER_LEFT_CONVERSATION, userLeftConversationHandler);

  console.log("SignalR Messaging: All handlers registered successfully");

  // Return unregister function
  return {
    unregister: () => unregisterMessagingHandlers(connection),
  };
}

/**
 * Unregister all messaging-related SignalR handlers
 * @param {object} connection - SignalR connection instance
 */
export function unregisterMessagingHandlers(connection) {
  if (!connection) {
    console.warn("SignalR Messaging: Connection not initialized, skipping unregister");
    return;
  }

  console.log("SignalR Messaging: Unregistering handlers");

  connection.off(CLIENT_METHODS.MESSAGE_RECEIVED);
  connection.off(CLIENT_METHODS.MESSAGE_UPDATED);
  connection.off(CLIENT_METHODS.MESSAGE_DELETED);
  connection.off(CLIENT_METHODS.USER_TYPING);
  connection.off(CLIENT_METHODS.REACTION_RECEIVED);
  connection.off(CLIENT_METHODS.REACTION_REMOVED);
  connection.off(CLIENT_METHODS.UPDATE_MESSAGE_STATUS);
  connection.off(CLIENT_METHODS.USER_PRESENCE_UPDATE);
  connection.off(CLIENT_METHODS.USER_JOINED_CONVERSATION);
  connection.off(CLIENT_METHODS.USER_LEFT_CONVERSATION);

  console.log("SignalR Messaging: All handlers unregistered successfully");
}

export default {
  registerMessagingHandlers,
  unregisterMessagingHandlers,
};
