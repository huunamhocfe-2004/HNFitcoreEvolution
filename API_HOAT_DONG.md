# API của dự án HN Fitcore Evolution hoạt động như thế nào

File này giải thích luồng API của dự án từ frontend React sang backend Express, cách xác thực token, cách phân quyền, upload ảnh, realtime notification và các nhóm endpoint chính.

## 1. Tổng quan kiến trúc

Dự án có 2 phần chính:

- `frontend/`: React + Vite, hiển thị giao diện admin/member và gọi API.
- `backend/`: Express.js, xử lý request API, kết nối MySQL, xác thực JWT, upload file và gửi sự kiện realtime bằng Socket.IO.

Luồng cơ bản:

```txt
Người dùng thao tác trên React
        ↓
frontend gọi api.get/post/put/patch/delete(...)
        ↓
Axios gửi request tới /api/...
        ↓
Vite proxy chuyển /api tới backend
        ↓
Express route nhận request
        ↓
Middleware kiểm tra token/quyền nếu cần
        ↓
Controller xử lý nghiệp vụ
        ↓
MySQL trả dữ liệu
        ↓
Backend trả JSON về frontend
```

## 2. Frontend gọi API bằng gì?

Frontend dùng Axios instance tại:

```txt
frontend/src/api/axios.js
```

Nội dung quan trọng:

```js
const api = axios.create({
    baseURL: '/api',
    timeout: 10000,
})
```

Nghĩa là khi code frontend gọi:

```js
api.get('/members')
```

thì request thật sẽ là:

```txt
GET /api/members
```

Frontend không gọi trực tiếp `http://localhost:5005/api/...`; nó chỉ gọi `/api/...`. Vite sẽ proxy request này sang backend.

## 3. Vite proxy chuyển API sang backend

Cấu hình nằm ở:

```txt
frontend/vite.config.js
```

Các proxy chính:

```js
proxy: {
    '/api': {
        target: 'http://127.0.0.1:5005',
        changeOrigin: true,
    },
    '/uploads': {
        target: 'http://127.0.0.1:5005',
        changeOrigin: true,
    },
    '/socket.io': {
        target: 'http://127.0.0.1:5005',
        changeOrigin: true,
        ws: true,
    }
}
```

Vì vậy:

- `/api/auth/login` được chuyển tới `http://127.0.0.1:5005/api/auth/login`
- `/uploads/abc.jpg` được chuyển tới `http://127.0.0.1:5005/uploads/abc.jpg`
- `/socket.io` được chuyển tới backend để dùng Socket.IO realtime

Lưu ý: backend mặc định dùng `process.env.PORT || 5000`, nhưng frontend đang proxy tới port `5005`. Vì vậy khi chạy dự án, backend cần chạy đúng port `5005` hoặc sửa lại proxy cho khớp port backend.

## 4. Backend nhận API ở đâu?

File khởi động backend:

```txt
backend/src/index.js
```

Backend dùng Express và mount các route như sau:

```js
app.use("/api/users", require("./routes/users"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/members", require("./routes/members"));
app.use("/api/packages", require("./routes/packages"));
app.use("/api/subscriptions", require("./routes/subscriptions"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/metrics", require("./routes/metrics"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/trainers", require("./routes/trainers"));
app.use("/api/feedback", require("./routes/feedback"));
app.use("/api/trial-requests", require("./routes/trialRequests"));
app.use("/api/permissions", require("./routes/permissions"));
app.use("/api/notifications", require("./routes/notifications"));
```

Ví dụ:

```txt
frontend gọi:  api.get('/products')
request thật:  GET /api/products
backend vào:   backend/src/routes/products.js
controller:    backend/src/controllers/productController.js
```

## 5. Kết nối database

Backend kết nối MySQL tại:

```txt
backend/src/config/db.js
```

Thông tin kết nối lấy từ biến môi trường `.env`:

```txt
DB_HOST
DB_USER
DB_PASSWORD
DB_NAME
```

Nếu không có `.env`, backend dùng mặc định:

```txt
host: localhost
user: root
password: rỗng
database: fitcore_gym
```

Các controller dùng `pool.query(...)` để đọc/ghi dữ liệu vào MySQL.

## 6. Đăng nhập và token hoạt động như thế nào?

Endpoint đăng nhập:

```txt
POST /api/auth/login
```

Frontend gọi ở:

```txt
frontend/src/pages/auth/LoginPage.jsx
```

Backend xử lý ở:

```txt
backend/src/controllers/authController.js
```

Luồng đăng nhập:

```txt
1. Người dùng nhập email/password
2. Frontend gọi POST /api/auth/login
3. Backend tìm user theo email trong bảng users
4. Backend dùng bcrypt so sánh password với password_hash
5. Nếu đúng, backend tạo JWT token
6. Backend trả về token + user
7. Frontend lưu token vào localStorage với key fitcore_token
8. Các request sau tự động gửi token trong header Authorization
```

Header gửi kèm:

```txt
Authorization: Bearer <token>
```

Đoạn tự gắn token nằm trong `frontend/src/api/axios.js`:

```js
api.interceptors.request.use(config => {
    const token = localStorage.getItem('fitcore_token')
    if (token) config.headers['Authorization'] = `Bearer ${token}`
    return config
})
```

## 7. Backend kiểm tra token và phân quyền

Middleware xác thực nằm ở:

```txt
backend/src/middleware/auth.js
```

Có 3 phần chính:

- `authMiddleware`: kiểm tra JWT token có hợp lệ không.
- `requireRole(...)`: kiểm tra role như `admin`, `staff`, `member`.
- `requirePermission(moduleKey, action)`: kiểm tra quyền chi tiết trong bảng `role_permissions`.

Ví dụ route chỉ admin được tạo sản phẩm:

```js
router.post('/', authMiddleware, requireRole('admin'), upload.single('image'), c.create);
```

Ví dụ route cần quyền chi tiết:

```js
router.post('/', requirePermission('members', 'create'), upload.single('avatar'), c.create);
```

Nếu token thiếu hoặc sai, backend trả lỗi:

```txt
401 No token provided
403 Invalid or expired token
403 Forbidden: insufficient permissions
```

Frontend có response interceptor. Nếu gặp lỗi đăng nhập hết hạn, frontend xóa user/token và chuyển về `/login`.

## 8. Upload ảnh hoạt động như thế nào?

Middleware upload nằm ở:

```txt
backend/src/middleware/upload.js
```

Dự án dùng `multer` để upload ảnh vào thư mục:

```txt
backend/uploads/
```

Backend expose thư mục upload bằng:

```js
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
```

Các API upload ảnh thường dùng `multipart/form-data`, ví dụ:

```js
api.put("/auth/profile", data, {
    headers: { "Content-Type": "multipart/form-data" },
});
```

Giới hạn upload:

- Chỉ nhận file có MIME type bắt đầu bằng `image/`
- Tối đa `5MB`
- Tên file được đổi thành dạng `timestamp-random.ext`

## 9. Socket.IO realtime hoạt động như thế nào?

Backend tạo Socket.IO server trong:

```txt
backend/src/index.js
```

Sau đó gắn `io` vào mỗi request:

```js
app.use((req, res, next) => {
  req.io = io;
  next();
});
```

Nhờ vậy controller có thể phát sự kiện realtime:

```js
req.io.emit("new-order", ...)
req.io.emit("new-trial-request", ...)
req.io.emit("new-pt-request", ...)
```

Frontend admin sidebar lắng nghe Socket.IO tại:

```txt
frontend/src/components/layout/Sidebar.jsx
```

Một số sự kiện realtime đang dùng:

- `new-order`
- `new-notification`
- `new-trial-request`
- `trial-request-updated`
- `new-pt-request`
- `pt-request-updated`

Member layout hiện đang đếm thông báo bằng polling mỗi 30 giây:

```js
setInterval(refreshUnread, 30000)
```

## 10. Các nhóm API chính

### Auth

File route:

```txt
backend/src/routes/auth.js
```

Endpoints:

```txt
POST /api/auth/login
GET  /api/auth/me
PUT  /api/auth/profile
```

Dùng để đăng nhập, lấy thông tin user hiện tại, cập nhật hồ sơ và avatar.

### Users

File route:

```txt
backend/src/routes/users.js
```

Endpoints:

```txt
GET /api/users
```

Chỉ `admin` được lấy danh sách user.

### Members

File route:

```txt
backend/src/routes/members.js
```

Endpoints:

```txt
GET    /api/members
GET    /api/members/checkins/recent
GET    /api/members/:id
POST   /api/members
PUT    /api/members/:id
DELETE /api/members/:id
GET    /api/members/:id/qr
POST   /api/members/checkin
POST   /api/members/:id/renewal-request
```

Dùng để quản lý hội viên, check-in, QR code và yêu cầu gia hạn.

### Packages

File route:

```txt
backend/src/routes/packages.js
```

Endpoints:

```txt
GET    /api/packages
POST   /api/packages
PUT    /api/packages/:id
DELETE /api/packages/:id
```

`GET` public, còn thêm/sửa/xóa yêu cầu `admin`.

### Subscriptions

File route:

```txt
backend/src/routes/subscriptions.js
```

Endpoints:

```txt
GET    /api/subscriptions
GET    /api/subscriptions/pending-pt-count
POST   /api/subscriptions
PUT    /api/subscriptions/:id/accept-renewal
DELETE /api/subscriptions/:id/cancel-renewal
PUT    /api/subscriptions/:id/paid
POST   /api/subscriptions/sync-expired
GET    /api/subscriptions/promos
POST   /api/subscriptions/promos
PUT    /api/subscriptions/promos/:id
DELETE /api/subscriptions/promos/:id
POST   /api/subscriptions/promos/validate
```

Dùng để quản lý đăng ký gói tập, thanh toán, PT, gia hạn và mã khuyến mãi.

### Bookings

File route:

```txt
backend/src/routes/bookings.js
```

Endpoints:

```txt
GET    /api/bookings/classes
GET    /api/bookings/trainers
GET    /api/bookings
POST   /api/bookings
PATCH  /api/bookings/:id/status
POST   /api/bookings/classes
PUT    /api/bookings/classes/:id
DELETE /api/bookings/classes/:id
```

`classes` và `trainers` có thể lấy public. Các API còn lại cần đăng nhập; quản lý lớp cần `admin`.

### Metrics

File route:

```txt
backend/src/routes/metrics.js
```

Endpoints:

```txt
GET  /api/metrics
POST /api/metrics
GET  /api/metrics/logs
POST /api/metrics/logs
```

Dùng cho tiến độ cơ thể và nhật ký tập luyện của member.

### Products

File route:

```txt
backend/src/routes/products.js
```

Endpoints:

```txt
GET    /api/products
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

`GET` public. Thêm/sửa/xóa sản phẩm cần `admin` và có thể upload ảnh `image`.

### Orders

File route:

```txt
backend/src/routes/orders.js
```

Endpoints:

```txt
GET   /api/orders/has-new
PATCH /api/orders/mark-seen
GET   /api/orders
POST  /api/orders
PATCH /api/orders/:id/status
```

Dùng cho đơn hàng cửa hàng. Admin/staff có thể xem đơn mới, đánh dấu đã xem và cập nhật trạng thái.

### Dashboard

File route:

```txt
backend/src/routes/dashboard.js
```

Endpoints:

```txt
GET /api/dashboard/stats
```

Chỉ `admin` và `staff` được xem thống kê dashboard.

### Trainers

File route:

```txt
backend/src/routes/trainers.js
```

Endpoints:

```txt
GET    /api/trainers
POST   /api/trainers
PUT    /api/trainers/:id
DELETE /api/trainers/:id
```

`GET` public. Thêm/sửa/xóa PT cần `admin`; avatar dùng upload ảnh.

### Feedback

File route:

```txt
backend/src/routes/feedback.js
```

Endpoints:

```txt
GET  /api/feedback
GET  /api/feedback/mine
POST /api/feedback
PUT  /api/feedback/:id/reply
```

Member tạo feedback và xem feedback của mình. Admin/staff xem tất cả và phản hồi.

### Trial Requests

File route:

```txt
backend/src/routes/trialRequests.js
```

Endpoints:

```txt
POST  /api/trial-requests
GET   /api/trial-requests
GET   /api/trial-requests/has-new
PATCH /api/trial-requests/:id/status
```

Người chưa đăng nhập có thể gửi yêu cầu tập thử. Admin/staff xem và cập nhật trạng thái.

### Permissions

File route:

```txt
backend/src/routes/permissions.js
```

Endpoints:

```txt
GET /api/permissions
PUT /api/permissions
```

Admin/staff xem ma trận quyền. Chỉ admin được cập nhật quyền.

### Notifications

File route:

```txt
backend/src/routes/notifications.js
```

Endpoints:

```txt
GET   /api/notifications
GET   /api/notifications/unread-count
PATCH /api/notifications/read-all
PATCH /api/notifications/:id/read
```

Dùng để lấy thông báo cá nhân, đếm thông báo chưa đọc và đánh dấu đã đọc.

## 11. Ví dụ một request thực tế: cập nhật hồ sơ member

Frontend trong `MemberLayout.jsx`:

```js
const data = new FormData();
data.append("name", editForm.name);
data.append("phone", editForm.phone);
if (file) data.append("avatar", file);

const res = await api.put("/auth/profile", data, {
  headers: { "Content-Type": "multipart/form-data" },
});
```

Luồng xử lý:

```txt
1. Frontend gửi PUT /api/auth/profile
2. Axios tự gắn Authorization: Bearer token
3. Vite proxy chuyển request sang backend port 5005
4. backend/src/routes/auth.js nhận request
5. authMiddleware kiểm tra token
6. multer upload avatar nếu có
7. authController.updateProfile cập nhật bảng users
8. Backend trả JSON gồm message và avatar
9. Frontend cập nhật user trong AuthContext và hiển thị toast thành công
```

## 12. Ví dụ một request thực tế: lấy số thông báo chưa đọc

Frontend trong `MemberLayout.jsx`:

```js
api.get("/notifications/unread-count")
```

Luồng xử lý:

```txt
1. Frontend gọi GET /api/notifications/unread-count
2. Axios gắn token
3. Backend vào backend/src/routes/notifications.js
4. authMiddleware giải mã token và đưa thông tin user vào req.user
5. notificationController đếm notification của user hiện tại
6. Backend trả { count: số_lượng }
7. Frontend hiển thị chấm đỏ nếu count > 0
```

## 13. Quy ước response và lỗi

Response thành công thường là JSON:

```json
{
  "message": "Thao tác thành công"
}
```

hoặc dữ liệu:

```json
[
  { "id": 1, "name": "..." }
]
```

Response lỗi thường có dạng:

```json
{
  "message": "Nội dung lỗi"
}
```

Frontend thường bắt lỗi bằng `try/catch` và hiển thị `toast.error(...)`.

## 14. Khi thêm một API mới cần làm gì?

Quy trình thêm API mới:

```txt
1. Tạo hoặc sửa controller trong backend/src/controllers
2. Tạo hoặc sửa route trong backend/src/routes
3. Mount route trong backend/src/index.js nếu là nhóm API mới
4. Thêm middleware auth/role/permission nếu API cần bảo vệ
5. Frontend gọi bằng api.get/api.post/api.put/api.patch/api.delete
6. Test request từ giao diện hoặc bằng Postman/Thunder Client
```

Ví dụ thêm API mới `/api/example`:

```js
// backend/src/routes/example.js
const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({ message: 'OK' });
});

module.exports = router;
```

Mount vào `backend/src/index.js`:

```js
app.use('/api/example', require('./routes/example'));
```

Frontend gọi:

```js
const res = await api.get('/example');
```

## 15. Những file quan trọng nên nhớ

```txt
frontend/src/api/axios.js                  Axios instance, gắn token, xử lý lỗi auth
frontend/vite.config.js                    Proxy /api, /uploads, /socket.io sang backend
backend/src/index.js                       Khởi động Express, mount routes, Socket.IO
backend/src/config/db.js                   Kết nối MySQL
backend/src/middleware/auth.js             Xác thực JWT và phân quyền
backend/src/middleware/upload.js           Upload ảnh bằng multer
backend/src/routes/*                       Định nghĩa endpoint API
backend/src/controllers/*                  Xử lý nghiệp vụ API
backend/src/utils/notifications.js         Tạo notification trong database
backend/uploads/                           Lưu file ảnh upload
```

