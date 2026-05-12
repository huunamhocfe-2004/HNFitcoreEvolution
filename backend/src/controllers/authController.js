const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const getExistingAvatar = (avatar) => {
    if (!avatar) return null;
    if (!avatar.startsWith('/uploads/')) return avatar;

    const filename = path.basename(avatar);
    const filePath = path.join(__dirname, '../../uploads', filename);

    return fs.existsSync(filePath) ? avatar : null;
};

// POST /api/auth/login
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: 'Email và mật khẩu không được để trống' });

    console.log('Login attempt:', email);
    try {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ? AND is_active = 1', [email]
        );
        console.log('User found:', rows.length > 0);
        if (!rows.length)
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });

        const user = rows[0];
        const valid = await bcrypt.compare(password, user.password_hash);
        console.log('Password valid:', valid);
        if (!valid)
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });

        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Get member_id if role is member
        let memberId = null;
        if (user.role === 'member') {
            const [mRows] = await pool.query('SELECT id FROM members WHERE user_id = ?', [user.id]);
            if (mRows.length) memberId = mRows[0].id;
        }

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: getExistingAvatar(user.avatar),
                member_id: memberId,
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/auth/me
const me = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT u.id, u.name, u.email, u.phone, u.role, u.avatar, u.created_at, m.id AS member_id
            FROM users u
            LEFT JOIN members m ON m.user_id = u.id
            WHERE u.id = ?
        `, [req.user.id]);

        if (!rows.length) return res.status(404).json({ message: 'User not found' });
        res.json({ ...rows[0], avatar: getExistingAvatar(rows[0].avatar) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
    let { name, phone, avatar } = req.body;
    if (req.file) {
        avatar = `/uploads/${req.file.filename}`;
    }
    try {
        await pool.query(
            'UPDATE users SET name=?, phone=?, avatar=COALESCE(?, avatar) WHERE id=?',
            [name, phone, avatar || null, req.user.id]
        );
        res.json({ message: 'Cập nhật thông tin thành công', avatar });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { login, me, updateProfile };
