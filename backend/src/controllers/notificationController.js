const pool = require('../config/db');

const getMine = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT *
             FROM notifications
             WHERE user_id = ?
             ORDER BY created_at DESC
             LIMIT 50`,
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Không tải được thông báo' });
    }
};

const getUnreadCount = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0',
            [req.user.id]
        );
        res.json({ count: rows[0].count, hasUnread: rows[0].count > 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Không tải được số thông báo' });
    }
};

const markRead = async (req, res) => {
    try {
        await pool.query(
            'UPDATE notifications SET is_read = 1, read_at = NOW() WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );
        res.json({ message: 'Đã đọc thông báo' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Không cập nhật được thông báo' });
    }
};

const markAllRead = async (req, res) => {
    try {
        await pool.query(
            'UPDATE notifications SET is_read = 1, read_at = NOW() WHERE user_id = ? AND is_read = 0',
            [req.user.id]
        );
        res.json({ message: 'Đã đọc tất cả thông báo' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Không cập nhật được thông báo' });
    }
};

module.exports = { getMine, getUnreadCount, markRead, markAllRead };
