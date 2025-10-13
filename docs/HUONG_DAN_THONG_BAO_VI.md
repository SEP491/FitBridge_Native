# 🔔 Hướng Dẫn Sử Dụng Thông Báo FitBridge

## 🎯 Bạn Cần Làm Gì Tiếp Theo?

### Bước 1: Kiểm Tra Thông Báo (NGAY BÂY GIỜ)

#### Cách 1: Thêm Công Cụ Test Vào Màn Hình

Mở file bất kỳ (ví dụ: `HomeScreen.js`) và thêm dòng này:

```javascript
import NotificationTestHelper from "../components/NotificationTestHelper/NotificationTestHelper";

// Trong component của bạn, thêm dòng này:
{
  __DEV__ && <NotificationTestHelper />;
}
```

Ví dụ đầy đủ:

```javascript
export default function HomeScreen() {
  return (
    <ScrollView>
      {/* Nội dung hiện tại của bạn */}

      {/* THÊM DÒNG NÀY - Chỉ hiện khi đang phát triển */}
      {__DEV__ && <NotificationTestHelper />}
    </ScrollView>
  );
}
```

#### Sau đó làm gì?

1. Chạy app: `npm start`
2. Mở app trên điện thoại
3. Bạn sẽ thấy công cụ test màu đỏ với nhiều nút bấm
4. Nhấn các nút để test thông báo!

---

## 📱 Cách Test Thông Báo

### Test 1: Gửi Thông Báo Ngay Lập Tức

1. Mở công cụ test (NotificationTestHelper)
2. Nhấn vào các nút màu:

   - **Màu xanh dương (Booking)** - Thông báo đặt lịch
   - **Màu xanh lá (Payment)** - Thông báo thanh toán
   - **Màu cam (Promo)** - Thông báo khuyến mãi
   - **Màu tím (System)** - Thông báo hệ thống
   - **Màu đỏ (Fitness)** - Thông báo tập luyện

3. Bạn sẽ thấy thông báo xuất hiện ngay!

### Test 2: Tùy Chỉnh Nội Dung

1. Thay đổi "Notification Title" (Tiêu đề)
2. Thay đổi "Notification Body" (Nội dung)
3. Nhấn bất kỳ nút màu nào
4. Thông báo sẽ hiện với nội dung của bạn!

### Test 3: Hẹn Giờ Thông Báo

1. Nhấn nút "Schedule in 30 seconds"
2. Chờ 30 giây
3. Thông báo sẽ xuất hiện!

### Test 4: Thông Báo Hàng Ngày

1. Nhấn "Schedule Daily (9:00 AM)"
2. Mỗi ngày lúc 9 giờ sáng sẽ có thông báo

### Test 5: Badge (Số Đỏ Trên Icon)

1. Nhấn số 1, 5, 10, hoặc 99
2. Kiểm tra icon app - sẽ có số đỏ
3. Nhấn "Clear" để xóa

---

## 💻 Cách Gửi Thông Báo Trong Code

### Gửi Thông Báo Đơn Giản

```javascript
import notificationService from "../services/notificationService";

// Gửi ngay lập tức
await notificationService.presentNotification({
  title: "Chào mừng!",
  body: "Cảm ơn bạn đã sử dụng FitBridge",
  data: { type: "system" },
});
```

### Khi Đặt Lịch Thành Công

```javascript
// Sau khi khách hàng đặt lịch
await notificationService.presentNotification({
  title: "Đặt Lịch Thành Công",
  body: `Buổi tập với PT ${ptName} vào ${date}`,
  data: { type: "booking", bookingId: 123 },
});
```

### Khi Thanh Toán Thành Công

```javascript
// Sau khi thanh toán
await notificationService.presentNotification({
  title: "Thanh Toán Thành Công",
  body: `Bạn đã thanh toán ${amount}đ`,
  data: { type: "payment", transactionId: 456 },
});
```

### Nhắc Nhở Trước Buổi Tập

```javascript
// Nhắc nhở 1 tiếng trước buổi tập
const reminderTime = new Date(sessionTime);
reminderTime.setHours(reminderTime.getHours() - 1); // Trừ 1 tiếng

await notificationService.scheduleNotificationForDate(
  {
    title: "Chuẩn Bị Buổi Tập",
    body: "Buổi tập của bạn bắt đầu sau 1 tiếng!",
    data: { type: "booking", bookingId: 123 },
  },
  reminderTime
);
```

### Nhắc Nhở Hàng Ngày

```javascript
// Nhắc nhở tập luyện lúc 8 giờ sáng mỗi ngày
await notificationService.scheduleDailyNotification(
  {
    title: "Nhắc Nhở Tập Luyện",
    body: "Đừng quên tập luyện hôm nay nhé! 💪",
    data: { type: "fitness" },
  },
  8,
  0
); // 8 giờ, 0 phút
```

---

## 🎨 Các Loại Thông Báo

| Loại          | Màu        | Icon | Khi Nào Dùng            |
| ------------- | ---------- | ---- | ----------------------- |
| **booking**   | Xanh dương | 📅   | Đặt lịch, nhắc buổi tập |
| **payment**   | Xanh lá    | 💳   | Thanh toán thành công   |
| **promotion** | Cam        | 🎉   | Khuyến mãi, giảm giá    |
| **system**    | Tím        | ⚙️   | Cập nhật hệ thống       |
| **fitness**   | Đỏ         | 🏃   | Nhắc tập luyện          |

---

## 📋 Checklist - Bạn Cần Làm Gì?

### Bây Giờ (Hôm Nay)

- [ ] 1. Thêm `NotificationTestHelper` vào một màn hình
- [ ] 2. Chạy app và test thông báo
- [ ] 3. Thử gửi các loại thông báo khác nhau
- [ ] 4. Test trên điện thoại thật (QUAN TRỌNG - không chạy trên máy ảo!)

### Tuần Này

- [ ] 5. Kết nối với Backend API của bạn
- [ ] 6. Gửi token lên server
- [ ] 7. Thay thế dữ liệu giả bằng dữ liệu thật

### Trước Khi Release

- [ ] 8. Xóa `NotificationTestHelper` (chỉ dùng để test)
- [ ] 9. Tạo APNs key cho iOS (nếu muốn push notification)
- [ ] 10. Test trên nhiều thiết bị

---

## 🚀 Build App Để Test

**LƯU Ý QUAN TRỌNG**: Thông báo KHÔNG chạy trên máy ảo (simulator/emulator). Bạn PHẢI test trên điện thoại thật!

### iOS

```bash
npx eas build --platform ios --profile development
```

### Android

```bash
npx eas build --platform android --profile development
```

Sau khi build xong:

1. Cài app lên điện thoại
2. Mở app
3. Test thông báo bằng NotificationTestHelper

---

## 🔧 Các File Quan Trọng

### 1. Notification Service

**File**: `services/notificationService.js`  
**Chức năng**: Xử lý tất cả logic thông báo

**Các hàm hay dùng**:

```javascript
// Xin quyền và lấy token
await notificationService.registerForPushNotifications()

// Gửi thông báo ngay
await notificationService.presentNotification({title, body, data})

// Đặt lịch cho ngày/giờ cụ thể
await notificationService.scheduleNotificationForDate({...}, date)

// Đặt lịch hàng ngày
await notificationService.scheduleDailyNotification({...}, hour, minute)

// Đặt số badge
await notificationService.setBadgeCount(5)

// Hủy tất cả thông báo đã đặt lịch
await notificationService.cancelAllNotifications()
```

### 2. Màn Hình Thông Báo

**File**: `screens/CommonScreen/NotificationScreen/NotificationScreen.js`  
**Chức năng**: Hiển thị danh sách thông báo cho người dùng

Tính năng:

- ✅ Lọc theo đã đọc/chưa đọc
- ✅ Đánh dấu đã đọc
- ✅ Xóa thông báo
- ✅ Badge tự động cập nhật
- ✅ Kéo để refresh

### 3. Công Cụ Test

**File**: `components/NotificationTestHelper/NotificationTestHelper.js`  
**Chức năng**: Test thông báo khi đang phát triển

**QUAN TRỌNG**: Nhớ xóa trước khi release!

---

## ❓ Gặp Lỗi? Cách Fix

### Lỗi: "Must use physical device"

**Nguyên nhân**: Đang chạy trên máy ảo  
**Cách fix**: Build app và cài lên điện thoại thật

### Lỗi: Không thấy thông báo

**Cách fix**:

1. Kiểm tra đã cấp quyền chưa: Settings → FitBridge → Notifications
2. Đảm bảo đang test trên điện thoại thật
3. Thử gửi lại thông báo

### Lỗi: Badge không hiện

**iOS**: Settings → Notifications → FitBridge → Enable "Badge App Icon"  
**Android**: Tùy launcher (Samsung, OnePlus hỗ trợ tốt)

### Lỗi: Thông báo đã hẹn giờ không xuất hiện

**Cách fix**:

1. Kiểm tra danh sách: `await notificationService.getAllScheduledNotifications()`
2. Kiểm tra giờ trên điện thoại
3. Đảm bảo app có quyền chạy ngầm

---

## 📱 Ví Dụ Thực Tế

### Ví Dụ 1: Thông Báo Khi Đặt Lịch

```javascript
// Trong BookingScreen.js
const handleBookingSuccess = async (booking) => {
  // Gửi thông báo xác nhận
  await notificationService.presentNotification({
    title: "Đặt Lịch Thành Công",
    body: `Buổi tập với ${booking.ptName} vào ${booking.date}`,
    data: { type: "booking", bookingId: booking.id },
  });

  // Đặt nhắc nhở 1 tiếng trước
  const reminderTime = new Date(booking.datetime);
  reminderTime.setHours(reminderTime.getHours() - 1);

  await notificationService.scheduleNotificationForDate(
    {
      title: "Nhắc Nhở Buổi Tập",
      body: "Buổi tập bắt đầu sau 1 tiếng!",
      data: { type: "booking", bookingId: booking.id },
    },
    reminderTime
  );
};
```

### Ví Dụ 2: Thông Báo Thanh Toán

```javascript
// Trong PaymentScreen.js
const handlePaymentSuccess = async (payment) => {
  await notificationService.presentNotification({
    title: "Thanh Toán Thành Công",
    body: `Đã thanh toán ${payment.amount.toLocaleString("vi-VN")}đ cho ${
      payment.packageName
    }`,
    data: {
      type: "payment",
      transactionId: payment.id,
    },
  });
};
```

### Ví Dụ 3: Khuyến Mãi

```javascript
// Trong PromoScreen.js
const sendPromotion = async () => {
  await notificationService.presentNotification({
    title: "Ưu Đãi Đặc Biệt! 🎉",
    body: "Giảm 20% tất cả gói tập tuần này!",
    data: {
      type: "promotion",
      promoId: "SALE20",
    },
  });
};
```

---

## 🎓 Hướng Dẫn Từng Bước Chi Tiết

### BƯỚC 1: Thêm Test Helper (5 phút)

1. Mở file `screens/CommonScreen/HomeScreen/HomeScreen.js`

2. Thêm import ở đầu file:

```javascript
import NotificationTestHelper from "../../../components/NotificationTestHelper/NotificationTestHelper";
```

3. Thêm component trong render (ở cuối ScrollView):

```javascript
export default function HomeScreen() {
  return (
    <ScrollView>
      {/* Nội dung hiện tại */}

      {/* THÊM DÒNG NÀY */}
      {__DEV__ && <NotificationTestHelper />}
    </ScrollView>
  );
}
```

4. Lưu file và chạy app

### BƯỚC 2: Test Thông Báo (10 phút)

1. Mở app trên điện thoại
2. Kéo xuống để thấy NotificationTestHelper (màu đỏ)
3. Thử các tính năng:
   - Nhấn "Booking" → Thấy thông báo màu xanh
   - Nhấn "Payment" → Thấy thông báo màu xanh lá
   - Nhấn "Schedule in 30 seconds" → Chờ 30s
   - Nhấn số "5" → Thấy badge số 5 trên icon app

### BƯỚC 3: Dùng Trong Code Thật (20 phút)

1. Mở file bạn muốn gửi thông báo (ví dụ: `BookingScreen.js`)

2. Import service:

```javascript
import notificationService from "../../../services/notificationService";
```

3. Gọi hàm khi cần:

```javascript
const handleBooking = async () => {
  // Logic đặt lịch của bạn

  // Gửi thông báo
  await notificationService.presentNotification({
    title: "Đặt Lịch Thành Công",
    body: "Buổi tập của bạn đã được xác nhận",
    data: { type: "booking" },
  });
};
```

### BƯỚC 4: Kết Nối Backend (Tùy chọn)

Nếu bạn muốn gửi thông báo từ server:

1. Lấy push token:

```javascript
const token = await notificationService.registerForPushNotifications();
// Gửi token này lên server của bạn
```

2. Server sẽ dùng token này để gửi thông báo
3. Xem thêm tại `docs/NOTIFICATIONS_SETUP.md` (phần Backend Integration)

---

## 🎯 Tóm Tắt

### Đã Có Sẵn

✅ Service xử lý thông báo  
✅ Màn hình hiển thị thông báo  
✅ Công cụ test  
✅ Tài liệu đầy đủ

### Bạn Cần Làm

1. ⚡ **NGAY**: Thêm NotificationTestHelper và test
2. 📱 **HÔM NAY**: Build app lên điện thoại thật
3. 💻 **TUẦN NÀY**: Dùng thông báo trong code
4. 🚀 **TRƯỚC RELEASE**: Xóa test helper

---

## 📞 Cần Giúp Đỡ?

**Lỗi gì cũng được, cứ hỏi!**

Các tài liệu khác:

- `NOTIFICATIONS_SETUP.md` - Hướng dẫn setup chi tiết (English)
- `NOTIFICATION_TESTING.md` - Hướng dẫn test (English)
- `NOTIFICATIONS_QUICKSTART.md` - Tham khảo nhanh (English)

---

**Chúc bạn thành công! 🎉**

Nếu còn thắc mắc gì, cứ hỏi tôi nhé!
