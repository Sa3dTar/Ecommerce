const Product = require('../models/product');
const brand = require('../models/brand')
const category = require('../models/category')

// ==========================================
// 1. جلب كل المنتجات (مع Pagination والفلترة البسيطة)
// ==========================================
exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) * 1 || 1;
    const limit = parseInt(req.query.limit) * 1 || 10;
    const skip = (page - 1) * limit;

    // بناء كائن البحث والفلترة
    const filter = {};
    
    // لو عاوز تفلتر بالحالة (مثلاً published فقط للعملاء)
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // لو عاوز تفلتر بالـ Category
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .populate('brand', 'name slug')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalProducts = await Product.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      results: products.length,
      pagination: {
        total: totalProducts,
        page,
        pages: Math.ceil(totalProducts / limit)
      },
      data: { products }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// ==========================================
// 2. جلب منتج واحد بالتفصيل (عن طريق الـ ID أو الـ Slug)
// ==========================================
exports.getProduct = async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    // التحقق هل القيمة المرسلة هي MongoDB ObjectId صالح أم Slug
    const isObjectId = idOrSlug.match(/^[0-9a-fA-F]{24}$/);
    
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

    const product = await Product.findOne(query)
      .populate('category', 'name slug')
      .populate('brand', 'name slug');

    if (!product) {
      return res.status(404).json({
        status: 'fail',
        message: 'المنتج غير موجود.'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};