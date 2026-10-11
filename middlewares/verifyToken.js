const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    // التأكد من وجود الهيدر وأنه يبدأ بكلمة Bearer
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'fail',
        message: 'غير موثق، يرجى تسجيل الدخول وإرفاق التوكن في الـ Headers أولاً.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'التوكن غير صالح أو انتهت صلاحيته.'
    });
  }
};

module.exports = verifyToken;