const router = require('express').Router();
const { login, createAdmin } = require('../controllers/authController');

router.post('/login', login);
router.post('/setup', createAdmin); // One-time admin setup route

module.exports = router;
