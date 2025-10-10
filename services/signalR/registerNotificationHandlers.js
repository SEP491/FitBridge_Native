import { CLIENT_METHODS } from "./signalingMethods";

/**
 * Register SignalR handlers for notification events
 * @param {HubConnection} connection - The SignalR connection
 * @param {Function} triggerCallback - Function to trigger callbacks
 */
export function registerNotificationHandlers(connection, triggerCallback) {
  console.log("SignalR: Registering notification handlers");

  // Handle incoming notifications from the server
  connection.on(CLIENT_METHODS.NOTIFICATION_RECEIVED, (notification) => {
    console.log("SignalR: Notification received", notification);
    triggerCallback(CLIENT_METHODS.NOTIFICATION_RECEIVED, notification);
  });
}

export default registerNotificationHandlers;
