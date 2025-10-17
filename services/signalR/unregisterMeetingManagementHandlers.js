import { CLIENT_METHODS } from "./signalingMethods";

export function unregisterMeetingManagementHandlers(connection) {
  if (!connection) {
    console.warn('Cannot unregister meeting handlers: connection is null');
    return;
  }
  
  try {
    connection.off(CLIENT_METHODS.SHOW_EXPIRATION_ALERT);
    connection.off(CLIENT_METHODS.STOP_MEETING);
  } catch (error) {
    console.error('Error unregistering meeting handlers:', error);
  }
}

export default unregisterMeetingManagementHandlers;
