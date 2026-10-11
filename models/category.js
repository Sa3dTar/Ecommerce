const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  slug: { type: String, unique: true, lowercase: true },
  parent: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    default: null // لو التصنيف رئيسي بيكون null، لو فرعي بنحط الـ ID بتاع التصنيف الأب
  },
  description: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// إنشاء الـ Slug تلقائياً قبل الحفظ

module.exports = mongoose.model('Category', categorySchema);