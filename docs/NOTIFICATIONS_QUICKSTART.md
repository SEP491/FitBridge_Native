# 🚀 Quick Start - Notifications

## 30-Second Setup

### 1. Test Notifications Now

Add to any screen (e.g., `HomeScreen.js`):

```javascript
import NotificationTestHelper from "../components/NotificationTestHelper/NotificationTestHelper";

// Inside your component
{
  __DEV__ && <NotificationTestHelper />;
}
```

### 2. Send Your First Notification

```javascript
import notificationService from "../services/notificationService";

// Simple notification
await notificationService.presentNotification({
  title: "Hello!",
  body: "Your first notification",
  data: { type: "system" },
});
```

### 3. Test on Device

```bash
# Build and install
npx eas build --platform ios --profile development
# or
npx eas build --platform android --profile development
```

## Common Use Cases

### 📅 Booking Confirmed

```javascript
await notificationService.presentNotification({
  title: "Booking Confirmed",
  body: `Session with ${ptName} on ${date}`,
  data: { type: "booking", bookingId: 123 },
});
```

### 💳 Payment Success

```javascript
await notificationService.presentNotification({
  title: "Payment Successful",
  body: `$${amount} paid successfully`,
  data: { type: "payment", transactionId: 456 },
});
```

### ⏰ Session Reminder

```javascript
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

### 🔔 Daily Reminder

```javascript
await notificationService.scheduleDailyNotification(
  {
    title: "Daily Fitness Check",
    body: "Don't forget your workout! 💪",
    data: { type: "fitness" },
  },
  9,
  0
); // 9:00 AM
```

## API Reference

### Main Methods

```javascript
// Register for push
const token = await notificationService.registerForPushNotifications();

// Send now
await notificationService.presentNotification({title, body, data});

// Schedule for date
await notificationService.scheduleNotificationForDate({...}, date);

// Daily recurring
await notificationService.scheduleDailyNotification({...}, hour, minute);

// Badge count
await notificationService.setBadgeCount(5);

// Cancel all
await notificationService.cancelAllNotifications();
```

## Files You Need to Know

| File                                                          | Purpose                  |
| ------------------------------------------------------------- | ------------------------ |
| `services/notificationService.js`                             | Core notification logic  |
| `screens/.../NotificationScreen.js`                           | UI to view notifications |
| `components/NotificationTestHelper/NotificationTestHelper.js` | Testing tool             |
| `app.json`                                                    | Configuration            |

## Troubleshooting

**No notifications?**

1. Using physical device? (Required)
2. Permissions granted?
3. Check `await notificationService.checkPermissions()`

**Badge not working?**

- iOS: Enable in Settings → Notifications → Badge
- Android: Depends on launcher (Samsung/OnePlus support it)

**Scheduled notification didn't fire?**

- Check: `await notificationService.getAllScheduledNotifications()`
- Verify device time/timezone

## Production Checklist

- [ ] Remove `NotificationTestHelper` from production
- [ ] Set up APNs key (iOS)
- [ ] Configure FCM (Android)
- [ ] Connect to backend API
- [ ] Test on real devices
- [ ] Add notification settings screen

## Need Help?

📖 Full docs: `docs/NOTIFICATIONS_SETUP.md`  
🧪 Testing guide: `docs/NOTIFICATION_TESTING.md`  
📊 Summary: `docs/NOTIFICATIONS_SUMMARY.md`

---

**You're ready to go! 🎉**
