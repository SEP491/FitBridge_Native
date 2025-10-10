# SignalR Integration Quick Reference

## 🚀 What Was Implemented

Based on the `notification-client-mobile` project, I've implemented a complete SignalR + Expo Notifications system for FitBridge_Native.

## 📁 Files Created

### Context Layer

1. **`context/SignalRContext.js`**

   - Manages SignalR connection lifecycle
   - Provides `useSignalR()` hook
   - Automatically cleans up on unmount

2. **`context/NotificationContext.js`**
   - Manages notification state
   - Integrates SignalR + Expo Notifications
   - Provides `useNotification()` hook
   - Handles real-time notification reception

### Services Layer

3. **`services/signalR/lifecycleMethods.js`**

   - Connection lifecycle event constants
   - Events: onConnected, onDisconnected, onReconnecting, etc.

4. **`services/signalR/registerNotificationHandlers.js`**

   - Registers SignalR event handlers for notifications
   - Listens for "NotificationReceived" events

5. **`services/signalR/unregisterNotificationHandlers.js`**
   - Cleanup function for notification handlers

### Documentation

6. **`docs/SIGNALR_NOTIFICATIONS_SETUP.md`**

   - Complete setup guide
   - Backend requirements
   - API integration instructions
   - Troubleshooting guide

7. **`.env.example`**
   - Environment variable template

## 🔧 Files Modified

1. **`App.js`**

   - Added `SignalRProvider` wrapper
   - Added `NotificationProvider` wrapper

2. **`services/signalR/signalingMethods.js`**

   - Added `NOTIFICATION_RECEIVED` to CLIENT_METHODS
   - Added `CONFIRM_HANDSHAKE` to HUB_METHODS
   - Added `ADD_TO_GROUP` and `REMOVE_FROM_GROUP`

3. **`screens/CommonScreen/NotificationScreen/NotificationScreen.js`**
   - Integrated with NotificationContext
   - Integrated with SignalRContext
   - Added SignalR connection status indicator
   - Connected to real-time notification system

## 🎯 How It Works

### 1. Initialization Flow

```
App starts
  ↓
SignalRProvider initializes signalRService
  ↓
NotificationProvider initializes
  ↓
  → Registers for push notifications
  → Starts SignalR connection (if authenticated)
  → Sets up notification handlers
  ↓
NotificationScreen subscribes to notification updates
```

### 2. Receiving Notifications

```
Server sends notification via SignalR
  ↓
registerNotificationHandlers catches "NotificationReceived"
  ↓
NotificationContext processes notification
  ↓
  → Adds to local state
  → Shows local push notification
  → Updates unread count
  → Confirms receipt to server
  ↓
NotificationScreen UI updates automatically
```

## 🔑 Usage Examples

### In Any Component

```javascript
import { useNotification } from "../context/NotificationContext";
import { useSignalR } from "../context/SignalRContext";

function MyComponent() {
  const {
    notifications,
    unreadCount,
    isSignalRConnected,
    fetchNotifications,
    markAsRead,
  } = useNotification();

  const { service } = useSignalR();

  return (
    <View>
      <Text>Unread: {unreadCount}</Text>
      <Text>SignalR: {isSignalRConnected ? "✓" : "✗"}</Text>
    </View>
  );
}
```

### Join a SignalR Group

```javascript
import { useSignalR } from "../context/SignalRContext";

function UserProfile({ userId }) {
  const { service } = useSignalR();

  useEffect(() => {
    // Join user-specific notification group
    service.addToGroup(`user-${userId}`);

    return () => {
      service.removeFromGroup(`user-${userId}`);
    };
  }, [userId]);
}
```

## 🌐 Backend Requirements

### Environment Variables Needed

```env
EXPO_PUBLIC_HUB_URL=wss://your-api.com/notification-hub
EXPO_PUBLIC_API_URL=https://your-api.com/api
```

### SignalR Hub Methods

Your backend Hub should implement:

**Server Methods (callable from client):**

- `ConfirmHandshake()` - Confirm notification receipt
- `AddToGroup(string groupName)` - Join a group
- `RemoveFromGroup(string groupName)` - Leave a group

**Client Methods (called from server):**

- `NotificationReceived` - Send notification to client

### Example Backend Code

```csharp
public class NotificationHub : Hub
{
    public async Task ConfirmHandshake()
    {
        await Task.CompletedTask;
    }

    public async Task AddToGroup(string groupName)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
    }

    public async Task RemoveFromGroup(string groupName)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
    }
}

// Sending notification from your service
public async Task SendNotificationToUser(string userId, NotificationDto notification)
{
    await _hubContext.Clients.User(userId)
        .SendAsync("NotificationReceived", notification);
}
```

## 📊 Notification Data Structure

```javascript
{
  id: "unique-id",
  title: "Notification Title",
  message: "Body text",
  type: "booking|payment|promotion|system",
  timestamp: "2025-10-10T12:00:00Z",
  isRead: false,
  data: {
    screen: "BookingDetailScreen",
    params: { bookingId: "123" }
  }
}
```

## ✅ Testing Checklist

### Before Testing

- [ ] Backend SignalR Hub is running
- [ ] Environment variables are configured
- [ ] User is authenticated (has valid token)
- [ ] Using physical device (for push notifications)

### Test Steps

1. Open NotificationScreen
2. Check debug banner shows "SignalR: Connected ✓"
3. Send notification from backend
4. Verify notification appears in app
5. Tap notification → should mark as read
6. Test with app in background/foreground/closed

## 🐛 Troubleshooting

### SignalR Not Connecting

```javascript
// Check connection status
import { useSignalR } from "../context/SignalRContext";

const { service } = useSignalR();
console.log("Status:", service.connectionStatus);
// Should show: { state: 'Connected', connectionId: '...' }
```

**Common Issues:**

- Missing `EXPO_PUBLIC_HUB_URL` in .env
- Backend not running
- Invalid token in AsyncStorage
- Incorrect WebSocket URL (must use wss://)

### Notifications Not Showing

```javascript
// Check permissions
import notificationService from "../services/notificationService";

const perms = await notificationService.checkPermissions();
console.log("Permissions:", perms);
```

**Common Issues:**

- Permissions not granted
- Using simulator (use physical device)
- Background app refresh disabled

## 📱 Next Steps

1. **Configure Environment**

   ```bash
   cp .env.example .env
   # Edit .env with your SignalR Hub URL
   ```

2. **Test Connection**

   - Run app
   - Open NotificationScreen
   - Check debug banner

3. **Implement API Endpoints**

   - GET /api/notifications
   - PUT /api/notifications/:id/read
   - DELETE /api/notifications/:id
   - POST /api/notifications/register-token

4. **Update NotificationContext**

   - Uncomment API calls in `fetchNotifications()`
   - Implement `markAsRead()` API call
   - Implement `deleteNotification()` API call

5. **Add Navigation Logic**
   - Update `handleNotificationTap()` in NotificationScreen
   - Navigate to appropriate screens based on notification type

## 📚 Documentation

For complete details, see:

- **Setup Guide:** `docs/SIGNALR_NOTIFICATIONS_SETUP.md`
- **Existing Docs:** `docs/NOTIFICATIONS_SETUP.md`

## 🎨 Customization

### Add Custom Notification Type

1. Add to signalingMethods.js if needed
2. Update getIconForType() in NotificationScreen
3. Update getColorForType() in NotificationScreen

### Add Custom SignalR Event

1. Add method to CLIENT_METHODS in signalingMethods.js
2. Register handler in registerNotificationHandlers.js
3. Listen in NotificationContext

## 🔄 Differences from notification-client-mobile

| Feature            | notification-client-mobile         | FitBridge_Native                     |
| ------------------ | ---------------------------------- | ------------------------------------ |
| Router             | Expo Router                        | React Navigation                     |
| Notification fetch | notificationApi.getNotifications() | request("GET", "/api/notifications") |
| Auth check         | authUtils.isAuthenticated()        | authService.validateToken()          |
| Layout             | Expo Router Layout                 | Provider in App.js                   |
| State management   | Same (Context API)                 | Same (Context API)                   |

## 🎉 What's Ready to Use

✅ SignalR connection management  
✅ Real-time notification reception  
✅ Local push notifications  
✅ Notification state management  
✅ UI integration  
✅ Connection status monitoring  
✅ Automatic reconnection  
✅ Group management  
✅ Token authentication  
✅ Debug tools

## 🚧 What Needs Backend Implementation

⏳ GET /api/notifications endpoint  
⏳ PUT /api/notifications/:id/read endpoint  
⏳ DELETE /api/notifications/:id endpoint  
⏳ POST /api/notifications/register-token endpoint  
⏳ SignalR Hub deployment  
⏳ Push notification server (Expo backend)

---

**Created:** October 10, 2025  
**Based on:** notification-client-mobile reference implementation  
**Status:** Ready for backend integration
