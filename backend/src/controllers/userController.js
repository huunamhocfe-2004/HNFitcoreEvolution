const pool = require('../config/db');

// Lấy danh sách tất cả người dùng
const getAllUsers = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, name, email, phone, role, avatar, is_active, created_at FROM users ORDER BY name ASC'
        );
        res.json(rows);
    } catch (err) {
        console.error("Lỗi khi lấy danh sách users:", err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAllUsers };