const router = require('express').Router();
const c = require('../controllers/bookingController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.get('/classes', c.getClasses);
router.get('/trainers', c.getTrainers);

router.use(authMiddleware);

router.get('/', c.getAll);
router.post('/', c.create);
router.patch('/:id/status', requireRole('admin', 'staff'), c.updateStatus);

// Classes Admin
router.post('/classes', requireRole('admin'), c.createClass);
router.put('/classes/:id', requireRole('admin'), c.updateClass);
router.delete('/classes/:id', requireRole('admin'), c.removeClass);

module.exports = router;
