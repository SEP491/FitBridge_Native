# SignalR & Expo Notifications Setup Guide for FitBridge Native

This document provides a complete guide to set up and use the SignalR and Expo Notifications integration in the FitBridge Native application.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Environment Configuration](#environment-configuration)
5. [Backend Requirements](#backend-requirements)
6. [Usage Guide](#usage-guide)
7. [API Integration](#api-integration)
8. [Troubleshooting](#troubleshooting)

## Overview

The FitBridge Native notification system combines:

- **SignalR**: For real-time bidirectional communication with the server
- **Expo Notifications**: For local and push notifications on iOS and Android

This integration allows the app to:

- Receive real-time notifications from the server via SignalR
- Display local notifications when the app is in foreground/background
- Handle push notifications when the app is closed
- Manage notification state and user interactions

## Architecture

### Component Structure

```
FitBridge_Native/
├── context/
│   ├── SignalRContext.js          # SignalR connection management
│   └── NotificationContext.js     # Notification state & logic
├── services/
│   ├── signalR/
│   │   ├── signalRService.js      # SignalR service singleton
│   │   ├── signalingMethods.js    # Hub & Client method constants
│   │   ├── lifecycleMethods.js    # Connection lifecycle events
│   │   ├── ConnectionStates.js    # Connection state constants
│   │   ├── registerNotificationHandlers.js
│   │   └── unregisterNotificationHandlers.js
│   └── notificationService.js     # Expo notification wrapper
└── screens/
    └── CommonScreen/
        └── NotificationScreen/
            └── NotificationScreen.js  # Notification UI
```

### Data Flow

```
Server (SignalR Hub)
    ↓
SignalR Connection (signalRService)
    ↓
SignalR Context (SignalRProvider)
    ↓
Notification Context (NotificationProvider)
    ↓
Notification Handlers (registerNotificationHandlers)
    ↓
Local Notification (expo-notifications)
    ↓
UI Update (NotificationScreen)
```

## Prerequisites

### Dependencies

All required dependencies are already installed in `package.json`:

```json
{
  "@microsoft/signalr": "^8.0.7",
  "@react-native-async-storage/async-storage": "2.2.0",
  "expo-notifications": "~0.32.12",
  "expo-device": "~8.0.7"
}
```

### Permissions

The app automatically requests notification permissions when the NotificationContext initializes. Users can also manually enable notifications from the NotificationScreen.

## Environment Configuration

### Required Environment Variables

Create or update your `.env` file in the root of the project:

```env
# SignalR Hub URL (WebSocket endpoint)
EXPO_PUBLIC_HUB_URL=wss://your-api-domain.com/notification-hub

# SignalR Configuration (Optional)
EXPO_PUBLIC_SIGNALR_SERVER_TIMEOUT_MS=90000
EXPO_PUBLIC_SIGNALR_KEEPALIVE_MS=10000

# API Base URL
EXPO_PUBLIC_API_URL=https://your-api-domain.com/api
```

### Environment Variable Details

| Variable                                | Description                         | Default | Required |
| --------------------------------------- | ----------------------------------- | ------- | -------- |
| `EXPO_PUBLIC_HUB_URL`                   | WebSocket URL for SignalR hub       | -       | Yes      |
| `EXPO_PUBLIC_SIGNALR_SERVER_TIMEOUT_MS` | Server timeout in milliseconds      | 90000   | No       |
| `EXPO_PUBLIC_SIGNALR_KEEPALIVE_MS`      | Keep-alive interval in milliseconds | 10000   | No       |
| `EXPO_PUBLIC_API_URL`                   | Base URL for REST API calls         | -       | Yes      |

### Example Configuration

**Development:**

```env
EXPO_PUBLIC_HUB_URL=wss://dev-api.fitbridge.com/notification-hub
EXPO_PUBLIC_API_URL=https://dev-api.fitbridge.com/api
```

**Production:**

```env
EXPO_PUBLIC_HUB_URL=wss://api.fitbridge.com/notification-hub
EXPO_PUBLIC_API_URL=https://api.fitbridge.com/api
```

## Backend Requirements

### SignalR Hub Implementation

Your backend must implement a SignalR Hub with the following methods:

#### Server Methods (called from client)

```csharp
public class NotificationHub : Hub
{
    // Client can confirm receipt of notification
    public async Task ConfirmHandshake()
    {
        // Handle confirmation
    }

    // Client can join a group (e.g., user-specific notifications)
    public async Task AddToGroup(string groupName)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
    }

    // Client can leave a group
    public async Task RemoveFromGroup(string groupName)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
    }
}
```

#### Client Methods (called from server)

```csharp
// Send notification to specific client
await Clients.Client(connectionId).SendAsync("NotificationReceived", notification);

// Send notification to all clients in a group
await Clients.Group(groupName).SendAsync("NotificationReceived", notification);

// Send notification to all clients
await Clients.All.SendAsync("NotificationReceived", notification);
```

#### Notification Data Structure

The notification object sent from the server should follow this structure:

```json
{
  "id": "unique-notification-id",
  "title": "Notification Title",
  "message": "Notification message body",
  "body": "Alternative message field",
  "type": "booking|payment|promotion|system",
  "timestamp": "2025-10-10T12:00:00Z",
  "isRead": false,
  "data": {
    "screen": "BookingHistoryScreen",
    "params": { "bookingId": "123" }
  }
}
```

### Authentication

The SignalR connection automatically includes the JWT token from AsyncStorage:

```javascript
// Token is retrieved from AsyncStorage and sent with connection
const accessToken = await AsyncStorage.getItem("accessToken");

// Connection includes token in header
.withUrl(hubUrl, {
  accessTokenFactory: () => accessToken,
  // ...
})
```

Your backend should validate this token and associate the connection with the authenticated user.

### REST API Endpoints (To Be Implemented)

You'll need to implement these endpoints for full functionality:

```
GET  /api/notifications              # Get all notifications for user
GET  /api/notifications/:id          # Get specific notification
PUT  /api/notifications/:id/read     # Mark notification as read
PUT  /api/notifications/read-all     # Mark all as read
DELETE /api/notifications/:id        # Delete notification
POST /api/notifications/register-token  # Register Expo push token
```

## Usage Guide

### Provider Setup

The providers are already configured in `App.js`:

```javascript
<SignalRProvider>
  <NotificationProvider>{/* Your app content */}</NotificationProvider>
</SignalRProvider>
```

### Using the Notification Context

In any component, you can access notification functionality:

```javascript
import { useNotification } from "../context/NotificationContext";

function MyComponent() {
  const {
    notifications, // Array of notifications
    unreadCount, // Number of unread notifications
    refreshing, // Loading state
    expoPushToken, // Expo push token
    isSignalRConnected, // SignalR connection status
    fetchNotifications, // Refresh notifications
    markAsRead, // Mark single notification as read
    markAllAsRead, // Mark all as read
    deleteNotification, // Delete notification
  } = useNotification();

  // Use the context values and methods
}
```

### Using the SignalR Context

Access the SignalR service directly:

```javascript
import { useSignalR } from '../context/SignalRContext';

function MyComponent() {
  const { service: signalrService } = useSignalR();

  // Check connection status
  const status = signalrService.connectionStatus;
  console.log(status.state); // Connected, Connecting, Disconnected, etc.

  // Join a group
  await signalrService.addToGroup('user-123');

  // Leave a group
  await signalrService.removeFromGroup('user-123');

  // Invoke hub method
  await signalrService.invokeHubMethod('MethodName', arg1, arg2);

  // Listen for events
  signalrService.onEvent('CustomEvent', (data) => {
    console.log('Event received:', data);
  });
}
```

### Notification Types

The system supports different notification types with corresponding icons and colors:

| Type        | Icon     | Color   | Use Case                         |
| ----------- | -------- | ------- | -------------------------------- |
| `booking`   | calendar | #17a2b8 | Session bookings, appointments   |
| `payment`   | card     | #28a745 | Payment confirmations, receipts  |
| `promotion` | pricetag | #FF914D | Special offers, discounts        |
| `system`    | person   | #6f42c1 | Profile updates, system messages |

### Handling Navigation from Notifications

Update the `handleNotificationTap` function in `NotificationScreen.js`:

```javascript
const handleNotificationTap = (data) => {
  if (data.type === "booking") {
    navigation.navigate("BookingHistoryScreen", data.params);
  } else if (data.type === "payment") {
    navigation.navigate("TransactionHistoryScreen", data.params);
  }
  // Add more navigation logic as needed
};
```

## API Integration

### Fetching Notifications

Update the `fetchNotifications` function in `NotificationContext.js`:

```javascript
const fetchNotifications = useCallback(async () => {
  try {
    setRefreshing(true);

    const response = await request("GET", "/api/notifications");
    const notifications = response.items || response;

    setNotifications(notifications);

    const unread = notifications.filter((n) => !n.isRead).length;
    setUnreadCount(unread);

    console.log("Notifications fetched successfully");
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
  } finally {
    setRefreshing(false);
  }
}, []);
```

### Registering Push Token

Update the initialization in `NotificationContext.js`:

```javascript
// Send token to backend
if (token) {
  setExpoPushToken(token);
  console.log("Push token registered:", token);

  await request("POST", "/api/notifications/register-token", {
    token,
    deviceId: Device.deviceName,
    platform: Platform.OS,
  });
}
```

## Troubleshooting

### SignalR Connection Issues

**Problem: SignalR won't connect**

1. Verify `EXPO_PUBLIC_HUB_URL` is correct and uses `wss://` protocol
2. Check that the backend SignalR hub is running
3. Ensure the access token is valid in AsyncStorage
4. Check network connectivity

```javascript
// Add this to debug connection issues
signalrService.onEvent(
  LIFECYCLE_METHODS.ON_INITIAL_CONNECTION_FAILED,
  (error) => {
    console.error("Connection failed:", error);
  }
);
```

**Problem: Connection drops frequently**

- Adjust timeout values in environment variables
- Check backend SignalR configuration
- Verify network stability

### Notification Permission Issues

**Problem: Notifications not showing**

1. Check device notification settings
2. Verify permissions are granted:

```javascript
const permissions = await notificationService.checkPermissions();
console.log("Permission status:", permissions.status);
```

3. For Android, ensure notification channel is created (automatic in the service)

### Debugging Tips

1. **Enable debug banner in NotificationScreen:**

   - The debug banner is visible in development mode (`__DEV__`)
   - Shows SignalR connection status and push token

2. **Check SignalR logs:**

```javascript
// In signalRService.js, logs are automatically output
// Look for:
// - "SignalR: Connection connected"
// - "SignalR: Notification received"
// - "SignalR: Triggering callback"
```

3. **Test local notifications:**

```javascript
// Use NotificationTestHelper component (already in NotificationScreen)
// Or manually trigger:
await notificationService.presentNotification({
  title: "Test Notification",
  body: "This is a test",
  data: { type: "system" },
});
```

### Common Error Messages

| Error                               | Cause                  | Solution                              |
| ----------------------------------- | ---------------------- | ------------------------------------- |
| "HUB_URL not found"                 | Missing env variable   | Add `EXPO_PUBLIC_HUB_URL` to `.env`   |
| "Connection timeout"                | Server not responding  | Verify backend is running             |
| "Hub connection is not initialized" | Connection not started | Wait for connection or start manually |
| "Failed to get push token"          | Permission denied      | Request permissions from user         |

## Production Checklist

Before deploying to production:

- [ ] Set production `EXPO_PUBLIC_HUB_URL`
- [ ] Implement all backend API endpoints
- [ ] Test notification delivery on physical devices
- [ ] Configure push notification certificates (iOS) / FCM (Android)
- [ ] Test SignalR reconnection logic
- [ ] Implement proper error handling and user feedback
- [ ] Test notification navigation flows
- [ ] Verify notification persistence across app restarts
- [ ] Test with poor network conditions
- [ ] Configure proper logging for production

## Additional Resources

- [SignalR JavaScript Client Documentation](https://learn.microsoft.com/en-us/aspnet/core/signalr/javascript-client)
- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [React Context API](https://react.dev/reference/react/useContext)
- [WebSocket Protocol](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

## Support

For issues or questions:

1. Check this documentation
2. Review the notification-client-mobile reference implementation
3. Check SignalR and Expo Notifications official documentation
4. Contact the development team

---

Last Updated: October 10, 2025
Version: 1.0.0
