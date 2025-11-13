import { CLIENT_METHODS } from "../constants/hubMethods";
import unregisterHandlers from "./unregisterMainHandlers";

export function registerHandlers(service, triggerCallback) {
  unregisterHandlers(service);
  console.log("Registering handlers");
  const connection = service.connection;
  if (service.areHandlersRegistered) {
    console.warn("Handlers already registered");
    return;
  }
  service.areHandlersRegistered = true;
  if (!connection) {
    console.error("Connection not initialized");
    return;
  }
  connection.on(CLIENT_METHODS.MESSAGE_RECEIVED, (message) => {
    console.log("Message received", message);
    triggerCallback(CLIENT_METHODS.MESSAGE_RECEIVED, message);
  });
  connection.on(CLIENT_METHODS.USER_TYPING, (typingData) => {
    console.log("User typing", typingData);
    triggerCallback(CLIENT_METHODS.USER_TYPING, typingData);
  });
  connection.on(CLIENT_METHODS.REACTION_RECEIVED, (reactionData) => {
    console.log("Reaction received", reactionData);
    triggerCallback(CLIENT_METHODS.REACTION_RECEIVED, reactionData);
  });
  connection.on(CLIENT_METHODS.REACTION_REMOVED, (reactionData) => {
    console.log("Reaction removed", reactionData);
    triggerCallback(CLIENT_METHODS.REACTION_REMOVED, reactionData);
  });
  connection.on(CLIENT_METHODS.UPDATE_MESSAGE_STATUS, (statusUpdate) => {
    console.log("Update message status", statusUpdate);
    triggerCallback(CLIENT_METHODS.UPDATE_MESSAGE_STATUS, statusUpdate);
  });
  connection.on(CLIENT_METHODS.USER_PRESENCE_UPDATE, (presenceUpdate) => {
    console.log("User presence update", presenceUpdate);
    triggerCallback(CLIENT_METHODS.USER_PRESENCE_UPDATE, presenceUpdate);
  });
  connection.on(CLIENT_METHODS.MESSAGE_UPDATED, (updatedMessage) => {
    console.log("Message updated", updatedMessage);
    triggerCallback(CLIENT_METHODS.MESSAGE_UPDATED, updatedMessage);
  });
}

export default registerHandlers;
