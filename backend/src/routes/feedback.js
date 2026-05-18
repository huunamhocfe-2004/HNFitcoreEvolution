const router = require('express').Router();
const c = require('../controllers/feedbackController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);
router.get('/', requireRole('admin', 'staff'), c.getAll);
router.get('/mine', requireRole('member'), c.getMine);
router.post('/', requireRole('member'), c.create);
router.put('/:id/reply', requireRole('admin', 'staff'), c.reply);

module.exports = router;
