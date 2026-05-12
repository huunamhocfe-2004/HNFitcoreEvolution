const router = require('express').Router();
const c = require('../controllers/productController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

// 🔴 phải đặt trước "/" để không bị đè route
router.get('/has-new', requireRole('admin','staff'), c.hasNewOrders);
router.patch('/mark-seen', requireRole('admin','staff'), c.markAllSeen);

// routes chính
router.get('/', c.getOrders);
router.post('/', c.createOrder);
router.patch('/:id/status', requireRole('admin', 'staff'), c.updateOrderStatus);

module.exports = router;