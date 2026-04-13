const pool = require('../config/db');

// GET /api/feedback
const getAll = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT f.*, u.name AS member_name, u.avatar 
            FROM feedback f
            JOIN members m ON m.id = f.member_id
            JOIN users u ON u.id = m.user_id
            ORDER BY f.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/feedback
const create = async (req, res) => {
    const { rating, comment } = req.body;
    try {
        // Get member_id from user_id (authenticated user)
        const [mem] = await pool.query('SELECT id FROM members WHERE user_id = ?', [req.user.id]);
        if (!mem.length) return res.status(404).json({ message: 'Member profile not found' });

        await pool.query(
            'INSERT INTO feedback (member_id, rating, comment) VALUES (?,?,?)',
            [mem[0].id, rating, comment]
        );
        res.status(201).json({ message: 'Cảm ơn bạn đã gửi phản hồi!' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAll, create };
