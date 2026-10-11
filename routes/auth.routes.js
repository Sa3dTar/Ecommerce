const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/auth.controller');
const verifyToken = require('../middlewares/verifyToken'); // أنشئه لاحقاً لحماية المسارات

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getMe); // مسار جلب بيانات المستخدم الحالي

module.exports = router;