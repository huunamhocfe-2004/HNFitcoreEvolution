const router = require('express').Router();
const { getStats } = require('../controllers/dashboardController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.get('/stats', authMiddleware, requireRole('admin', 'staff'), getStats);

module.exports = router;
