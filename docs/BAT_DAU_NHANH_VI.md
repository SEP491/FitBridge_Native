# 🚀 Bắt Đầu Nhanh - Chỉ 3 Bước!

## ⚡ Bước 1: Thêm Công Cụ Test (2 phút)

Mở file `screens/CommonScreen/HomeScreen/HomeScreen.js`

Thêm 2 dòng này:

```javascript
// Ở đầu file, thêm import:
import NotificationTestHelper from "../../../components/NotificationTestHelper/NotificationTestHelper";

// Trong phần return, thêm vào cuối ScrollView:
export default function HomeScreen() {
  return (
    <ScrollView>
      {/* Nội dung cũ của bạn */}

      {/* THÊM DÒNG NÀY: */}
      {__DEV__ && <NotificationTestHelper />}
    </ScrollView>
  );
}
```

**Xong! Chạy app ngay:**

```bash
npm start
```

---

## 📱 Bước 2: Test Ngay (5 phút)

1. Mở app trên điện thoại
2. Kéo xuống màn hình Home
3. Thấy khung màu đỏ "Notification Test Helper"
4. Nhấn các nút màu:
   - **Xanh dương** = Thông báo đặt lịch
   - **Xanh lá** = Thông báo thanh toán
   - **Cam** = Thông báo khuyến mãi

**Sẽ thấy thông báo xuất hiện ngay!**

---

## 💻 Bước 3: Dùng Trong Code (10 phút)

### Gửi Thông Báo Đơn Giản

```javascript
// Import service
import notificationService from "../services/notificationService";

// Gửi thông báo
await notificationService.presentNotification({
  title: "Thành Công!",
  body: "Bạn đã đặt lịch thành công",
  data: { type: "booking" },
});
```

### Các Ví Dụ Hay Dùng

#### 1. Khi Đặt Lịch Thành Công

```javascript
await notificationService.presentNotification({
  title: "Đặt Lịch Thành Công",
  body: `Buổi tập với ${ptName} vào ${date}`,
  data: { type: "booking", id: 123 },
});
```

#### 2. Khi Thanh Toán Thành Công

```javascript
await notificationService.presentNotification({
  title: "Thanh Toán Thành Công",
  body: `Đã thanh toán ${amount}đ`,
  data: { type: "payment", id: 456 },
});
```

#### 3. Nhắc Nhở Trước Buổi Tập (1 tiếng)

```javascript
const reminderTime = new Date(sessionTime);
reminderTime.setHours(reminderTime.getHours() - 1);

await notificationService.scheduleNotificationForDate(
  {
    title: "Buổi Tập Sắp Bắt Đầu",
    body: "Còn 1 tiếng nữa buổi tập bắt đầu!",
    data: { type: "booking", id: 123 },
  },
  reminderTime
);
```

#### 4. Nhắc Tập Hàng Ngày (8h sáng)

```javascript
await notificationService.scheduleDailyNotification(
  {
    title: "Chào Buổi Sáng!",
    body: "Đừng quên tập luyện hôm nay nhé 💪",
    data: { type: "fitness" },
  },
  8,
  0
); // 8 giờ 0 phút
```

---

## 🎯 Các Loại Thông Báo

| Type        | Khi Nào Dùng            | Ví Dụ                          |
| ----------- | ----------------------- | ------------------------------ |
| `booking`   | Đặt lịch, nhắc buổi tập | "Buổi tập bắt đầu sau 1 tiếng" |
| `payment`   | Thanh toán              | "Đã thanh toán 500,000đ"       |
| `promotion` | Khuyến mãi              | "Giảm 20% tất cả gói tập!"     |
| `system`    | Cập nhật hệ thống       | "Thông tin đã được cập nhật"   |
| `fitness`   | Nhắc tập luyện          | "Hôm nay bạn chưa tập đấy!"    |

---

## ❓ Gặp Vấn Đề?

### Không thấy thông báo?

1. ✅ Đã chạy trên điện thoại thật chưa? (Không chạy trên máy ảo)
2. ✅ Đã cấp quyền thông báo chưa?
3. ✅ Thử nhấn lại nút test

### Làm sao build lên điện thoại?

```bash
# iOS
npx eas build --platform ios --profile development

# Android
npx eas build --platform android --profile development
```

### Muốn xóa test helper?

```javascript
// Xóa hoặc comment dòng này:
// {__DEV__ && <NotificationTestHelper />}
```

---

## 📚 Tài Liệu Đầy Đủ

Đọc thêm tại: `docs/HUONG_DAN_THONG_BAO_VI.md`

---

## ✅ Checklist Nhanh

- [ ] Thêm NotificationTestHelper vào HomeScreen
- [ ] Chạy app và test thông báo
- [ ] Dùng `notificationService` trong code
- [ ] Build app lên điện thoại thật để test
- [ ] Xóa test helper trước khi release

---

**Xong rồi! Giờ bạn có thể gửi thông báo rồi đấy! 🎉**

Cần giúp gì cứ hỏi nhé!
