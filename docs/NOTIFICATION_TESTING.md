# 🔔 Notification Testing Guide

## Quick Test Instructions

To test notifications in your app, temporarily add the test helper to any screen:

### Option 1: Add to Home Screen (Quick Test)

```javascript
// In HomeScreen.js
import NotificationTestHelper from "../../components/NotificationTestHelper/NotificationTestHelper";

export default function HomeScreen() {
  return (
    <View>
      {/* Your existing content */}

      {/* Temporary: Remove in production */}
      {__DEV__ && <NotificationTestHelper />}
    </View>
  );
}
```

### Option 2: Create a Test Screen

```javascript
// In Navigator.js, add a new screen
import NotificationTestHelper from "../components/NotificationTestHelper/NotificationTestHelper";

// Inside your stack navigator
<Stack.Screen
  name="NotificationTest"
  component={NotificationTestHelper}
  options={{
    headerShown: true,
    title: "Test Notifications",
  }}
/>;
```

Then navigate to it from your app:

```javascript
navigation.navigate("NotificationTest");
```

## 📱 Testing Steps

### 1. Test Immediate Notifications

1. Open the NotificationTestHelper
2. Tap any of the colored type buttons (Booking, Payment, Promo, etc.)
3. You should see a notification appear immediately

### 2. Test Custom Messages

1. Edit the "Notification Title" input
2. Edit the "Notification Body" input
3. Tap any type button to send with custom text

### 3. Test Scheduled Notifications

1. Tap "Schedule in 30 seconds"
2. Wait 30 seconds
3. You should see the notification appear
4. Use "View Scheduled" to see all pending notifications

### 4. Test Daily Notifications

1. Tap "Schedule Daily (9:00 AM)"
2. The notification will appear every day at 9:00 AM
3. Check scheduled list to verify

### 5. Test Badge Count

1. Tap any badge number (1, 5, 10, 99)
2. Check your app icon - should show badge
3. Tap "Clear" to remove badge

### 6. Test Permissions

1. Tap "Request Permissions"
2. Grant permissions when prompted
3. You should see your push token in the alert

## 🎯 What to Test

### iOS Specific

- [ ] Notification appears in notification center
- [ ] Sound plays when notification arrives
- [ ] Badge count updates on app icon
- [ ] Tapping notification opens the app
- [ ] Notifications appear when app is:
  - [ ] Foreground (open)
  - [ ] Background (minimized)
  - [ ] Closed (terminated)

### Android Specific

- [ ] Notification appears in notification drawer
- [ ] Sound plays when notification arrives
- [ ] Vibration works
- [ ] Icon appears correctly
- [ ] Color matches app theme (#ED2A46)
- [ ] Notifications appear when app is:
  - [ ] Foreground (open)
  - [ ] Background (minimized)
  - [ ] Closed (terminated)

## 🐛 Troubleshooting

### "Must use physical device for Push Notifications"

- **Solution**: Notifications don't work in iOS Simulator or Android Emulator
- **Action**: Test on a real device

### No notification appears

1. Check permissions are granted
2. Verify you're on a physical device
3. Check notification settings on device
4. For iOS: Settings → FitBridge → Notifications → Allow
5. For Android: Settings → Apps → FitBridge → Notifications → Enabled

### Badge doesn't update

- **iOS**: Ensure "Badge App Icon" is enabled in Settings
- **Android**: Not all launchers support badges (Samsung, OnePlus do)

### Scheduled notification doesn't appear

1. Use "View Scheduled" to verify it's queued
2. Check device time/timezone
3. Ensure app has background permissions

## 📊 Test Scenarios

### Booking Flow

```javascript
// When user books a session
await notificationService.scheduleNotificationForDate(
  {
    title: "Session Confirmed",
    body: `Your session with ${ptName} on ${date}`,
    data: { type: "booking", bookingId: 123 },
  },
  bookingDate
);
```

### Payment Success

```javascript
// After successful payment
await notificationService.presentNotification({
  title: "Payment Successful",
  body: `$${amount} paid for ${packageName}`,
  data: { type: "payment", transactionId: 456 },
});
```

### Daily Reminder

```javascript
// Set up daily fitness reminder
await notificationService.scheduleDailyNotification(
  {
    title: "Daily Fitness Check",
    body: "Don't forget your workout today! 💪",
    data: { type: "fitness" },
  },
  8,
  0
); // 8:00 AM
```

### Session Reminder

```javascript
// 1 hour before session
const reminderTime = new Date(sessionTime);
reminderTime.setHours(reminderTime.getHours() - 1);

await notificationService.scheduleNotificationForDate(
  {
    title: "Session Starting Soon",
    body: "Your session starts in 1 hour",
    data: { type: "booking", bookingId: 123 },
  },
  reminderTime
);
```

## 🔥 Production Testing

### Test on Production Build

1. Build for device:

```bash
# iOS
npx eas build --platform ios --profile development

# Android
npx eas build --platform android --profile development
```

2. Install on device
3. Run the same tests
4. Verify all notification types work

### Test Push Notifications (Backend Required)

1. Get your push token from the test helper
2. Use [Expo Push Tool](https://expo.dev/notifications)
3. Send a test notification
4. Verify it arrives on your device

Example payload:

```json
{
  "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "title": "Backend Test",
  "body": "This notification came from the backend!",
  "data": {
    "type": "system",
    "userId": 123
  }
}
```

## ⚠️ Important Notes

1. **Remove Test Helper in Production**

   ```javascript
   // Only show in development
   {
     __DEV__ && <NotificationTestHelper />;
   }
   ```

2. **Rate Limiting**

   - Don't spam notifications during testing
   - iOS has limits on notification frequency
   - Excessive notifications can get your app flagged

3. **Battery Impact**

   - Too many scheduled notifications drain battery
   - Always cancel old/unnecessary notifications

4. **User Experience**
   - Test notification timing (not too early/late)
   - Ensure messages are clear and actionable
   - Use appropriate icons and colors

## 📚 Next Steps After Testing

1. ✅ Verify all notification types work
2. ✅ Test on both iOS and Android
3. ✅ Connect to backend API
4. ✅ Add notification handling in Navigator
5. ✅ Implement notification settings screen
6. ✅ Add analytics tracking
7. ✅ Remove test helper from production build

---

**Happy Testing! 🎉**

For issues or questions, check:

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [NOTIFICATIONS_SETUP.md](./NOTIFICATIONS_SETUP.md)
