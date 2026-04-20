const router = require('express').Router();
const c = require('../controllers/userController');
const { authMiddleware, requireRole } = require('../middleware/auth');

// GET /api/users
// Chỉ admin mới có quyền lấy danh sách tất cả user
router.get('/', authMiddleware, requireRole('admin'), c.getAllUsers);

module.exports = router;