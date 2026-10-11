const mongoose = require('mongoose');
const slugify = require('slugify');

// سكيما المتغيرات الفرعية (Variants / SKUs)
const variantSchema = new mongoose.Schema({
  sku: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, 
    trim: true 
  },
  price: { type: Number, required: true, min: 0 },          // سعر البيع
  compareAtPrice: { type: Number, min: 0 },                 // السعر قبل الخصم (للعروض)
  costPrice: { type: Number, required: true, min: 0 },        // سعر التكلفة (مهم جداً للحسابات والأرباح لاحقاً)
  attributes: {
    type: Map,
    of: String, // مثال: {"color": "Red", "size": "XL", "material": "Cotton"}
    required: true
  },
  weight: { type: Number, default: 0 }, // بالجرام أو الكيلو لحسابات الشحن
  isActive: { type: Boolean, default: true }
});

// سكيما المنتج الأساسي
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true },
  description: { type: String, required: true },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    required: true 
  },
  brand: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Brand' 
  },
  images: [{ type: String }], // مصفوفة روابط الصور للمنتج
  type: { 
    type: String, 
    enum: ['simple', 'configurable'], 
    default: 'configurable' 
  },
  variants: [variantSchema], // مصفوفة الـ Variants التابعة للمنتج
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'], 
    default: 'draft' 
  }
}, { 
  timestamps: true 
});

// أتومااتيك عمل Slug فريد مع إضافة جزء عشوائي أو تاريخي لمنع التعارض


module.exports = mongoose.model('Product', productSchema);