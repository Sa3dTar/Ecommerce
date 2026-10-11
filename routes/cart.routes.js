const express = require('express');
const router = express.Router();
const { getCart, addToCart, removeFromCart, clearCart } = require('../controllers/cart.controller');

// 1. استيراد الـ Middleware بشكل صحيح من ملفه
const verifyToken = require('../middlewares/verifyToken');

// 2. تطبيق الـ Middleware على جميع مسارات السلة
router.use(verifyToken);

// المسارات
router.get('/', getCart);
router.post('/', addToCart);
router.delete('/:itemId', removeFromCart);
router.delete('/', clearCart);

module.exports = router;