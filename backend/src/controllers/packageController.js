const pool = require('../config/db');

// GET /api/packages
const getAll = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM packages WHERE is_active = 1 ORDER BY price ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/packages
const create = async (req, res) => {
    const { title, description, duration_days, price, package_type } = req.body;
    if (!title || !duration_days || !price)
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    try {
        const [result] = await pool.query(
            'INSERT INTO packages (title, description, duration_days, price, package_type) VALUES (?,?,?,?,?)',
            [title, description, duration_days, price, package_type || 'standard']
        );
        res.status(201).json({ id: result.insertId, message: 'Tạo gói tập thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/packages/:id
const update = async (req, res) => {
    const { title, description, duration_days, price, package_type, is_active } = req.body;
    try {
        await pool.query(
            'UPDATE packages SET title=?, description=?, duration_days=?, price=?, package_type=?, is_active=? WHERE id=?',
            [title, description, duration_days, price, package_type, is_active, req.params.id]
        );
        res.json({ message: 'Cập nhật gói tập thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/packages/:id
const remove = async (req, res) => {
    try {
        await pool.query('UPDATE packages SET is_active=0 WHERE id=?', [req.params.id]);
        res.json({ message: 'Đã ẩn gói tập' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAll, create, update, remove };
