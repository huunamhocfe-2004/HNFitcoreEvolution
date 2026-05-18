const router = require('express').Router();
const c = require('../controllers/permissionController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', requireRole('admin', 'staff'), c.getAll);
router.put('/', requireRole('admin'), c.updateAll);

module.exports = router;
