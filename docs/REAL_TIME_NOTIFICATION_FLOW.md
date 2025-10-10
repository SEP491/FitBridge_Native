# Real-Time Notification Flow

## Overview

When your server pushes a notification, here's the complete flow:

## Step-by-Step Flow

### 1. Server Sends Notification via SignalR

```
Server → SignalR Hub → Client (Your App)
```

### 2. SignalR Receives the Notification

**File**: `services/signalR/registerNotificationHandlers.js`

- The `connection.on(CLIENT_METHODS.NOTIFICATION_RECEIVED)` handler catches it
- Triggers callback with notification data

### 3. NotificationContext Processes It

**File**: `context/NotificationContext.js`

The following happens in sequence:

#### a. Update Local State

```javascript
setNotifications((prev) => [notification, ...prev]);
setUnreadCount((prev) => prev + 1);
```

#### b. Show Visual Notification

```javascript
await notificationService.presentNotification({
  title: notification.title || "New Notification",
  body: notification.message || notification.body,
  data: notification,
});
```

This shows a local notification banner even when app is in foreground!

#### c. Confirm Receipt to Server

```javascript
await signalrService.invokeHubMethod(HUB_METHODS.CONFIRM_HANDSHAKE);
```

#### d. Refresh from Server

```javascript
await fetchNotifications();
```

This ensures your local state is in sync with the server.

## Debugging Checklist

### ✅ When Server Pushes Notification, You Should See:

1. **🔔 SignalR: Real-time notification received!**

   - This means SignalR received the notification

2. **📝 Adding notification to state**

   - State is being updated

3. **📊 Incrementing unread count: X**

   - Unread count is increasing

4. **📢 Presenting local notification...**

   - About to show notification banner

5. **✅ Local notification presented successfully**

   - Notification banner should appear NOW

6. **✅ Confirmed notification receipt to server**

   - Server knows you got it

7. **🔄 Refreshing notifications from server...**

   - Syncing with server

8. **📱 Foreground notification received:**
   - Additional confirmation the notification is visible

### ❌ If You Don't See Notifications:

1. **Check SignalR Connection**

   ```javascript
   // In your app, log this:
   console.log("SignalR Connected:", isSignalRConnected);
   console.log("Connection Status:", signalrService.connectionStatus);
   ```

2. **Check Notification Permissions**

   ```javascript
   const perms = await notificationService.checkPermissions();
   console.log("Permissions:", perms);
   ```

3. **Check Server Event Name**

   - Make sure server sends event named: `"NotificationReceived"`
   - Match exactly with `CLIENT_METHODS.NOTIFICATION_RECEIVED`

4. **Check Notification Data Format**
   ```javascript
   // Server should send something like:
   {
     id: "123",
     title: "New Message",
     message: "You have a new message",
     body: "You have a new message", // fallback
     timestamp: 1234567890,
     isRead: false
   }
   ```

## Testing Real-Time Notifications

### Method 1: Using SignalR Test Client

```javascript
// In your server-side code or test tool
await hubContext.Clients.User(userId).SendAsync("NotificationReceived", {
  id: "test-123",
  title: "Test Notification",
  message: "This is a test from server",
  timestamp: Date.now(),
  isRead: false,
});
```

### Method 2: Test Locally

Add this to your app temporarily:

```javascript
// In NotificationContext.js or any component
const testNotification = async () => {
  await notificationService.presentNotification({
    title: "Test Local Notification",
    body: "Testing notification display",
    data: { test: true },
  });
};

// Call it on button press
```

## Expected Visual Result

When notification arrives:

- **Banner appears** at top of screen (iOS) or notification area (Android)
- **Sound plays** (if configured)
- **Badge count updates** (if visible in UI)
- **Notification list refreshes** (if viewing NotificationScreen)

## Common Issues

### Notification Arrives But No Banner Shows

- Check `Notifications.setNotificationHandler` configuration
- Ensure `shouldShowAlert: true`
- Check device notification settings

### SignalR Never Receives Notification

- Check server is sending to correct user/group
- Verify event name matches exactly
- Check connection state before server sends

### Notification Shows But State Doesn't Update

- Check `onEvent` listener is registered
- Verify state updates in callback
- Check for re-render issues

## Configuration Files

### Expo Notification Configuration

**File**: `app.json`

```json
{
  "expo": {
    "notification": {
      "icon": "./assets/icon.png",
      "color": "#000000",
      "androidMode": "default",
      "androidCollapsedTitle": "FitBridge"
    }
  }
}
```

### Android Notification Channel

**File**: `services/notificationService.js`

```javascript
await Notifications.setNotificationChannelAsync("default", {
  name: "default",
  importance: Notifications.AndroidImportance.MAX,
  vibrationPattern: [0, 250, 250, 250],
  lightColor: "#ED2A46",
});
```

## Summary

Your real-time notification system works like this:

1. **SignalR** receives it from server → logs: 🔔
2. **State** gets updated → logs: 📝 📊
3. **Banner** appears on screen → logs: 📢 ✅
4. **Server** gets confirmation → logs: ✅
5. **Sync** with server → logs: 🔄

All the emojis in console logs help you track the flow! 🎉
