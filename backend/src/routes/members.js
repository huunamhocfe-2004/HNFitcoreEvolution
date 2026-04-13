const router = require('express').Router();
const c = require('../controllers/memberController');
const upload = require('../middleware/upload');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', c.getAll);
router.get('/:id', c.getOne);
router.post('/', requireRole('admin', 'staff'), upload.single('avatar'), c.create);
router.put('/:id', requireRole('admin', 'staff'), upload.single('avatar'), c.update);
router.delete('/:id', requireRole('admin'), c.remove);
router.get('/:id/qr', c.getQR);
router.post('/checkin', c.checkin);

module.exports = router;
