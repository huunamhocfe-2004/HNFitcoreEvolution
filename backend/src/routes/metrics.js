const router = require('express').Router();
const c = require('../controllers/metricsController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', c.getMetrics);
router.post('/', c.addMetric);
router.get('/logs', c.getLogs);
router.post('/logs', c.addLog);

module.exports = router;
