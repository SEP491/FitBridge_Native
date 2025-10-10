# 📊 Sơ Đồ Hoạt Động - Hệ Thống Thông Báo

## 🎯 Tổng Quan

```
┌─────────────────────────────────────────────────────────────┐
│                     HỆ THỐNG THÔNG BÁO                      │
│                         FitBridge                            │
└─────────────────────────────────────────────────────────────┘

        ┌──────────────┐         ┌──────────────┐
        │   Bạn Viết   │         │  expo-       │
        │     Code     │────────▶│ notifications│
        └──────────────┘         └──────────────┘
              │                         │
              │                         │
              ▼                         ▼
        ┌──────────────┐         ┌──────────────┐
        │ notification │         │   Người      │
        │   Service    │────────▶│   Dùng       │
        └──────────────┘         └──────────────┘
```

---

## 📱 Luồng Hoạt Động Chi Tiết

### 1️⃣ Gửi Thông Báo Ngay

```
Bạn viết code
    │
    │  await notificationService.presentNotification({
    │    title: "Đặt lịch thành công",
    │    body: "Buổi tập vào 10h sáng mai"
    │  });
    │
    ▼
expo-notifications nhận lệnh
    │
    ▼
Thông báo xuất hiện trên màn hình ✓
```

### 2️⃣ Hẹn Giờ Thông Báo

```
Bạn đặt lịch
    │
    │  const reminderTime = new Date();
    │  reminderTime.setHours(sessionTime - 1);
    │
    │  await notificationService.scheduleNotificationForDate({
    │    title: "Nhắc nhở",
    │    body: "Còn 1 tiếng nữa!"
    │  }, reminderTime);
    │
    ▼
Hệ thống lưu lại
    │
    ▼
Đến giờ → Thông báo xuất hiện ✓
```

### 3️⃣ Thông Báo Hàng Ngày

```
Đặt lịch 1 lần
    │
    │  await notificationService.scheduleDailyNotification({
    │    title: "Chào buổi sáng",
    │    body: "Đừng quên tập!"
    │  }, 8, 0); // 8h sáng
    │
    ▼
Mỗi ngày 8h → Thông báo xuất hiện ✓
```

---

## 🔄 Vòng Đời Thông Báo

```
┌─────────────────────────────────────────────────────────┐
│  1. TẠO THÔNG BÁO                                       │
│     Code của bạn → notificationService                  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  2. XỬ LÝ                                               │
│     expo-notifications kiểm tra quyền, lưu trữ          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  3. HIỂN THỊ                                            │
│     Thông báo xuất hiện trên màn hình điện thoại        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  4. NGƯỜI DÙNG TƯƠNG TÁC                                │
│     - Nhấn vào thông báo → Mở app                       │
│     - Vuốt bỏ → Xóa thông báo                           │
│     - Không làm gì → Vẫn ở trong danh sách              │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Các Loại Thông Báo

```
┌─────────────────────────────────────────────────────┐
│  📅 BOOKING (Xanh dương)                            │
│  ────────────────────────────────────────────────   │
│  • Đặt lịch thành công                              │
│  • Nhắc nhở buổi tập                                │
│  • Hủy buổi tập                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  💳 PAYMENT (Xanh lá)                               │
│  ────────────────────────────────────────────────   │
│  • Thanh toán thành công                            │
│  • Hoàn tiền                                        │
│  • Giao dịch thất bại                               │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  🎉 PROMOTION (Cam)                                 │
│  ────────────────────────────────────────────────   │
│  • Khuyến mãi đặc biệt                              │
│  • Giảm giá                                         │
│  • Voucher mới                                      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  ⚙️ SYSTEM (Tím)                                    │
│  ────────────────────────────────────────────────   │
│  • Cập nhật hồ sơ                                   │
│  • Thay đổi cài đặt                                 │
│  • Bảo trì hệ thống                                 │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  🏃 FITNESS (Đỏ)                                    │
│  ────────────────────────────────────────────────   │
│  • Nhắc tập luyện                                   │
│  • Đạt mục tiêu                                     │
│  • Streak (chuỗi ngày tập)                          │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ Cấu Trúc File

```
FitBridge_Native/
│
├── services/
│   └── notificationService.js ← ⭐ Service chính
│       ├── registerForPushNotifications()
│       ├── presentNotification()
│       ├── scheduleNotificationForDate()
│       ├── scheduleDailyNotification()
│       └── setBadgeCount()
│
├── screens/
│   └── CommonScreen/
│       └── NotificationScreen/ ← 📱 Màn hình thông báo
│           └── NotificationScreen.js
│               ├── Hiển thị danh sách
│               ├── Lọc đã đọc/chưa đọc
│               ├── Đánh dấu đã đọc
│               └── Xóa thông báo
│
├── components/
│   └── NotificationTestHelper/ ← 🧪 Công cụ test
│       └── NotificationTestHelper.js
│           ├── Gửi test notification
│           ├── Hẹn giờ
│           └── Test badge
│
└── docs/
    ├── HUONG_DAN_THONG_BAO_VI.md ← 📖 Hướng dẫn đầy đủ
    ├── BAT_DAU_NHANH_VI.md ← ⚡ Bắt đầu nhanh
    └── SO_DO_HOAT_DONG_VI.md ← 📊 File này
```

---

## 💡 Cách Sử Dụng Từng File

### notificationService.js

**Khi nào dùng**: Khi bạn muốn gửi thông báo

```javascript
import notificationService from '../services/notificationService';

// Gửi ngay
await notificationService.presentNotification({...});

// Hẹn giờ
await notificationService.scheduleNotificationForDate({...}, date);
```

### NotificationScreen.js

**Khi nào dùng**: Đã tự động hoạt động, người dùng mở để xem thông báo

Không cần làm gì thêm! Màn hình này tự:

- Hiển thị thông báo
- Lắng nghe thông báo mới
- Cập nhật badge

### NotificationTestHelper.js

**Khi nào dùng**: Khi đang phát triển, muốn test

```javascript
// Thêm tạm vào màn hình
{
  __DEV__ && <NotificationTestHelper />;
}

// Nhớ xóa trước khi release!
```

---

## 🎯 Workflow Thực Tế

### Khi Khách Hàng Đặt Lịch

```
┌──────────────────────────────────────────────────┐
│  1. Khách hàng nhấn "Đặt lịch"                   │
└──────────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────┐
│  2. Bạn lưu vào database                         │
└──────────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────┐
│  3. GỬI THÔNG BÁO XÁC NHẬN                       │
│                                                  │
│  await notificationService.presentNotification({ │
│    title: "Đặt Lịch Thành Công",                │
│    body: "Buổi tập vào 10h sáng mai",           │
│    data: { type: 'booking', id: 123 }           │
│  });                                             │
└──────────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────┐
│  4. ĐẶT NHẮC NHỞ (1 tiếng trước)                 │
│                                                  │
│  const reminderTime = new Date(sessionTime);    │
│  reminderTime.setHours(                          │
│    reminderTime.getHours() - 1                  │
│  );                                              │
│                                                  │
│  await notificationService                       │
│    .scheduleNotificationForDate({                │
│      title: "Nhắc Nhở",                         │
│      body: "Còn 1 tiếng!",                      │
│      data: { type: 'booking', id: 123 }         │
│    }, reminderTime);                             │
└──────────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────┐
│  5. Hiển thị màn hình xác nhận                   │
└──────────────────────────────────────────────────┘
```

---

## 🎓 Ví Dụ Code Hoàn Chỉnh

### Ví Dụ 1: Đặt Lịch

```javascript
// BookingScreen.js
import notificationService from "../services/notificationService";

const handleBooking = async (bookingData) => {
  try {
    // 1. Lưu vào database
    const booking = await api.createBooking(bookingData);

    // 2. Gửi thông báo xác nhận
    await notificationService.presentNotification({
      title: "Đặt Lịch Thành Công",
      body: `Buổi tập với ${booking.ptName} vào ${booking.date}`,
      data: { type: "booking", bookingId: booking.id },
    });

    // 3. Đặt nhắc nhở 1 tiếng trước
    const reminderTime = new Date(booking.datetime);
    reminderTime.setHours(reminderTime.getHours() - 1);

    await notificationService.scheduleNotificationForDate(
      {
        title: "Buổi Tập Sắp Bắt Đầu",
        body: "Còn 1 tiếng nữa buổi tập bắt đầu!",
        data: { type: "booking", bookingId: booking.id },
      },
      reminderTime
    );

    // 4. Chuyển màn hình
    navigation.navigate("BookingSuccess");
  } catch (error) {
    Alert.alert("Lỗi", "Không thể đặt lịch");
  }
};
```

### Ví Dụ 2: Thanh Toán

```javascript
// PaymentScreen.js
import notificationService from "../services/notificationService";

const handlePaymentSuccess = async (payment) => {
  // Gửi thông báo
  await notificationService.presentNotification({
    title: "Thanh Toán Thành Công",
    body: `Đã thanh toán ${payment.amount.toLocaleString("vi-VN")}đ`,
    data: {
      type: "payment",
      transactionId: payment.id,
    },
  });

  // Chuyển màn hình
  navigation.navigate("PaymentSuccess");
};
```

---

## 📱 Quy Trình Test

```
BƯỚC 1: Thêm Test Helper
    │
    ▼
BƯỚC 2: Chạy app trên điện thoại
    │
    ▼
BƯỚC 3: Nhấn các nút test
    │
    ├─▶ Thông báo xuất hiện? ✓
    ├─▶ Badge hoạt động? ✓
    ├─▶ Hẹn giờ hoạt động? ✓
    └─▶ Nhấn vào thông báo mở app? ✓
    │
    ▼
BƯỚC 4: Tích hợp vào code thật
    │
    ▼
BƯỚC 5: Test lại toàn bộ flow
    │
    ▼
BƯỚC 6: Xóa test helper
    │
    ▼
BƯỚC 7: Release ✓
```

---

## ⚠️ Lưu Ý Quan Trọng

```
┌─────────────────────────────────────────────────────┐
│  ⚠️ QUAN TRỌNG                                      │
│  ───────────────────────────────────────────────    │
│  1. PHẢI test trên điện thoại thật                  │
│     ❌ Không chạy trên simulator/emulator           │
│                                                     │
│  2. Nhớ XIN QUYỀN thông báo                         │
│     ✓ iOS: Settings → Notifications                 │
│     ✓ Android: Tự động hỏi                          │
│                                                     │
│  3. XÓA test helper trước khi release               │
│     ❌ {__DEV__ && <NotificationTestHelper />}      │
│                                                     │
│  4. TEST kỹ trên cả iOS và Android                  │
│     ✓ Badge có thể khác nhau                        │
│     ✓ Sound có thể khác nhau                        │
└─────────────────────────────────────────────────────┘
```

---

## 🎉 Kết Luận

### Bạn Đã Có:

- ✅ Service xử lý thông báo
- ✅ Màn hình hiển thị
- ✅ Công cụ test
- ✅ Tài liệu tiếng Việt

### Việc Cần Làm:

1. Thêm test helper
2. Test thử
3. Dùng trong code
4. Build và test thật
5. Release

**Giờ bạn có thể gửi thông báo rồi! 🚀**

---

Cần giúp gì cứ hỏi nhé! 😊
