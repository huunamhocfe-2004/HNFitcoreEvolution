const pool = require('../config/db');

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
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/trainers (Usually via Admin creating a user first or linking existing user)
const create = async (req, res) => {
    const { user_id, specialization, bio, experience_years } = req.body;
    try {
        await pool.query(
            'INSERT INTO trainers (user_id, specialization, bio, experience_years) VALUES (?,?,?,?)',
            [user_id, specialization, bio || '', experience_years || 0]
        );
        res.status(201).json({ message: 'Đã thêm huấn luyện viên thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/trainers/:id
const update = async (req, res) => {
    let { specialization, bio, experience_years, avatar } = req.body;
    if (req.file) {
        avatar = `/uploads/${req.file.filename}`;
    }
    try {
        // Get user_id first
        const [tRows] = await pool.query('SELECT user_id FROM trainers WHERE id=?', [req.params.id]);
        if (!tRows.length) return res.status(404).json({ message: 'Trainer not found' });
        
        const userId = tRows[0].user_id;

        await pool.query(
            'UPDATE trainers SET specialization=?, bio=?, experience_years=? WHERE id=?',
            [specialization, bio, experience_years, req.params.id]
        );

        if (avatar) {
            await pool.query('UPDATE users SET avatar=? WHERE id=?', [avatar, userId]);
        }

        res.json({ message: 'Đã cập nhật thông tin huấn luyện viên', avatar });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/trainers/:id
const remove = async (req, res) => {
    try {
        await pool.query('DELETE FROM trainers WHERE id=?', [req.params.id]);
        res.json({ message: 'Đã xóa huấn luyện viên' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAll, create, update, remove };
