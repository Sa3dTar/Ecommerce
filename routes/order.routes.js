const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getMyOrders, 
  getAllOrders, 
  updateOrderStatus 
} = require('../controllers/order.controller');

const verifyToken = require('../middlewares/verifyToken');

// مسارات العميل (تتطلب تسجيل دخول)
router.use(verifyToken);
router.post('/' , createOrder);
router.get('/my-orders', getMyOrders);

// مسارات الإدارة (تتطلب صلاحية Admin)
// router.get('/admin/orders', verifyAdmin, getAllOrders);
// router.put('/admin/orders/:id/status', verifyAdmin, updateOrderStatus);

module.exports = router;