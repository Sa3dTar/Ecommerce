const Order = require('../models/order'); // افترض أن اسم ملف السكيما هو order.model.js
const Cart = require('../models/cart');
const Product = require('../models/product');

// ==========================================
// 1. إنشاء طلب جديد من سلة التسوق (Create Order)
// ==========================================
exports.createOrder = async (req, res) => {
  try {
    // تم تعديلها هنا لضمان قراءة الـ ID سواء كان id أو _id من الـ Token
    const userId = req.user.id || req.user._id;
    const { shippingAddress, paymentMethod } = req.body;

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({
        status: 'fail',
        message: 'يرجى إدخال عنوان الشحن وطريقة الدفع.'
      });
    }

    // جلب سلة التسوق الخاصة بالمستخدم
    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'سلة التسوق فارغة.'
      });
    }

    let orderItems = [];
    let totalPrice = 0;

    // حساب الأسعار والتحقق من المنتجات والـ Variants
    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ status: 'fail', message: 'المنتج غير موجود.' });
      }

      // البحث عن الـ Variant المطابق لجلب سعره بدقة
      const variant = product.variants.id(item.variantId) || product.variants[0];
      const price = variant ? variant.price : 0;

      orderItems.push({
        product: product._id,
        variantId: item.variantId,
        quantity: item.quantity,
        price
      });

      totalPrice += price * item.quantity;
    }

    // إنشاء الطلب الجديد
    const order = await Order.create({
      user: userId,
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      isPaid: false, 
      status: 'Pending'
    });

    // تفريغ السلة بعد إنشاء الطلب بنجاح
    cart.items = [];
    await cart.save();

    res.status(201).json({
      status: 'success',
      message: 'تم إنشاء الطلب بنجاح',
      data: { order }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
// ==========================================
// 2. جلب طلبات المستخدم الحالي (Get My Orders)
// ==========================================
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ user: userId })
      .populate('orderItems.product', 'name images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: orders 
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// ==========================================
// 3. جلب كل الطلبات للإدارة (Admin: Get All Orders)
// ==========================================
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email phone')
      .populate('orderItems.product', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: { orders }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// ==========================================
// 4. تحديث حالة الطلب من قبل الإدارة (Admin: Update Order Status)
// ==========================================
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Pending, Processing, Shipped, Delivered, Cancelled

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ status: 'fail', message: 'الطلب غير موجود.' });
    }

    order.status = status;

    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    await order.save();

    res.status(200).json({
      status: 'success',
      message: 'تم تحديث حالة الطلب بنجاح',
      data: { order }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};