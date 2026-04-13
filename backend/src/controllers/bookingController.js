const pool = require('../config/db');

// GET /api/bookings
const getAll = async (req, res) => {
    try {
        let memberId = req.query.member_id;

        // Security: Members can only see their own bookings
        if (req.user.role === 'member') {
            const [mem] = await pool.query('SELECT id FROM members WHERE user_id = ?', [req.user.id]);
            if (!mem.length) return res.status(404).json({ message: 'Member not found' });
            memberId = mem[0].id;
        }

        const where = [];
        const params = [];
        if (memberId) { where.push('b.member_id = ?'); params.push(memberId); }
        if (req.query.date) { where.push('b.booking_date = ?'); params.push(req.query.date); }
        const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';

        const [rows] = await pool.query(`
      SELECT b.*, u.name AS member_name, u.phone AS member_phone,
             c.title AS class_title, c.class_type, c.start_time,
             tu.name AS trainer_name
      FROM bookings b
      JOIN members m ON m.id = b.member_id
      JOIN users u ON u.id = m.user_id
      LEFT JOIN classes c ON c.id = b.class_id
      LEFT JOIN trainers t ON t.id = b.trainer_id
      LEFT JOIN users tu ON tu.id = t.user_id
      ${whereStr}
      ORDER BY b.booking_date DESC, b.time_slot DESC
    `, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/bookings
const create = async (req, res) => {
    let { member_id, booking_type, class_id, trainer_id, booking_date, time_slot, notes } = req.body;

    // Security: Members can only book for themselves
    if (req.user.role === 'member') {
        const [mem] = await pool.query('SELECT id FROM members WHERE user_id = ?', [req.user.id]);
        if (!mem.length) return res.status(404).json({ message: 'Member profile not found' });
        member_id = mem[0].id;
    }

    if (!member_id || !booking_date)
        return res.status(400).json({ message: 'Thiếu thông tin đặt lịch' });

    try {
        // Validation: Member must have an active PAID subscription to book
        const [subRows] = await pool.query(`
            SELECT id FROM subscriptions 
            WHERE member_id = ? AND is_paid = 1 AND start_date <= CURDATE() AND end_date >= CURDATE()
            LIMIT 1
        `, [member_id]);

        if (!subRows.length) {
            return res.status(403).json({ message: 'Bạn cần có gói tập còn hạn và đã thanh toán để đặt lịch' });
        }

        // Check capacity for class bookings
        if (booking_type === 'class' && class_id) {
            // Check for duplicate booking
            const [existing] = await pool.query(
                'SELECT id FROM bookings WHERE member_id=? AND class_id=? AND booking_date=? AND status != "cancelled"',
                [member_id, class_id, booking_date]
            );
            if (existing.length)
                return res.status(400).json({ message: 'Bạn đã đặt lịch lớp này trong ngày hôm nay rồi' });

            const [capRows] = await pool.query(
                'SELECT max_capacity FROM classes WHERE id=?', [class_id]
            );
            const [countRows] = await pool.query(
                'SELECT COUNT(*) AS cnt FROM bookings WHERE class_id=? AND booking_date=? AND status != "cancelled"',
                [class_id, booking_date]
            );
            if (capRows.length && countRows[0].cnt >= capRows[0].max_capacity)
                return res.status(400).json({ message: 'Lớp học đã đầy chỗ' });
        }

        const [result] = await pool.query(
            'INSERT INTO bookings (member_id, booking_type, class_id, trainer_id, booking_date, time_slot, notes) VALUES (?,?,?,?,?,?,?)',
            [member_id, booking_type || 'class', class_id || null, trainer_id || null, booking_date, time_slot || null, notes || null]
        );
        res.status(201).json({ id: result.insertId, message: 'Đặt lịch thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// PATCH /api/bookings/:id/status
const updateStatus = async (req, res) => {
    const { status } = req.body;
    try {
        await pool.query('UPDATE bookings SET status=? WHERE id=?', [status, req.params.id]);
        res.json({ message: 'Cập nhật trạng thái thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/classes
const getClasses = async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT c.*, u.name AS trainer_name, t.specialization,
             (SELECT COUNT(*) FROM bookings b WHERE b.class_id=c.id AND b.booking_date=CURDATE() AND b.status!='cancelled') AS today_bookings
      FROM classes c
      LEFT JOIN trainers t ON t.id = c.trainer_id
      LEFT JOIN users u ON u.id = t.user_id
      WHERE c.is_active=1
      ORDER BY c.day_of_week, c.start_time
    `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/trainers
const getTrainers = async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT t.id, u.name, u.email, u.phone, u.avatar,
             t.specialization, t.bio, t.experience_years, t.rating
      FROM trainers t JOIN users u ON u.id = t.user_id
      WHERE u.is_active=1
    `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/classes
const createClass = async (req, res) => {
    const { title, class_type, trainer_id, day_of_week, start_time, duration_min, max_capacity } = req.body;
    if (!title || !class_type || day_of_week === undefined || !start_time)
        return res.status(400).json({ message: 'Thiếu thông tin lớp học' });
    try {
        const [result] = await pool.query(
            'INSERT INTO classes (title, class_type, trainer_id, day_of_week, start_time, duration_min, max_capacity) VALUES (?,?,?,?,?,?,?)',
            [title, class_type, trainer_id || null, day_of_week, start_time, duration_min || 60, max_capacity || 20]
        );
        res.status(201).json({ id: result.insertId, message: 'Tạo lớp học thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/classes/:id
const updateClass = async (req, res) => {
    const { title, class_type, trainer_id, day_of_week, start_time, duration_min, max_capacity, is_active } = req.body;
    try {
        await pool.query(
            'UPDATE classes SET title=?, class_type=?, trainer_id=?, day_of_week=?, start_time=?, duration_min=?, max_capacity=?, is_active=? WHERE id=?',
            [title, class_type, trainer_id, day_of_week, start_time, duration_min, max_capacity, is_active, req.params.id]
        );
        res.json({ message: 'Cập nhật lớp học thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/classes/:id
const removeClass = async (req, res) => {
    try {
        await pool.query('UPDATE classes SET is_active=0 WHERE id=?', [req.params.id]);
        res.json({ message: 'Đã ẩn lớp học' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAll, create, updateStatus, getClasses, getTrainers, createClass, updateClass, removeClass };
