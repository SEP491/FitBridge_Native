import { CLIENT_METHODS } from "../constants/hubMethods";
export function unregisterHandlers(service) {
  const connection = service.connection;
  if (!connection) {
    console.error("Connection not initialized");
    return;
  }
  if (!service.areHandlersRegistered) {
    console.warn("Handlers not registered");
    return;
  }
  console.log("Unregistering handlers");
  service.areHandlersRegistered = false;
  connection.off(CLIENT_METHODS.MESSAGE_RECEIVED);
  connection.off(CLIENT_METHODS.USER_TYPING);
  connection.off(CLIENT_METHODS.REACTION_RECEIVED);
  connection.off(CLIENT_METHODS.REACTION_REMOVED);
  connection.off(CLIENT_METHODS.UPDATE_MESSAGE_STATUS);
  connection.off(CLIENT_METHODS.USER_TYPING);
  connection.off(CLIENT_METHODS.USER_PRESENCE_UPDATE);
  connection.off(CLIENT_METHODS.MESSAGE_UPDATED);
}
export default unregisterHandlers;
