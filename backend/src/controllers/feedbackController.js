const pool = require('../config/db');
const { logAudit } = require('../utils/audit');
const { createNotification } = require('../utils/notifications');

// GET /api/feedback
const getAll = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT f.*, u.name AS member_name, u.avatar,
                   ru.name AS replied_by_name, ru.role AS replied_by_role
            FROM feedback f
            JOIN members m ON m.id = f.member_id
            JOIN users u ON u.id = m.user_id
            LEFT JOIN users ru ON ru.id = f.replied_by
            ORDER BY f.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/feedback/mine
const getMine = async (req, res) => {
    try {
        const [mem] = await pool.query('SELECT id FROM members WHERE user_id = ?', [req.user.id]);
        if (!mem.length) return res.status(404).json({ message: 'Member profile not found' });

        const [rows] = await pool.query(`
            SELECT f.*, ru.name AS replied_by_name, ru.role AS replied_by_role
            FROM feedback f
            LEFT JOIN users ru ON ru.id = f.replied_by
            WHERE f.member_id = ?
            ORDER BY f.created_at DESC
        `, [mem[0].id]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/feedback
const create = async (req, res) => {
    const { rating, comment } = req.body;
    try {
        const [mem] = await pool.query('SELECT id FROM members WHERE user_id = ?', [req.user.id]);
        if (!mem.length) return res.status(404).json({ message: 'Member profile not found' });

        const [result] = await pool.query(
            'INSERT INTO feedback (member_id, rating, comment) VALUES (?,?,?)',
            [mem[0].id, rating, comment]
        );

        await logAudit(pool, req, {
            action: 'create_feedback',
            entity_type: 'feedback',
            entity_id: result.insertId,
            new_value: { rating, comment },
        });

        res.status(201).json({ message: 'Cảm ơn bạn đã gửi phản hồi!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/feedback/:id/reply
const reply = async (req, res) => {
    const feedbackId = Number(req.params.id);
    const replyText = (req.body.reply || '').trim();

    if (!feedbackId) return res.status(400).json({ message: 'Feedback không hợp lệ' });
    if (!replyText) return res.status(400).json({ message: 'Vui lòng nhập nội dung phản hồi' });

    try {
        const [rows] = await pool.query(`
            SELECT f.*, m.user_id AS member_user_id
            FROM feedback f
            JOIN members m ON m.id = f.member_id
            WHERE f.id = ?
            LIMIT 1
        `, [feedbackId]);
        if (!rows.length) return res.status(404).json({ message: 'Feedback not found' });

        await pool.query(
            `UPDATE feedback
             SET admin_reply = ?, replied_by = ?, replied_at = COALESCE(replied_at, NOW()), reply_updated_at = NOW()
             WHERE id = ?`,
            [replyText, req.user.id, feedbackId]
        );

        await createNotification(pool, {
            user_id: rows[0].member_user_id,
            title: 'Đánh giá của bạn đã được trả lời',
            message: replyText,
            type: 'feedback',
            entity_type: 'feedback',
            entity_id: feedbackId,
        });

        await logAudit(pool, req, {
            action: 'reply_feedback',
            entity_type: 'feedback',
            entity_id: feedbackId,
            old_value: { admin_reply: rows[0].admin_reply },
            new_value: { admin_reply: replyText },
        });

        const [updatedRows] = await pool.query(`
            SELECT f.admin_reply AS reply, f.replied_at, f.reply_updated_at,
                   u.name AS replied_by_name, u.role AS replied_by_role
            FROM feedback f
            LEFT JOIN users u ON u.id = f.replied_by
            WHERE f.id = ?
            LIMIT 1
        `, [feedbackId]);

        res.json({ message: 'Đã lưu phản hồi', ...updatedRows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAll, getMine, create, reply };
