const router = require('express').Router();
const c = require('../controllers/feedbackController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);
router.get('/', requireRole('admin', 'staff'), c.getAll);
router.post('/', requireRole('member'), c.create);

module.exports = router;
