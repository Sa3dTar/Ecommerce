const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { string } = require('zod');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, trim: true },
}, { timestamps: true });

// تشفير كلمة المرور تلقائياً قبل الحفظ في الـ Database

module.exports = mongoose.model('User', userSchema);