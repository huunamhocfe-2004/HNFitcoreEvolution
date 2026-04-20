const router = require('express').Router();
const c = require('../controllers/trainerController');
const multer = require('multer');
const { authMiddleware, requireRole } = require('../middleware/auth');

const upload = require('../middleware/upload');

router.get('/', c.getAll);

router.use(authMiddleware);
router.post('/', requireRole('admin'), upload.single('avatar'), c.create);
router.put('/:id', requireRole('admin'), upload.single('avatar'), c.update);
router.delete('/:id', requireRole('admin'), c.remove);

module.exports = router;
