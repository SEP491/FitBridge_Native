import { CLIENT_METHODS } from "./signalingMethods";

/**
 * Register SignalR handlers for notification events
 * @param {HubConnection} connection - The SignalR connection
 * @param {Function} triggerCallback - Function to trigger callbacks
 */
export function registerNotificationHandlers(connection, triggerCallback) {
  console.log("SignalR: Registering notification handlers");

  // Remove any existing handler first to prevent duplicates
  connection.off(CLIENT_METHODS.NOTIFICATION_RECEIVED);

  // Handle incoming notifications from the server
  connection.on(CLIENT_METHODS.NOTIFICATION_RECEIVED, (notification) => {
    console.log("SignalR: Notification received from server", notification);
    triggerCallback(CLIENT_METHODS.NOTIFICATION_RECEIVED, notification);
  });

  console.log("SignalR: Notification handlers registered successfully");
}

export default registerNotificationHandlers;
