const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./config/connectDB')
require('dotenv').config();

// استيراد ملفات الـ Routes (تأكد من إنشائها لاحقاً في مجلد routes)
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const categorRoutes = require('./routes/category.routes')

const app = express();

connectDB()

// --- 1. الـ Middlewares الأساسية ---
app.use(express.json()); // لقراءة البيانات القادمة بصيغة JSON
app.use(express.urlencoded({ extended: true })); // لقراءة البيانات القادمة من الـ Forms
app.use(cors()); // السماح بالاتصال من الـ Frontend (CORS Policy)

// --- 2. ربط الـ Routes (المسارات) ---
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/category', categorRoutes);


// مسار تجريبي للاختبار
app.get('/', (req, res) => {
    res.status(200).json({ success: true, message: 'E-commerce API is running successfully...' });
});

// --- 3. إدارة الأخطاء العامة (Global Error Handler Middleware) ---
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// --- 4. الاتصال بقاعدة البيانات وتشغيل السيرفر ---

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});