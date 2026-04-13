const router = require('express').Router();
const c = require('../controllers/productController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', c.getOrders);
router.post('/', c.createOrder);
router.patch('/:id/status', requireRole('admin', 'staff'), c.updateOrderStatus);

module.exports = router;
