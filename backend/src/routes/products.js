const router = require('express').Router();
const c = require('../controllers/productController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Products
router.get('/', c.getAll);
router.post('/', authMiddleware, requireRole('admin'), upload.single('image'), c.create);
router.put('/:id', authMiddleware, requireRole('admin'), upload.single('image'), c.update);
router.delete('/:id', authMiddleware, requireRole('admin'), c.remove);

module.exports = router;
