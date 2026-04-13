-- =============================================================
-- HN Fitcore Evolution - Full Database Schema
-- =============================================================

CREATE DATABASE IF NOT EXISTS fitcore_gym CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fitcore_gym;

-- -------------------------------------------------------------
-- 1. USERS (authentication for all roles)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  phone       VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  role        ENUM('admin','staff','member') NOT NULL DEFAULT 'member',
  avatar      VARCHAR(255),
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- 2. MEMBERS (extension of users with gym-specific data)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS members (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL UNIQUE,
  qr_code     VARCHAR(255),
  joined_date DATE NOT NULL,
  birth_date  DATE,
  id_card     VARCHAR(20),
  status      ENUM('active','expired','paused') NOT NULL DEFAULT 'active',
  notes       TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- 3. TRAINERS (PT profiles)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trainers (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT NOT NULL UNIQUE,
  specialization VARCHAR(200),
  bio            TEXT,
  experience_years TINYINT,
  rating         DECIMAL(2,1) DEFAULT 5.0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- 4. PACKAGES (gym membership plans)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS packages (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(100) NOT NULL,
  description  TEXT,
  duration_days INT NOT NULL,
  price        DECIMAL(10,2) NOT NULL,
  package_type ENUM('standard','vip','pt') NOT NULL DEFAULT 'standard',
  is_active    TINYINT(1) NOT NULL DEFAULT 1,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- 5. PROMOTIONS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS promotions (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  code         VARCHAR(50) NOT NULL UNIQUE,
  description  VARCHAR(255),
  discount_pct DECIMAL(5,2) NOT NULL DEFAULT 0,
  discount_amt DECIMAL(10,2) NOT NULL DEFAULT 0,
  valid_from   DATE NOT NULL,
  valid_to     DATE NOT NULL,
  max_uses     INT DEFAULT NULL,
  used_count   INT NOT NULL DEFAULT 0,
  is_active    TINYINT(1) NOT NULL DEFAULT 1
);

-- -------------------------------------------------------------
-- 6. SUBSCRIPTIONS (member → package assignments)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  member_id    INT NOT NULL,
  package_id   INT NOT NULL,
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  is_paid      TINYINT(1) NOT NULL DEFAULT 0,
  amount_paid  DECIMAL(10,2),
  promo_id     INT DEFAULT NULL,
  trainer_id   INT DEFAULT NULL,
  created_by   INT,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id)  REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (package_id) REFERENCES packages(id),
  FOREIGN KEY (promo_id)   REFERENCES promotions(id) ON DELETE SET NULL,
  FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE SET NULL
);

-- -------------------------------------------------------------
-- 7. CLASSES (group fitness classes)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS classes (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(100) NOT NULL,
  description   TEXT,
  trainer_id    INT,
  day_of_week   TINYINT NOT NULL COMMENT '0=Sun,1=Mon,...,6=Sat',
  start_time    TIME NOT NULL,
  duration_min  SMALLINT NOT NULL DEFAULT 60,
  max_capacity  SMALLINT NOT NULL DEFAULT 20,
  class_type    ENUM('yoga','zumba','boxing','crossfit','cycling','other') DEFAULT 'other',
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE SET NULL
);

-- -------------------------------------------------------------
-- 8. BOOKINGS (class or PT sessions)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  member_id   INT NOT NULL,
  booking_type ENUM('class','pt') NOT NULL DEFAULT 'class',
  class_id    INT DEFAULT NULL,
  trainer_id  INT DEFAULT NULL,
  booking_date DATE NOT NULL,
  time_slot   TIME,
  status      ENUM('pending','confirmed','cancelled','completed') NOT NULL DEFAULT 'pending',
  notes       TEXT,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id)  REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id)   REFERENCES classes(id) ON DELETE SET NULL,
  FOREIGN KEY (trainer_id) REFERENCES trainers(id) ON DELETE SET NULL
);

-- -------------------------------------------------------------
-- 9. CHECK-INS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS checkins (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  member_id    INT NOT NULL,
  checked_in_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  checked_out_at DATETIME DEFAULT NULL,
  method       ENUM('qr','manual') DEFAULT 'manual',
  staff_id     INT DEFAULT NULL,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- 10. BODY METRICS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS body_metrics (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  member_id   INT NOT NULL,
  weight      DECIMAL(5,2) COMMENT 'kg',
  height      DECIMAL(5,2) COMMENT 'cm',
  bmi         DECIMAL(5,2),
  body_fat    DECIMAL(5,2) COMMENT 'percent',
  muscle_mass DECIMAL(5,2) COMMENT 'percent',
  recorded_at DATE NOT NULL DEFAULT (CURRENT_DATE),
  notes       TEXT,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- 11. WORKOUT LOGS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workout_logs (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  member_id    INT NOT NULL,
  exercise_name VARCHAR(100) NOT NULL,
  `sets`         TINYINT,
  reps         TINYINT,
  weight_kg    DECIMAL(5,2),
  notes        TEXT,
  logged_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- 12. PRODUCTS (e-commerce)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(200) NOT NULL,
  description  TEXT,
  category     ENUM('supplement','equipment','accessory','apparel','other') NOT NULL DEFAULT 'other',
  price        DECIMAL(10,2) NOT NULL,
  stock_qty    INT NOT NULL DEFAULT 0,
  image_url    VARCHAR(255),
  is_active    TINYINT(1) NOT NULL DEFAULT 1,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- 13. ORDERS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  member_id      INT NOT NULL,
  total_amount   DECIMAL(10,2) NOT NULL,
  shipping_fee   DECIMAL(10,2) NOT NULL DEFAULT 0,
  status         ENUM('pending','confirmed','processing','delivered','cancelled') NOT NULL DEFAULT 'pending',
  payment_method ENUM('cash','transfer','cod') NOT NULL DEFAULT 'cash',
  shipping_address VARCHAR(255),
  notes          TEXT,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- 14. ORDER ITEMS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  order_id    INT NOT NULL,
  product_id  INT NOT NULL,
  quantity    INT NOT NULL DEFAULT 1,
  unit_price  DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);
-- -------------------------------------------------------------
-- 15. FEEDBACK (general gym evaluation)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- =============================================================
-- SEED DATA
-- =============================================================

-- Admin user (password: admin123)
INSERT INTO users (name, email, phone, password_hash, role) VALUES
('Admin Fitcore', 'admin@fitcore.vn', '0901234567', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Nguyen Van Staff', 'staff@fitcore.vn', '0902345678', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'staff'),
('Tran Thi Trainer', 'pt1@fitcore.vn', '0903456789', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'staff'),
('Le Van Trainer', 'pt2@fitcore.vn', '0904567890', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'staff'),
('Pham Thi Mai', 'mai@gmail.com', '0905678901', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'member'),
('Nguyen Van Hung', 'hung@gmail.com', '0906789012', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'member'),
('Do Thi Lan', 'lan@gmail.com', '0907890123', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'member'),
('Hoang Van Nam', 'nam@gmail.com', '0908901234', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'member');

-- Members
INSERT INTO members (user_id, qr_code, joined_date, birth_date, id_card, status) VALUES
(5, 'QR-MEM001', '2024-01-15', '1995-03-20', '001095012345', 'active'),
(6, 'QR-MEM002', '2024-02-01', '1992-07-14', '001092034567', 'active'),
(7, 'QR-MEM003', '2024-01-20', '1998-11-05', '001098056789', 'paused'),
(8, 'QR-MEM004', '2024-03-10', '1990-01-30', '001090078901', 'expired');

-- Trainers
INSERT INTO trainers (user_id, specialization, bio, experience_years, rating) VALUES
(3, 'Yoga, Zumba, Flexibility', 'Certified Yoga instructor with 5 years experience', 5, 4.8),
(4, 'Boxing, CrossFit, Strength', 'Former national boxing champion, specialized in HIIT', 7, 4.9);

-- Packages
INSERT INTO packages (title, description, duration_days, price, package_type) VALUES
('Gói 1 Tháng', 'Tập không giới hạn trong 1 tháng', 30, 350000, 'standard'),
('Gói 3 Tháng', 'Tiết kiệm 15% so với gói tháng', 90, 900000, 'standard'),
('Gói 6 Tháng', 'Tiết kiệm 20% so với gói tháng', 180, 1680000, 'standard'),
('Gói 1 Năm', 'Gói năm ưu đãi nhất - Tiết kiệm 30%', 365, 2940000, 'vip'),
('Gói PT 10 Buổi', 'PT cá nhân 10 buổi', 60, 1500000, 'pt'),
('Gói PT 20 Buổi', 'PT cá nhân 20 buổi - Tiết kiệm 10%', 90, 2700000, 'pt');

-- Subscriptions
INSERT INTO subscriptions (member_id, package_id, start_date, end_date, is_paid, amount_paid) VALUES
(1, 2, '2024-01-15', '2024-04-14', 1, 900000),
(1, 3, '2024-04-15', '2024-10-11', 1, 1680000),
(2, 4, '2024-02-01', '2025-02-01', 1, 2940000),
(3, 1, '2024-01-20', '2024-02-19', 1, 350000),
(4, 1, '2024-03-10', '2024-04-09', 1, 350000);

-- Classes
INSERT INTO classes (title, description, trainer_id, day_of_week, start_time, duration_min, max_capacity, class_type) VALUES
('Yoga Buổi Sáng', 'Yoga nhẹ nhàng cho ngày mới', 1, 1, '07:00:00', 60, 15, 'yoga'),
('Zumba Cardio', 'Nhảy Zumba đốt mỡ cực vui', 1, 2, '18:00:00', 60, 20, 'zumba'),
('Boxing Cơ Bản', 'Học các đòn boxing căn bản', 2, 3, '19:00:00', 90, 12, 'boxing'),
('CrossFit HIIT', 'High intensity interval training', 2, 5, '06:00:00', 45, 10, 'crossfit'),
('Yoga Buổi Tối', 'Yoga thư giãn cuối ngày', 1, 4, '19:30:00', 60, 15, 'yoga'),
('Zumba Party', 'Zumba vũ hội cuối tuần', 1, 6, '09:00:00', 75, 25, 'zumba');

-- Products
INSERT INTO products (name, description, category, price, stock_qty, image_url) VALUES
('Whey Protein Gold Standard 2lbs', 'Sữa tăng cơ Optimum Nutrition Gold Standard', 'supplement', 750000, 25, '/uploads/whey-gold.jpg'),
('Mass Gainer Kevin Levrone 3kg', 'Sữa tăng cân và cơ bắp cao cấp', 'supplement', 980000, 15, '/uploads/mass-gainer.jpg'),
('BCAA Xtend 30 servings', 'Phục hồi cơ bắp nhanh sau tập', 'supplement', 420000, 30, '/uploads/bcaa.jpg'),
('Creatine Monohydrate 500g', 'Tăng sức mạnh và hiệu suất tập luyện', 'supplement', 280000, 40, '/uploads/creatine.jpg'),
('Đai lưng tập Gym Da Thật', 'Bảo vệ lưng khi nâng tạ nặng', 'accessory', 450000, 20, '/uploads/belt.jpg'),
('Găng tay tập Gym', 'Chống chai tay, chống trượt', 'accessory', 150000, 35, '/uploads/gloves.jpg'),
('Dây nhảy thể thao', 'Dây nhảy thép chuyên nghiệp', 'equipment', 120000, 50, '/uploads/rope.jpg'),
('Bình nước thể thao 1L', 'Bình nước giữ lạnh 24h', 'accessory', 180000, 45, '/uploads/bottle.jpg'),
('Bộ tạ đơn 5kg', 'Bộ tạ đơn cao su bảo vệ sàn', 'equipment', 350000, 12, '/uploads/dumbbell.jpg'),
('Áo tank-top gym nam', 'Áo tập thể thao thoáng mát', 'apparel', 180000, 60, '/uploads/tanktop.jpg');

-- Body metrics for member 1
INSERT INTO body_metrics (member_id, weight, height, bmi, body_fat, muscle_mass, recorded_at) VALUES
(1, 72.5, 170, 25.1, 18.5, 42.0, '2024-01-15'),
(1, 71.0, 170, 24.6, 17.8, 43.2, '2024-02-15'),
(1, 69.5, 170, 24.1, 17.0, 44.5, '2024-03-15'),
(1, 68.2, 170, 23.6, 16.2, 45.8, '2024-04-15'),
(1, 67.0, 170, 23.2, 15.5, 46.5, '2024-05-15'),
(2, 85.0, 175, 27.8, 22.0, 40.0, '2024-02-01'),
(2, 83.5, 175, 27.3, 21.0, 41.2, '2024-03-01'),
(2, 82.0, 175, 26.8, 20.0, 42.5, '2024-04-01');

-- Promotions
INSERT INTO promotions (code, description, discount_pct, discount_amt, valid_from, valid_to, max_uses) VALUES
('WELCOME10', 'Giảm 10% cho hội viên mới', 10, 0, '2024-01-01', '2024-12-31', 100),
('SUMMER20', 'Ưu đãi mùa hè giảm 20%', 20, 0, '2024-06-01', '2024-08-31', 50),
('FLAT100K', 'Giảm trực tiếp 100,000đ', 0, 100000, '2024-01-01', '2024-12-31', 200);
