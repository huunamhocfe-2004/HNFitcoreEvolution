const pool = require('../config/db');

// GET /api/subscriptions?member_id=
const getAll = async (req, res) => {
    try {
        let memberId = req.query.member_id;

        // Security: Members can only see their own subscriptions
        if (req.user.role === 'member') {
            const [mem] = await pool.query('SELECT id FROM members WHERE user_id = ?', [req.user.id]);
            if (!mem.length) return res.status(404).json({ message: 'Member not found' });
            memberId = mem[0].id;
        }

        const where = memberId ? 'WHERE s.member_id = ?' : '';
        const params = memberId ? [memberId] : [];
        
        const [rows] = await pool.query(`
      SELECT s.*, u.name AS member_name, p.title AS package_title, p.duration_days,
             tu.name AS trainer_name, cu.role AS created_by_role
      FROM subscriptions s
      JOIN members m ON m.id = s.member_id
      JOIN users u ON u.id = m.user_id
      JOIN packages p ON p.id = s.package_id
      LEFT JOIN trainers t ON t.id = s.trainer_id
      LEFT JOIN users tu ON tu.id = t.user_id
      LEFT JOIN users cu ON cu.id = s.created_by
      ${where}
      ORDER BY s.created_at DESC
    `, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/subscriptions  - assign package to member
const create = async (req, res) => {
    const { member_id, package_id, start_date, is_paid, payment_method, promo_code, trainer_id } = req.body;
    if (!member_id || !package_id)
        return res.status(400).json({ message: 'Thiếu thông tin hội viên hoặc gói tập' });

    try {
        // Security: If requester is a member, force member_id and is_paid=0
        let isPaid = is_paid;
        if (req.user.role === 'member') {
            const [mem] = await pool.query('SELECT id FROM members WHERE user_id = ?', [req.user.id]);
            if (!mem.length || mem[0].id !== parseInt(member_id)) {
                return res.status(403).json({ message: 'Bạn không có quyền đăng ký cho người khác' });
            }
            // Members cannot mark as paid themselves
            isPaid = false;
        }

        // Get package duration
        const [pkgRows] = await pool.query('SELECT * FROM packages WHERE id = ? AND is_active=1', [package_id]);
        if (!pkgRows.length) return res.status(404).json({ message: 'Gói tập không tồn tại' });
        const pkg = pkgRows[0];

        const startD = start_date || new Date().toISOString().slice(0, 10);
        const endD = new Date(new Date(startD).getTime() + pkg.duration_days * 86400000)
            .toISOString().slice(0, 10);

        // Handle promo
        let finalPrice = parseFloat(pkg.price);
        let promoId = null;
        if (promo_code) {
            const [promoRows] = await pool.query(
                'SELECT * FROM promotions WHERE code=? AND is_active=1 AND valid_from <= CURDATE() AND valid_to >= CURDATE()',
                [promo_code]
            );
            if (promoRows.length) {
                const promo = promoRows[0];
                if (promo.discount_pct > 0) finalPrice = finalPrice * (1 - promo.discount_pct / 100);
                if (promo.discount_amt > 0) finalPrice = Math.max(0, finalPrice - promo.discount_amt);
                promoId = promo.id;
                // REMOVED: update count here, it should happen in markPaid
            }
        }

        const [result] = await pool.query(
            'INSERT INTO subscriptions (member_id, package_id, start_date, end_date, is_paid, amount_paid, promo_id, trainer_id, created_by) VALUES (?,?,?,?,?,?,?,?,?)',
            [member_id, package_id, startD, endD, isPaid ? 1 : 0, finalPrice, promoId, trainer_id || null, req.user?.id || null]
        );

        // Update member status to active ONLY if paid
        if (isPaid) {
            await pool.query('UPDATE members SET status="active" WHERE id=?', [member_id]);
        }

        if (req.user.role === 'member' && trainer_id && !isPaid && req.io) {
            req.io.emit('new-pt-request', {
                id: result.insertId,
                member_id,
                trainer_id,
            });
        }

        res.status(201).json({
            id: result.insertId,
            start_date: startD,
            end_date: endD,
            amount_paid: finalPrice,
            message: 'Đăng ký gói tập thành công'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/subscriptions/:id/paid
const markPaid = async (req, res) => {
    try {
        const [subRows] = await pool.query(`
            SELECT s.*, p.duration_days 
            FROM subscriptions s 
            JOIN packages p ON s.package_id = p.id 
            WHERE s.id = ?
        `, [req.params.id]);

        if (!subRows.length) return res.status(404).json({ message: 'Không tìm thấy đăng ký' });
        const sub = subRows[0];
        if (sub.is_paid) return res.status(400).json({ message: 'Gói tập này đã được thanh toán trước đó' });

        // Logic: Extension or New?
        // Check latest paid end_date for this member
        const [latestPaid] = await pool.query(`
            SELECT end_date FROM subscriptions 
            WHERE member_id = ? AND is_paid = 1 AND end_date >= CURDATE()
            ORDER BY end_date DESC LIMIT 1
        `, [sub.member_id]);

        let startD = 'CURDATE()';
        if (latestPaid.length) {
            // Append to current end_date
            startD = `DATE_ADD('${latestPaid[0].end_date.toISOString().slice(0, 10)}', INTERVAL 1 DAY)`;
        }

        await pool.query(`
            UPDATE subscriptions 
            SET is_paid = 1, 
                start_date = ${startD}, 
                end_date = DATE_ADD(${startD}, INTERVAL ? DAY) 
            WHERE id = ?
        `, [sub.duration_days, req.params.id]);

        // Increment Promo usage ONLY NOW
        if (sub.promo_id) {
            await pool.query('UPDATE promotions SET used_count = used_count + 1 WHERE id = ?', [sub.promo_id]);
        }

        // Update member status to active
        await pool.query('UPDATE members SET status="active" WHERE id=?', [sub.member_id]);

        if (sub.trainer_id && req.io) {
            req.io.emit('pt-request-updated', {
                id: req.params.id,
                status: 'approved',
            });
        }

        res.json({ 
            message: 'Đã xác nhận thanh toán và kích hoạt gói tập',
            extended: latestPaid.length > 0 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/subscriptions/:id/accept-renewal
const acceptRenewal = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT s.*, m.user_id, cu.role AS created_by_role
            FROM subscriptions s
            JOIN members m ON m.id = s.member_id
            LEFT JOIN users cu ON cu.id = s.created_by
            WHERE s.id = ?
            LIMIT 1
        `, [req.params.id]);

        if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy đề xuất gia hạn' });
        const sub = rows[0];
        if (sub.user_id !== req.user.id) return res.status(403).json({ message: 'Bạn không có quyền xử lý đề xuất này' });
        if (sub.is_paid) return res.status(400).json({ message: 'Gói tập này đã được kích hoạt' });
        if (!['admin', 'staff'].includes(sub.created_by_role)) {
            return res.status(400).json({ message: 'Yêu cầu này đã được gửi và đang chờ quản trị viên xác nhận' });
        }

        await pool.query('UPDATE subscriptions SET created_by = ? WHERE id = ?', [req.user.id, req.params.id]);
        res.json({ message: 'Đã đồng ý gia hạn. Vui lòng chờ quản trị viên xác nhận thanh toán.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/subscriptions/:id/cancel-renewal
const cancelRenewal = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT s.*, m.user_id, cu.role AS created_by_role
            FROM subscriptions s
            JOIN members m ON m.id = s.member_id
            LEFT JOIN users cu ON cu.id = s.created_by
            WHERE s.id = ?
            LIMIT 1
        `, [req.params.id]);

        if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy đề xuất gia hạn' });
        const sub = rows[0];
        if (sub.user_id !== req.user.id) return res.status(403).json({ message: 'Bạn không có quyền xử lý đề xuất này' });
        if (sub.is_paid) return res.status(400).json({ message: 'Không thể hủy gói đã kích hoạt' });
        if (!['admin', 'staff'].includes(sub.created_by_role)) {
            return res.status(400).json({ message: 'Không thể hủy yêu cầu đang chờ quản trị viên xác nhận' });
        }

        await pool.query('DELETE FROM subscriptions WHERE id = ?', [req.params.id]);
        res.json({ message: 'Đã hủy đề xuất gia hạn' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/subscriptions/pending-pt-count
const getPendingPtCount = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT COUNT(*) AS count
            FROM subscriptions s
            LEFT JOIN users cu ON cu.id = s.created_by
            WHERE s.trainer_id IS NOT NULL
            AND s.is_paid = 0
            AND cu.role = 'member'
        `);
        res.json({ hasNew: rows[0].count > 0, count: rows[0].count });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Auto-sync expired members (called by cron or on demand)
const syncExpiredMembers = async (req, res) => {
    try {
        // Find members whose latest subscription is expired
        await pool.query(`
      UPDATE members m SET m.status = 'expired'
      WHERE m.status = 'active'
      AND NOT EXISTS (
        SELECT 1 FROM subscriptions s 
        WHERE s.member_id = m.id AND s.end_date >= CURDATE() AND s.is_paid = 1
      )
    `);
        res.json({ message: 'Đồng bộ trạng thái hội viên thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/promotions
const getPromos = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM promotions ORDER BY id DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/promotions/validate
const validatePromo = async (req, res) => {
    const { code, package_id } = req.body;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM promotions WHERE code=? AND is_active=1 AND valid_from<=CURDATE() AND valid_to>=CURDATE()',
            [code]
        );
        if (!rows.length) return res.status(404).json({ valid: false, message: 'Mã không hợp lệ hoặc đã hết hạn' });
        const promo = rows[0];
        if (promo.max_uses && promo.used_count >= promo.max_uses)
            return res.status(400).json({ valid: false, message: 'Mã đã hết lượt sử dụng' });

        // Calculate discount on package price if provided
        let discount = 0;
        if (package_id) {
            const [p] = await pool.query('SELECT price FROM packages WHERE id=?', [package_id]);
            if (p.length) {
                discount = promo.discount_pct > 0
                    ? p[0].price * promo.discount_pct / 100
                    : promo.discount_amt;
            }
        }

        res.json({ valid: true, promo, discount });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/promotions
const createPromo = async (req, res) => {
    const { code, discount_pct, discount_amt, valid_from, valid_to, max_uses, description } = req.body;
    if (!code || (!discount_pct && !discount_amt))
        return res.status(400).json({ message: 'Thiếu thông tin khuyến mãi' });
    try {
        const [result] = await pool.query(
            'INSERT INTO promotions (code, discount_pct, discount_amt, valid_from, valid_to, max_uses, description) VALUES (?,?,?,?,?,?,?)',
            [code, discount_pct || 0, discount_amt || 0, valid_from, valid_to, max_uses || null, description || null]
        );
        res.status(201).json({ id: result.insertId, message: 'Tạo mã khuyến mãi thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/promotions/:id
const updatePromo = async (req, res) => {
    const { code, discount_pct, discount_amt, valid_from, valid_to, max_uses, is_active, description } = req.body;
    try {
        await pool.query(
            'UPDATE promotions SET code=?, discount_pct=?, discount_amt=?, valid_from=?, valid_to=?, max_uses=?, is_active=?, description=? WHERE id=?',
            [code, discount_pct, discount_amt, valid_from, valid_to, max_uses, is_active, description, req.params.id]
        );
        res.json({ message: 'Cập nhật khuyến mãi thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/promotions/:id
const removePromo = async (req, res) => {
    try {
        await pool.query('UPDATE promotions SET is_active=0 WHERE id=?', [req.params.id]);
        res.json({ message: 'Đã ẩn khuyến mãi' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAll, create, markPaid, acceptRenewal, cancelRenewal, getPendingPtCount, syncExpiredMembers, getPromos, validatePromo, createPromo, updatePromo, removePromo };
