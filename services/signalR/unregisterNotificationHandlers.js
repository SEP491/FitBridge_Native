import { CLIENT_METHODS } from "./signalingMethods";

/**
 * Unregister SignalR handlers for notification events
 * @param {HubConnection} connection - The SignalR connection
 */
export function unregisterNotificationHandlers(connection) {
  console.log("SignalR: Unregistering notification handlers");

  if (connection) {
    connection.off(CLIENT_METHODS.NOTIFICATION_RECEIVED);
  }
}

export default unregisterNotificationHandlers;
