const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/feeController');

router.use(auth);
router.get('/', c.list);
router.post('/', c.upsert);
router.put('/:id', c.update);

module.exports = router;
