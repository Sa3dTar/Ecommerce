const express = require('express');
const router = express.Router();
const { getCategories, getCategory } = require('../controllers/category.controller');

// GET /api/categories - جلب كل التصنيفات
router.get('/', getCategories);

// GET /api/categories/:idOrSlug - جلب تصنيف معين بالـ ID أو الـ Slug
router.get('/:idOrSlug', getCategory);

module.exports = router;