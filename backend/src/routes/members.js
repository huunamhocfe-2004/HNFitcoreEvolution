const router = require('express').Router();
const c = require('../controllers/memberController');
const upload = require('../middleware/upload');
const { authMiddleware, requirePermission } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', c.getAll);
router.get('/checkins/recent', c.getRecentCheckins);
router.get('/:id', c.getOne);
router.post('/', requirePermission('members', 'create'), upload.single('avatar'), c.create);
router.put('/:id', requirePermission('members', 'edit'), upload.single('avatar'), c.update);
router.delete('/:id', requirePermission('members', 'delete'), c.remove);
router.get('/:id/qr', c.getQR);
router.post('/checkin', c.checkin);
router.post('/:id/renewal-request', requirePermission('members', 'assign'), c.createRenewalRequest);

module.exports = router;
