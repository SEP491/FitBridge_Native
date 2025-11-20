// Hub methods that client calls on server
export const HUB_METHODS = {
  CONFIRM_HANDSHAKE: "ConfirmHandshake",
  USER_TYPING: "UserTyping",
  JOIN_GROUP: "JoinGroup",
  LEAVE_GROUP: "LeaveGroup",
  SEND_MESSAGE: "SendMessage",
  UPDATE_MESSAGE: "UpdateMessage",
  DELETE_MESSAGE: "DeleteMessage",
  ADD_REACTION: "AddReaction",
  REMOVE_REACTION: "RemoveReaction",
  MARK_AS_READ: "MarkAsRead",
};

// Client methods that server calls on client
export const CLIENT_METHODS = {
  MESSAGE_RECEIVED: "MessageReceived",
  MESSAGE_UPDATED: "MessageUpdated",
  MESSAGE_DELETED: "MessageDeleted",
  UPDATE_MESSAGE_STATUS: "UpdateMessageStatus",
  REACTION_REMOVED: "ReactionRemoved",
  REACTION_RECEIVED: "ReactionReceived",
  USER_TYPING: "UserTyping",
  USER_PRESENCE_UPDATE: "UserPresenceUpdate",
  USER_JOINED_CONVERSATION: "UserJoinedConversation",
  USER_LEFT_CONVERSATION: "UserLeftConversation",
};

export default {
  HUB_METHODS,
  CLIENT_METHODS,
};
