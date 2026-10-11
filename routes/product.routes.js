const express = require('express');
const router = express.Router();
const { getProducts, getProduct } = require('../controllers/product.controller');

// GET /api/products - جلب كل المنتجات
router.get('/', getProducts);

// GET /api/products/:idOrSlug - جلب منتج معين بالـ ID أو الـ Slug
router.get('/:idOrSlug', getProduct);

module.exports = router;