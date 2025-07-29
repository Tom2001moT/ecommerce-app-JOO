import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
const router = express.Router();
import Order from '../models/orderModel.js';
import { protect } from '../middleware/authMiddleware.js';

// ... (existing POST '/' route is unchanged)
router.post('/', protect, async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;
  if (orderItems && orderItems.length === 0) {
    res.status(400).json({ message: 'No order items' });
    return;
  } else {
    const order = new Order({
      orderItems: orderItems.map((x) => ({ ...x, product: x._id, _id: undefined })),
      user: req.user._id,
      shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice,
    });
    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  }
});


// @desc    Get logged in user's orders
// @route   GET /api/orders/mine
// @access  Private
router.get('/mine', protect, async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
});


// ... (existing GET '/:id' route is unchanged)
router.get('/:id', protect, async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
});


// ... (existing POST '/:id/razorpay' route is unchanged)
router.post('/:id/razorpay', protect, async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        const options = {
            amount: order.totalPrice * 100,
            currency: "INR",
            receipt: `receipt_order_${order._id}`,
        };
        const razorpayOrder = await instance.orders.create(options);
        res.json(razorpayOrder);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
});


// ... (existing PUT '/:id/pay' route is unchanged)
router.put('/:id/pay', protect, async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
        if (req.body.razorpay_payment_id) {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
            const body = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest('hex');
            if (expectedSignature === razorpay_signature) {
                 order.isPaid = true;
                 order.paidAt = Date.now();
                 order.paymentResult = { id: razorpay_payment_id, status: 'completed', update_time: Date.now(), email_address: order.user.email };
                 const updatedOrder = await order.save();
                 res.json(updatedOrder);
            } else {
                res.status(400).json({ message: 'Invalid Razorpay Signature' });
            }
        } else {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = { id: req.body.id, status: req.body.status, update_time: req.body.update_time, email_address: req.body.payer.email_address };
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        }
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
});

export default router;
