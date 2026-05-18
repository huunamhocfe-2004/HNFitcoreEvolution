const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const actionToColumn = {
    view: 'can_view',
    create: 'can_create',
    edit: 'can_edit',
    delete: 'can_delete',
    assign: 'can_assign',
};

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Malformed token' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

const requireRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }
    next();
};

const requirePermission = (moduleKey, action) => async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const column = actionToColumn[action];
    if (!column) {
        return res.status(500).json({ message: 'Cấu hình quyền không hợp lệ' });
    }

    try {
        const [rows] = await pool.query(`
            SELECT rp.${column} AS allowed
            FROM role_permissions rp
            JOIN permission_modules pm ON pm.id = rp.module_id
            WHERE pm.module_key = ?
            AND rp.role_name = ?
            LIMIT 1
        `, [moduleKey, req.user.role]);

        if (!rows.length || !rows[0].allowed) {
            return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này' });
        }

        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Không kiểm tra được phân quyền' });
    }
};

module.exports = { authMiddleware, requireRole, requirePermission };
