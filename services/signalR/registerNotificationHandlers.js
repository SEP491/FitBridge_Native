import { CLIENT_METHODS } from "./signalingMethods";

export function registerNotificationHandlers(connection, triggerCallback) {
  console.log("SignalR: Registering notification handlers");
  console.log("Connection state:", connection?.state);
  console.log(
    "CLIENT_METHODS.NOTIFICATION_RECEIVED:",
    CLIENT_METHODS.NOTIFICATION_RECEIVED
  );

  connection.on(CLIENT_METHODS.NOTIFICATION_RECEIVED, (notification) => {
    console.log("🔔 HANDLER TRIGGERED - Notification received:", notification);
    triggerCallback(CLIENT_METHODS.NOTIFICATION_RECEIVED, notification);
  });

  console.log("SignalR: Notification handlers registered successfully");
}

export default registerNotificationHandlers;
