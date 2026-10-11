const Cart = require('../models/cart'); // افترض أن ملف السلة اسمه cart.model.js
const Product = require('../models/product');

// ==========================================
// 1. جلب سلة التسوق الخاصة بالمستخدم الحالي
// ==========================================
exports.getCart = async (req, res) => {
  try {
    const userId = req.user._id; // قادم من الـ verifyToken middleware

    let cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      select: 'name slug images type variants'
    });

    if (!cart) {
      return res.status(200).json({
        status: 'success',
        data: { cart: { items: [], totalPrice: 0 } }
      });
    }

    // حساب إجمالي السلة تفصيلياً بناءً على سعر الـ Variant المختار
    let totalPrice = 0;
    const formattedItems = cart.items.map(item => {
      const product = item.product;
      if (!product) return null;

      // العثور على الـ Variant المطابق داخل المنتج
      const variant = product.variants.id(item.variantId) || product.variants[0];
      const price = variant ? variant.price : 0;
      const itemTotal = price * item.quantity;
      totalPrice += itemTotal;

      return {
        _id: item._id,
        product: {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          image: product.images && product.images.length > 0 ? product.images[0] : null
        },
        variant: variant ? {
          _id: variant._id,
          sku: variant.sku,
          price: variant.price,
          attributes: variant.attributes
        } : null,
        quantity: item.quantity,
        itemTotal
      };
    }).filter(Boolean);

    res.status(200).json({
      status: 'success',
      data: {
        cart: {
          _id: cart._id,
          items: formattedItems,
          totalPrice
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// ==========================================
// 2. إضافة منتج للسلة (أو تحديث كميته إذا كان موجوداً مسبقاً)
// ==========================================
exports.addToCart = async (req, res) => {
  try {
    console.log("=== DEBUG START ===");
    console.log("req.user:", req.user);
    console.log("req.body:", req.body);
    console.log("=== DEBUG END ===");
    const userId = req.user.id || req.user._id;
    const { productId, variantId, quantity = 1 } = req.body;

    if (!productId || !variantId) {
      return res.status(400).json({
        status: 'fail',
        message: 'يجب تحديد المنتج والـ Variant المطلوب.'
      });
    }

    // 1. التأكد من أن المنتج موجود وأن الـ Variant صالح ومتاح وجلب سعره الحقيقي
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ status: 'fail', message: 'المنتج غير موجود.' });
    }

    const variant = product.variants.id(variantId);
    if (!variant || !variant.isActive) {
      return res.status(404).json({ status: 'fail', message: 'الـ Variant المطلوب غير متوفر.' });
    }

    const itemPrice = variant.price; // جلب السعر من الـ Variant مباشرة

    // 2. البحث عن سلة المستخدم
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // لو السلة غير موجودة، أنشئها مع السعر
      cart = await Cart.create({
        user: userId,
        items: [{ product: productId, variantId, quantity, price: itemPrice }]
      });
    } else {
      // لو السلة موجودة، ابحث هل نفس المنتج ونفس الـ Variant موجودان مسبقاً؟
      const itemIndex = cart.items.findIndex(
        item => item.product.toString() === productId && item.variantId.toString() === variantId
      );

      if (itemIndex > -1) {
        // تحديث الكمية (مع إمكانية تحديث السعر الحالي لو تغير)
        cart.items[itemIndex].quantity += Number(quantity);
        cart.items[itemIndex].price = itemPrice;
      } else {
        // إضافة عنصر جديد للسلة مع سعره
        cart.items.push({ product: productId, variantId, quantity, price: itemPrice });
      }

      await cart.save();
    }

    // 3. حساب الـ totalPrice الإجمالي للسلة
    let totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.status(200).json({
      status: 'success',
      message: 'تم تحديث السلة بنجاح',
      data: { 
        cart: {
          _id: cart._id,
          user: cart.user,
          items: cart.items,
          totalPrice
        } 
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// ==========================================
// 3. حذف منتج أو Variant معين من السلة
// ==========================================
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params; // الـ _id الخاص بالعنصر داخل مصفوفة الـ items

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ status: 'fail', message: 'السلة غير موجودة.' });
    }

    // إزالة العنصر من المصفوفة
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    await cart.save();

    res.status(200).json({
      status: 'success',
      message: 'تم حذف المنتج من السلة بنجاح',
      data: { cart }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// ==========================================
// 4. تفريغ السلة بالكامل (Clear Cart)
// ==========================================
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    await Cart.findOneAndUpdate({ user: userId }, { items: [] });

    res.status(200).json({
      status: 'success',
      message: 'تم تفريغ السلة بنجاح'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};