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
             tu.name AS trainer_name, tu.avatar AS trainer_avatar,
             cu.role AS created_by_role
      FROM subscriptions s 
      JOIN packages p ON p.id = s.package_id
      LEFT JOIN trainers t ON t.id = s.trainer_id
      LEFT JOIN users tu ON tu.id = t.user_id
      LEFT JOIN users cu ON cu.id = s.created_by
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

// GET /api/members/checkins/recent
const getRecentCheckins = async (req, res) => {
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    try {
        const [rows] = await pool.query(`
            SELECT c.id, c.member_id, c.checked_in_at, c.method,
                   m.qr_code, u.name, u.phone, u.avatar,
                   p.title AS current_package, s.end_date AS package_expires
            FROM checkins c
            JOIN members m ON m.id = c.member_id
            JOIN users u ON u.id = m.user_id
            LEFT JOIN subscriptions s ON s.member_id = m.id
              AND s.id = (SELECT id FROM subscriptions WHERE member_id = m.id ORDER BY end_date DESC LIMIT 1)
            LEFT JOIN packages p ON p.id = s.package_id
            ORDER BY c.checked_in_at DESC, c.id DESC
            LIMIT ?
        `, [limit]);

        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Legacy check-in shape kept unused; exported handler below returns member details.
const legacyCheckin = async (req, res) => {
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

const checkinWithMember = async (req, res) => {
    const { qr_code, method } = req.body;
    const checkinMethod = method === 'manual' ? 'manual' : 'qr';

    try {
        const [mRows] = await pool.query(`
            SELECT m.id, m.qr_code, u.name, u.phone, u.avatar,
                   p.title AS current_package, s.end_date AS package_expires
            FROM members m
            JOIN users u ON u.id = m.user_id
            JOIN subscriptions s ON s.member_id = m.id
            JOIN packages p ON p.id = s.package_id
            WHERE m.qr_code = ?
            AND m.status = 'active'
            AND s.is_paid = 1
            AND s.start_date <= CURDATE()
            AND s.end_date >= CURDATE()
            ORDER BY s.end_date DESC, s.id DESC
            LIMIT 1
        `, [qr_code]);
        if (!mRows.length) return res.status(403).json({ message: 'KhÃ´ng tÃ¬m tháº¥y há»™i viÃªn, tháº» háº¿t háº¡n hoáº·c chÆ°a thanh toÃ¡n gÃ³i táº­p' });

        const member = mRows[0];
        const [insertResult] = await pool.query(
            'INSERT INTO checkins (member_id, method, staff_id) VALUES (?, ?, ?)',
            [member.id, checkinMethod, req.user?.id || null]
        );

        const [checkinRows] = await pool.query(`
            SELECT c.id, c.member_id, c.checked_in_at, c.method,
                   m.qr_code, u.name, u.phone, u.avatar,
                   p.title AS current_package, s.end_date AS package_expires
            FROM checkins c
            JOIN members m ON m.id = c.member_id
            JOIN users u ON u.id = m.user_id
            LEFT JOIN subscriptions s ON s.member_id = m.id
              AND s.id = (SELECT id FROM subscriptions WHERE member_id = m.id ORDER BY end_date DESC LIMIT 1)
            LEFT JOIN packages p ON p.id = s.package_id
            WHERE c.id = ?
            LIMIT 1
        `, [insertResult.insertId]);

        res.json({
            message: 'Check-in thÃ nh cÃ´ng',
            member_id: member.id,
            member,
            checkin: checkinRows[0] || {
                id: insertResult.insertId,
                member_id: member.id,
                checked_in_at: new Date(),
                method: checkinMethod,
                ...member,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const checkinWithValidation = async (req, res) => {
    const { qr_code, method } = req.body;
    const checkinMethod = method === 'manual' ? 'manual' : 'qr';

    try {
        if (!qr_code) {
            return res.status(400).json({ code: 'QR_REQUIRED', message: 'Thiếu mã QR hội viên' });
        }

        const [memberRows] = await pool.query(`
            SELECT m.id, m.qr_code, m.status, u.name, u.phone, u.avatar,
                   s.id AS latest_subscription_id, s.package_id AS latest_package_id,
                   s.start_date AS latest_start_date, s.end_date AS latest_end_date,
                   s.is_paid AS latest_is_paid, p.title AS latest_package_title
            FROM members m
            JOIN users u ON u.id = m.user_id
            LEFT JOIN subscriptions s ON s.member_id = m.id
              AND s.id = (SELECT id FROM subscriptions WHERE member_id = m.id ORDER BY end_date DESC, id DESC LIMIT 1)
            LEFT JOIN packages p ON p.id = s.package_id
            WHERE m.qr_code = ?
            LIMIT 1
        `, [qr_code]);

        if (!memberRows.length) {
            return res.status(404).json({ code: 'QR_NOT_FOUND', message: 'Không tìm thấy hội viên từ mã QR này' });
        }

        const scannedMember = memberRows[0];
        const [activeSubs] = await pool.query(`
            SELECT s.*, p.title AS package_title
            FROM subscriptions s
            JOIN packages p ON p.id = s.package_id
            WHERE s.member_id = ?
            AND s.is_paid = 1
            AND s.start_date <= CURDATE()
            AND s.end_date >= CURDATE()
            ORDER BY s.end_date DESC, s.id DESC
            LIMIT 1
        `, [scannedMember.id]);

        if (!activeSubs.length || scannedMember.status !== 'active') {
            const latestEnd = scannedMember.latest_end_date
                ? new Date(scannedMember.latest_end_date).toISOString().slice(0, 10)
                : null;
            const latestStart = scannedMember.latest_start_date
                ? new Date(scannedMember.latest_start_date).toISOString().slice(0, 10)
                : null;
            const today = new Date().toISOString().slice(0, 10);
            let code = 'PACKAGE_INVALID';
            let message = 'Không thể check-in vì hội viên chưa có gói tập hợp lệ';

            if (!scannedMember.latest_subscription_id) {
                code = 'NO_PACKAGE';
                message = 'Hội viên chưa có gói tập để check-in';
            } else if (!scannedMember.latest_is_paid) {
                code = 'PACKAGE_UNPAID';
                message = 'Gói tập chưa thanh toán nên không thể check-in';
            } else if (latestEnd && latestEnd < today) {
                code = 'PACKAGE_EXPIRED';
                message = 'Gói tập đã hết hạn, check-in đã bị hủy';
            } else if (latestStart && latestStart > today) {
                code = 'PACKAGE_NOT_STARTED';
                message = 'Gói tập chưa đến ngày bắt đầu nên không thể check-in';
            }

            return res.status(403).json({
                code,
                cancelled: true,
                message,
                member: {
                    id: scannedMember.id,
                    name: scannedMember.name,
                    phone: scannedMember.phone,
                    avatar: scannedMember.avatar,
                    qr_code: scannedMember.qr_code,
                    status: scannedMember.status,
                    latest_package_id: scannedMember.latest_package_id,
                    current_package: scannedMember.latest_package_title,
                    package_expires: scannedMember.latest_end_date,
                    latest_is_paid: scannedMember.latest_is_paid,
                },
            });
        }

        const activeSub = activeSubs[0];
        const member = {
            id: scannedMember.id,
            qr_code: scannedMember.qr_code,
            name: scannedMember.name,
            phone: scannedMember.phone,
            avatar: scannedMember.avatar,
            current_package: activeSub.package_title,
            package_expires: activeSub.end_date,
        };

        const [insertResult] = await pool.query(
            'INSERT INTO checkins (member_id, method, staff_id) VALUES (?, ?, ?)',
            [member.id, checkinMethod, req.user?.id || null]
        );

        const [checkinRows] = await pool.query(`
            SELECT c.id, c.member_id, c.checked_in_at, c.method,
                   m.qr_code, u.name, u.phone, u.avatar,
                   p.title AS current_package, s.end_date AS package_expires
            FROM checkins c
            JOIN members m ON m.id = c.member_id
            JOIN users u ON u.id = m.user_id
            LEFT JOIN subscriptions s ON s.member_id = m.id
              AND s.id = (SELECT id FROM subscriptions WHERE member_id = m.id ORDER BY end_date DESC LIMIT 1)
            LEFT JOIN packages p ON p.id = s.package_id
            WHERE c.id = ?
            LIMIT 1
        `, [insertResult.insertId]);

        res.json({
            message: 'Check-in thành công',
            member_id: member.id,
            member,
            checkin: checkinRows[0] || {
                id: insertResult.insertId,
                member_id: member.id,
                checked_in_at: new Date(),
                method: checkinMethod,
                ...member,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const createRenewalRequest = async (req, res) => {
    const memberId = Number(req.params.id);
    const requestedPackageId = req.body.package_id ? Number(req.body.package_id) : null;

    try {
        const [memberRows] = await pool.query(`
            SELECT m.id, m.qr_code, u.name, u.phone
            FROM members m
            JOIN users u ON u.id = m.user_id
            WHERE m.id = ?
            LIMIT 1
        `, [memberId]);
        if (!memberRows.length) return res.status(404).json({ message: 'Không tìm thấy hội viên' });

        const [latestRows] = await pool.query(`
            SELECT s.*, p.title AS package_title
            FROM subscriptions s
            JOIN packages p ON p.id = s.package_id
            WHERE s.member_id = ?
            ORDER BY s.end_date DESC, s.id DESC
            LIMIT 1
        `, [memberId]);

        const packageId = requestedPackageId || latestRows[0]?.package_id;
        if (!packageId) {
            return res.status(400).json({ message: 'Hội viên chưa có gói tập trước đó để gửi yêu cầu gia hạn' });
        }

        const [pkgRows] = await pool.query('SELECT * FROM packages WHERE id = ? AND is_active = 1', [packageId]);
        if (!pkgRows.length) return res.status(404).json({ message: 'Gói tập không tồn tại hoặc đã bị ẩn' });
        const pkg = pkgRows[0];

        const [pendingRows] = await pool.query(`
            SELECT s.id, s.start_date, s.end_date, p.title AS package_title, cu.role AS created_by_role
            FROM subscriptions s
            JOIN packages p ON p.id = s.package_id
            LEFT JOIN users cu ON cu.id = s.created_by
            WHERE s.member_id = ?
            AND s.package_id = ?
            AND s.is_paid = 0
            ORDER BY s.created_at DESC, s.id DESC
            LIMIT 1
        `, [memberId, packageId]);
        if (pendingRows.length) {
            const pendingMessage = ['admin', 'staff'].includes(pendingRows[0].created_by_role)
                ? 'Đã có đề xuất gia hạn đang chờ hội viên phản hồi'
                : 'Hội viên đã đồng ý gia hạn, đang chờ quản trị viên xác nhận thanh toán';
            return res.json({
                message: pendingMessage,
                request: pendingRows[0],
                member: memberRows[0],
            });
        }

        const latestEnd = latestRows[0]?.end_date
            ? new Date(latestRows[0].end_date).toISOString().slice(0, 10)
            : null;
        const today = new Date().toISOString().slice(0, 10);
        const startD = latestEnd && latestEnd >= today
            ? new Date(new Date(latestEnd).getTime() + 86400000).toISOString().slice(0, 10)
            : today;
        const endD = new Date(new Date(startD).getTime() + pkg.duration_days * 86400000)
            .toISOString().slice(0, 10);

        const [result] = await pool.query(
            'INSERT INTO subscriptions (member_id, package_id, start_date, end_date, is_paid, amount_paid, created_by) VALUES (?,?,?,?,?,?,?)',
            [memberId, packageId, startD, endD, 0, pkg.price, req.user?.id || null]
        );

        res.status(201).json({
            message: 'Đã gửi đề xuất gia hạn cho hội viên',
            request: {
                id: result.insertId,
                start_date: startD,
                end_date: endD,
                amount_paid: pkg.price,
                package_title: pkg.title,
            },
            member: memberRows[0],
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAll, getOne, create, update, remove, getQR, getRecentCheckins, checkin: checkinWithValidation, createRenewalRequest };
