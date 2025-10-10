# Push Notifications Setup Guide

## 📱 Expo Notifications Integration

This guide covers the implementation of push notifications in FitBridge using `expo-notifications`.

## ✅ Installation Complete

The following packages have been installed:

- ✅ `expo-notifications` - For iOS and Android push notifications
- ✅ `expo-device` - For device detection

## 🔧 Configuration

### app.json

The notification configuration has been added to `app.json`:

```json
{
  "notification": {
    "icon": "./assets/icon.png",
    "color": "#ED2A46",
    "androidMode": "default",
    "androidCollapsedTitle": "#{unread_notifications} new notifications"
  },
  "plugins": [
    [
      "expo-notifications",
      {
        "icon": "./assets/icon.png",
        "color": "#ED2A46",
        "sounds": ["./assets/notification-sound.wav"],
        "mode": "production"
      }
    ]
  ]
}
```

### iOS Specific Setup

For iOS production notifications, you need:

1. **Apple Developer Account** - Enroll in Apple Developer Program ($99/year)
2. **APNs Key** - Create in Apple Developer Console
3. **Add to EAS** - Upload APNs key to Expo

#### Steps to get APNs Key:

1. Go to [Apple Developer Console](https://developer.apple.com/account/resources/authkeys/list)
2. Click "+" to create a new key
3. Select "Apple Push Notifications service (APNs)"
4. Download the `.p8` file (only one chance!)
5. Note the Key ID and Team ID
6. Upload to EAS:
   ```bash
   npx eas credentials
   ```

## 📂 Files Created

### 1. Notification Service (`services/notificationService.js`)

Provides comprehensive notification functionality:

```javascript
import notificationService from "../services/notificationService";

// Register for push notifications
const token = await notificationService.registerForPushNotifications();

// Schedule a notification
await notificationService.scheduleNotification({
  title: "Booking Reminder",
  body: "Your session starts in 1 hour",
  data: { type: "booking", id: 123 },
});

// Set badge count
await notificationService.setBadgeCount(5);
```

### 2. NotificationScreen (`screens/CommonScreen/NotificationScreen/NotificationScreen.js`)

Features:

- ✅ Permission request banner
- ✅ Real-time notification listening
- ✅ Badge count management
- ✅ Filter by read/unread
- ✅ Swipe to delete
- ✅ Mark all as read
- ✅ Beautiful UI with animations

## 🎯 Key Features Implemented

### 1. Permission Handling

- Automatic permission request on app start
- Visual banner when permissions are denied
- One-tap permission enable button

### 2. Notification Listeners

```javascript
// Listen for notifications while app is open
notificationListener.current =
  notificationService.addNotificationReceivedListener((notification) => {
    // Add to notification list
  });

// Listen for notification taps
responseListener.current =
  notificationService.addNotificationResponseReceivedListener((response) => {
    // Navigate to relevant screen
  });
```

### 3. Badge Management

- Auto-updates badge count on mark as read
- Clears badge when all read
- Syncs with system badge

### 4. Local Notifications

Schedule reminders for:

- Session start times
- Payment confirmations
- Daily fitness goals
- Promotional offers

## 🚀 Usage Examples

### Send a Local Notification

```javascript
import notificationService from "../services/notificationService";

// Immediate notification
await notificationService.presentNotification({
  title: "Welcome to FitBridge!",
  body: "Start your fitness journey today",
  data: { screen: "Home" },
});

// Schedule for later
const sessionDate = new Date();
sessionDate.setHours(10, 0, 0); // 10:00 AM

await notificationService.scheduleNotificationForDate(
  {
    title: "Session Reminder",
    body: "Your PT session starts in 30 minutes",
    data: { type: "booking", id: 123 },
  },
  sessionDate
);

// Daily recurring notification
await notificationService.scheduleDailyNotification(
  {
    title: "Daily Reminder",
    body: "Don't forget your workout today!",
    data: { type: "fitness" },
  },
  8,
  0
); // 8:00 AM daily
```

### Handle Notification Tap

```javascript
// In NotificationScreen.js
const handleNotificationTap = (data) => {
  if (data.type === "booking") {
    navigation.navigate("BookingHistoryScreen");
  } else if (data.type === "payment") {
    navigation.navigate("TransactionHistoryScreen");
  } else if (data.type === "voucher") {
    navigation.navigate("VoucherScreen");
  }
};
```

## 🔔 Backend Integration

### 1. Register Device Token

When a user logs in, send their Expo push token to your backend:

```javascript
// In notificationService.js - sendTokenToBackend method
async sendTokenToBackend(token) {
  try {
    await request.post('/api/notifications/register', {
      token: token,
      platform: Platform.OS,
      userId: currentUser.id
    });
  } catch (error) {
    console.error('Error registering token:', error);
  }
}
```

### 2. Send Push from Backend

Your backend can send notifications using Expo's Push API:

```javascript
// Backend example (Node.js)
const { Expo } = require("expo-server-sdk");
const expo = new Expo();

async function sendPushNotification(pushToken, title, body, data) {
  const messages = [
    {
      to: pushToken,
      sound: "default",
      title: title,
      body: body,
      data: data,
      badge: 1,
    },
  ];

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (let chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error(error);
    }
  }

  return tickets;
}
```

## 📱 Testing on Physical Device

### iOS Testing

1. Build development client:

   ```bash
   npx eas build --platform ios --profile development
   ```

2. Install on your iOS device

3. Test notifications:
   ```javascript
   // In your app
   await notificationService.presentNotification({
     title: "Test Notification",
     body: "This is a test!",
   });
   ```

### Android Testing

1. Build development client:

   ```bash
   npx eas build --platform android --profile development
   ```

2. Install APK on Android device

3. Test notifications (same as iOS)

## 🎨 Notification Types

The app supports different notification types with unique styling:

| Type        | Icon     | Color            | Use Case                         |
| ----------- | -------- | ---------------- | -------------------------------- |
| `booking`   | calendar | Blue (#17a2b8)   | Session confirmations, reminders |
| `payment`   | card     | Green (#28a745)  | Payment confirmations            |
| `promotion` | pricetag | Orange (#FF914D) | Special offers, discounts        |
| `system`    | person   | Purple (#6f42c1) | Profile updates, settings        |
| `fitness`   | alarm    | Red (#ED2A46)    | Daily goals, achievements        |

## 🐛 Troubleshooting

### Notifications not appearing on iOS

1. Check permissions: Settings → FitBridge → Notifications
2. Verify APNs key is uploaded to EAS
3. Rebuild app after adding notification plugin

### Badge not updating

```javascript
// Manually sync badge count
const unreadCount = notifications.filter((n) => !n.isRead).length;
await notificationService.setBadgeCount(unreadCount);
```

### Permission denied

- User must manually enable in device settings
- Show helpful message with deep link to settings:

```javascript
import { Linking } from "react-native";
Linking.openSettings();
```

## 📚 Additional Resources

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Push Notification Guide](https://docs.expo.dev/push-notifications/overview/)
- [APNs Setup](https://docs.expo.dev/push-notifications/push-notifications-setup/#ios)
- [Expo Push Tool](https://expo.dev/notifications) - Test sending notifications

## 🔐 Security Notes

1. **Never expose push tokens** - Store securely in backend
2. **Validate notification data** - Sanitize before displaying
3. **Rate limiting** - Prevent spam on backend
4. **User preferences** - Allow users to customize notification settings

## ✨ Next Steps

1. **Connect to Backend API** - Replace mock data with real API calls
2. **Add Notification Settings** - Let users control notification types
3. **Rich Notifications** - Add images, actions, custom sounds
4. **Analytics** - Track notification open rates
5. **A/B Testing** - Test different notification strategies

---

**Implementation Status**: ✅ Complete
**Ready for Production**: ⚠️ Requires APNs key for iOS
**Last Updated**: October 10, 2025
