const router = require('express').Router();
const { login, me, updateProfile } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/login', login);
router.get('/me', authMiddleware, me);
router.put('/profile', authMiddleware, upload.single('avatar'), updateProfile);

module.exports = router;
