# HN Fitcore Evolution

Hệ thống quản lý phòng gym tổng hợp.

## Yêu cầu môi trường
- Node.js (khuyến nghị phiên bản 18 trở lên)
- MySQL (để chạy cơ sở dữ liệu)

## Hướng dẫn chạy dự án

Dự án này bao gồm 2 phần: Frontend (ReactJS/Vite) và Backend (Node.js/Express). Bạn cần mở 2 terminal (cửa sổ dòng lệnh) riêng biệt để chạy song song cả hai.

### 1. Chạy Backend (Máy chủ API)

Mở terminal đầu tiên và di chuyển vào thư mục `backend`:

```bash
cd backend

# Cài đặt các gói phụ thuộc (chỉ cần chạy lần đầu)
npm install

# Khởi động server (Mặc định sẽ chạy trên cổng 5005)
PORT=5005 node src/index.js
# Hoặc nếu bạn có cài nodemon để tự động tải lại khi code thay đổi:
PORT=5005 npm run dev
```

*Lưu ý: Backend cần kết nối tới cơ sở dữ liệu MySQL. Hãy đảm bảo bạn đã cấu hình đúng thông tin kết nối trong file `.env` (nếu có) hoặc trong `backend/src/config/db.js` và đã import file `database.sql` vào MySQL.*

### 2. Chạy Frontend (Giao diện người dùng)

Mở terminal thứ hai và di chuyển vào thư mục `frontend`:

```bash
cd frontend

# Cài đặt các gói phụ thuộc (chỉ cần chạy lần đầu)
npm install

# Khởi động ứng dụng React bằng Vite
npm run dev
```

Mặc định frontend sẽ chạy tại địa chỉ: `http://localhost:5173`

---

## Các tài khoản Test mặc định
Nếu hệ thống yêu cầu đăng nhập, bạn có thể kiểm tra cơ sở dữ liệu bảng `users` để lấy tài khoản hoặc đăng ký một tài khoản mới trực tiếp trên giao diện rồi phân quyền `admin` (nếu cần) thông qua database.
