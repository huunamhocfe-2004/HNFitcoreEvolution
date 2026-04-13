const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');

// GET /api/members
const getAll = async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT m.id, u.name, u.email, u.phone, u.avatar,
             m.qr_code, m.joined_date, m.birth_date, m.id_card, m.status, m.notes,
             p.title AS current_package, s.end_date AS package_expires,
             DATEDIFF(s.end_date, CURDATE()) AS days_remaining
      FROM members m
      JOIN users u ON u.id = m.user_id
      LEFT JOIN subscriptions s ON s.member_id = m.id
        AND s.id = (SELECT id FROM subscriptions WHERE member_id = m.id ORDER BY end_date DESC LIMIT 1)
      LEFT JOIN packages p ON p.id = s.package_id
      ORDER BY m.id DESC
    `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/members/:id
const getOne = async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT m.id, u.id AS user_id, u.name, u.email, u.phone, u.avatar,
             m.qr_code, m.joined_date, m.birth_date, m.id_card, m.status, m.notes
      FROM members m
      JOIN users u ON u.id = m.user_id
      WHERE m.id = ?
    `, [req.params.id]);
        if (!rows.length) return res.status(404).json({ message: 'Member not found' });

        const member = rows[0];

        // Get subscriptions
        const [subs] = await pool.query(`
      SELECT s.*, p.title, p.duration_days, p.price,
             tu.name AS trainer_name, tu.avatar AS trainer_avatar
      FROM subscriptions s 
      JOIN packages p ON p.id = s.package_id
      LEFT JOIN trainers t ON t.id = s.trainer_id
      LEFT JOIN users tu ON tu.id = t.user_id
      WHERE s.member_id = ? 
      ORDER BY s.created_at DESC
    `, [member.id]);

        // Get body metrics
        const [metrics] = await pool.query(
            'SELECT * FROM body_metrics WHERE member_id = ? ORDER BY recorded_at ASC',
            [member.id]
        );

        // Get checkins
        const [checkins] = await pool.query(
            'SELECT * FROM checkins WHERE member_id = ? ORDER BY checked_in_at DESC LIMIT 20',
            [member.id]
        );

        res.json({ ...member, subscriptions: subs, metrics, checkins });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/members
const create = async (req, res) => {
    let { name, email, phone, password, birth_date, id_card, notes, avatar } = req.body;
    if (req.file) {
        avatar = `/uploads/${req.file.filename}`;
    }
    if (!name || !email || !password)
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });

    try {
        const hash = await bcrypt.hash(password, 10);
        const [userResult] = await pool.query(
            'INSERT INTO users (name, email, phone, password_hash, role, avatar) VALUES (?,?,?,?,?,?)',
            [name, email, phone || null, hash, 'member', avatar || null]
        );
        const userId = userResult.insertId;
        const qrCode = `FC-${String(userId).padStart(6, '0')}`;

        const [memResult] = await pool.query(
            'INSERT INTO members (user_id, qr_code, joined_date, birth_date, id_card, status, notes) VALUES (?,?,CURDATE(),?,?,?,?)',
            [userId, qrCode, birth_date || null, id_card || null, 'active', notes || null]
        );

        res.status(201).json({ id: memResult.insertId, qr_code: qrCode, message: 'Thêm hội viên thành công', avatar });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ message: 'Email đã được sử dụng' });
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/members/:id
const update = async (req, res) => {
    let { name, phone, birth_date, id_card, status, notes, avatar } = req.body;
    if (req.file) {
        avatar = `/uploads/${req.file.filename}`;
    }
    try {
        const [rows] = await pool.query(
            'SELECT u.id FROM members m JOIN users u ON u.id = m.user_id WHERE m.id = ?',
            [req.params.id]
        );
        if (!rows.length) return res.status(404).json({ message: 'Member not found' });

        await pool.query(
            'UPDATE users SET name=?, phone=?, avatar=? WHERE id=?',
            [name, phone, avatar || null, rows[0].id]
        );
        await pool.query(
            'UPDATE members SET birth_date=?, id_card=?, status=?, notes=? WHERE id=?',
            [birth_date || null, id_card || null, status || 'active', notes || null, req.params.id]
        );

        res.json({ message: 'Cập nhật thành công', avatar });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/members/:id
const remove = async (req, res) => {
    try {
        await pool.query(
            'DELETE u FROM users u JOIN members m ON m.user_id = u.id WHERE m.id = ?',
            [req.params.id]
        );
        res.json({ message: 'Xóa hội viên thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/members/:id/qr  - returns QR as data URL
const getQR = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT qr_code, id FROM members WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ message: 'Member not found' });
        const dataUrl = await QRCode.toDataURL(rows[0].qr_code);
        res.json({ qr_code: rows[0].qr_code, qr_image: dataUrl });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/members/checkin
const checkin = async (req, res) => {
    const { qr_code, method } = req.body;
    try {
        const [mRows] = await pool.query(`
            SELECT m.id FROM members m 
            JOIN subscriptions s ON s.member_id = m.id
            WHERE m.qr_code = ? 
            AND m.status = 'active'
            AND s.is_paid = 1 
            AND s.start_date <= CURDATE() 
            AND s.end_date >= CURDATE()
            LIMIT 1
        `, [qr_code]);
        if (!mRows.length) return res.status(403).json({ message: 'Không tìm thấy hội viên, thẻ hết hạn hoặc chưa thanh toán gói tập' });

        await pool.query(
            'INSERT INTO checkins (member_id, method) VALUES (?, ?)',
            [mRows[0].id, method || 'qr']
        );
        res.json({ message: 'Check-in thành công', member_id: mRows[0].id });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAll, getOne, create, update, remove, getQR, checkin };
