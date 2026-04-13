const router = require('express').Router();
const c = require('../controllers/packageController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.get('/', c.getAll);
router.post('/', authMiddleware, requireRole('admin'), c.create);
router.put('/:id', authMiddleware, requireRole('admin'), c.update);
router.delete('/:id', authMiddleware, requireRole('admin'), c.remove);

module.exports = router;
