const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const c = require('../controllers/areaController');

router.use(auth);
router.get('/', c.list);
router.get('/:id', c.get);
router.post('/', upload.single('chairmanSignature'), c.create);
router.put('/:id', upload.single('chairmanSignature'), c.update);
router.delete('/:id', c.remove);

module.exports = router;
