const mongoose = require('mongoose');
const slugify = require('slugify');

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  slug: { type: String, unique: true, lowercase: true },
  logo: { type: String }, // رابط لوجو الماركة
  isActive: { type: Boolean, default: true }
}, { timestamps: true });


module.exports = mongoose.model('Brand', brandSchema);