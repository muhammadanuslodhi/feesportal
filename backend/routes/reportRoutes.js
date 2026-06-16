const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/reportController');

router.use(auth);
router.get('/dashboard', c.dashboard);
router.get('/area/:areaId', c.areaReport);

module.exports = router;
