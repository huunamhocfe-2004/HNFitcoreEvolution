const pool = require("../config/db");

// GET /api/trainers
const getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(`
            SELECT t.*, u.name, u.email, u.phone, u.avatar 
            FROM trainers t 
            JOIN users u ON u.id = t.user_id
            ORDER BY u.name ASC
        `);
    res.json(rows);
  } catch (err) {
    console.error("LỖI KHI LẤY DANH SÁCH PT:", err);
    res.status(500).json({ message: "Server error", detail: err.message });
  }
};

// POST /api/trainers
const create = async (req, res) => {
  const {
    user_id,
    specialization,
    bio,
    experience_years,
    title,
    hourly_rate,
    employment_status,
    badge,
    work_address,
    skills,
    certifications,
    teaching,
  } = req.body;

  let avatar = null;
  if (req.file) {
    avatar = `/uploads/${req.file.filename}`;
  }

  // Xử lý dữ liệu rỗng từ FormData để tránh lỗi Strict Mode của MySQL
  const safeRate =
    hourly_rate === "" || hourly_rate === "null" ? null : hourly_rate;
  const safeExp =
    experience_years === "" || experience_years === "null"
      ? 0
      : experience_years;

  try {
    await pool.query(
      `INSERT INTO trainers 
            (user_id, specialization, bio, experience_years, title, hourly_rate, employment_status, badge, work_address, skills, certifications, teaching) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        specialization,
        bio || "",
        safeExp,
        title || null,
        safeRate,
        employment_status || "HN Fitcore",
        badge || null,
        work_address || null,
        skills || null,
        certifications || null,
        teaching || null,
      ],
    );

    if (avatar) {
      await pool.query("UPDATE users SET avatar=? WHERE id=?", [
        avatar,
        user_id,
      ]);
    }

    res.status(201).json({ message: "Đã thêm huấn luyện viên thành công" });
  } catch (err) {
    console.error("Lỗi khi thêm PT:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/trainers/:id
const update = async (req, res) => {
  const {
    specialization,
    bio,
    experience_years,
    title,
    hourly_rate,
    employment_status,
    badge,
    work_address,
    skills,
    certifications,
    teaching,
  } = req.body;

  let avatar = null;
  if (req.file) {
    avatar = `/uploads/${req.file.filename}`;
  }

  // Xử lý dữ liệu rỗng từ FormData
  const safeRate =
    hourly_rate === "" || hourly_rate === "null" ? null : hourly_rate;
  const safeExp =
    experience_years === "" || experience_years === "null"
      ? 0
      : experience_years;

  try {
    const [tRows] = await pool.query(
      "SELECT user_id FROM trainers WHERE id=?",
      [req.params.id],
    );
    if (!tRows.length)
      return res.status(404).json({ message: "Trainer not found" });

    const userId = tRows[0].user_id;

    await pool.query(
      `UPDATE trainers SET 
                specialization=?, bio=?, experience_years=?,
                title=?, hourly_rate=?, employment_status=?, badge=?, work_address=?,
                skills=?, certifications=?, teaching=? 
             WHERE id=?`,
      [
        specialization,
        bio || "",
        safeExp,
        title || null,
        safeRate,
        employment_status || "HN Fitcore",
        badge || null,
        work_address || null,
        skills || null,
        certifications || null,
        teaching || null,
        req.params.id,
      ],
    );

    if (avatar) {
      await pool.query("UPDATE users SET avatar=? WHERE id=?", [
        avatar,
        userId,
      ]);
    }

    res.json({ message: "Đã cập nhật thông tin huấn luyện viên", avatar });
  } catch (err) {
    console.error("Lỗi khi cập nhật PT:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/trainers/:id
const remove = async (req, res) => {
  try {
    await pool.query("DELETE FROM trainers WHERE id=?", [req.params.id]);
    res.json({ message: "Đã xóa huấn luyện viên" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAll, create, update, remove };
