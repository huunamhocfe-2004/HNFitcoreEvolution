const router = require('express').Router();
const c = require('../controllers/subscriptionController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', c.getAll);
router.post('/', requireRole('admin', 'staff', 'member'), c.create);
router.put('/:id/paid', requireRole('admin', 'staff'), c.markPaid);
router.post('/sync-expired', requireRole('admin'), c.syncExpiredMembers);

// Promotions
router.get('/promos', c.getPromos);
router.post('/promos', requireRole('admin'), c.createPromo);
router.put('/promos/:id', requireRole('admin'), c.updatePromo);
router.delete('/promos/:id', requireRole('admin'), c.removePromo);
router.post('/promos/validate', c.validatePromo);

module.exports = router;
