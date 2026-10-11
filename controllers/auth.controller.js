const User = require('../models/user');
const generateJWT = require('../middlewares/generatejwt');
const bcrypt = require('bcrypt');

// ==========================================
// 1. تسجيل مستخدم جديد (Register)
// ==========================================
exports.register = async (req, res) => {
  try {
    let { name, email, password, phone } = req.body;

    // التأكد من عدم وجود المستخدم مسبقاً
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'البريد الإلكتروني مستخدم بالفعل.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // بناء كائن المستخدم الجديد (لو لم يُرسل دور، سياخذ الـ default المرفق في الـ Schema مثل 'customer')
    const userData = {
      name,
      email,
      password: hashedPassword,
      phone
    };

    // إنشاء المستخدم الجديد (Mongoose سيتحقق تلقائياً من الـ enum للـ role)
    const newUser = await User.create(userData);

    // توليد التوكن للمستخدم الجديد
    const token = generateJWT(newUser._id);

    // إخفاء كلمة المرور من الرد
    newUser.password = undefined;

    res.status(201).json({
      status: 'success',
      message: 'تم تسجيل المستخدم بنجاح',
      token,
      data: { user: newUser }
    });
  } catch (error) {
    // التقاط أخطاء الـ Validation لو الـ role المرسل غير موجود في الـ enum
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'fail',
        message: 'خطأ في البيانات المدخلة، تأكد من صحة الدور (Role) المحدد.'
      });
    }
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// ==========================================
// 2. تسجيل الدخول (Login)
// ==========================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // التأكد من إدخال البريد وكلمة المرور
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'يرجى إدخال البريد الإلكتروني وكلمة المرور.'
      });
    }

    // البحث عن المستخدم مع جلب الباسورد (باستخدام .select('+password') لتخطي select: false في الـ Schema)
    const user = await User.findOne({ email }).select('+password');

    // التحقق من صحة كلمة المرور
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    
    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 'fail',
        message: 'كلمة المرور غير صحيحة.'
      });
    }

    // تحديث وقت آخر تسجيل دخول
    await user.save({ validateBeforeSave: false });

    // توليد التوكن
    const token = generateJWT(user._id);

    // إخفاء كلمة المرور من الرد لأسباب أمنية
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      message: 'تم تسجيل الدخول بنجاح',
      token,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// ==========================================
// 3. جلب بيانات المستخدم الحالي (GetMe)
// ==========================================
exports.getMe = async (req, res) => {
  try {
    // req.user بيتم جلبه من الـ verifyToken middleware
    const user = await User.findById(req.user._id);
    
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};