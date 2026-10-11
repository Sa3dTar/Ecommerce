const Category = require('../models/category');

// ==========================================
// 1. جلب كل التصنيفات (Get All Categories)
// ==========================================
exports.getCategories = async (req, res) => {
  try {
    // يمكن جلب التصنيفات النشطة فقط أو الكل بناءً على الـ Query
    const filter = {};
    if (req.query.active) {
      filter.isActive = req.query.active === 'true';
    }

    const categories = await Category.find(filter)
      .populate('parent', 'name slug') // جلب بيانات التصنيف الأب لو وجد
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: categories.length,
      data: { categories }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// ==========================================
// 2. جلب تصنيف واحد بالتفصيل (Get Single Category by ID or Slug)
// ==========================================
exports.getCategory = async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    // التحقق هل القيمة المرسلة ObjectId أم Slug
    const isObjectId = idOrSlug.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

    const category = await Category.findOne(query)
      .populate('parent', 'name slug');

    if (!category) {
      return res.status(404).json({
        status: 'fail',
        message: 'التصنيف غير موجود.'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { category }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};