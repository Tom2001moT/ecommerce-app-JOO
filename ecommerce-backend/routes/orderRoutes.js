/*
 * =================================================================
 * FILE: /routes/orderRoutes.js (UPDATED)
 * =================================================================
 * We are adding the 'pdfkit' library and a new route to generate
 * and send the PDF invoice.
 */
import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import PDFDocument from 'pdfkit'; // <-- Import PDFKit
const router = express.Router();
import Order from '../models/orderModel.js';
import { protect } from '../middleware/authMiddleware.js';

// ... (All other routes remain the same)
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

router.get('/mine', protect, async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
});

router.get('/:id', protect, async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
});

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


// @desc    Generate PDF Invoice for an order
// @route   GET /api/orders/:id/invoice
// @access  Private
router.get('/:id/invoice', protect, async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order && order.isPaid) {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        // Set headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);
        doc.pipe(res);

        // --- PDF Content Generation ---
        // Header
        doc.fontSize(20).text('Invoice', { align: 'center' });
        doc.moveDown();

        // Store and Customer Details
        doc.fontSize(12).text('ProShop', { align: 'left' });
        doc.text(`Invoice #: ${order._id}`);
        doc.text(`Date: ${new Date(order.paidAt).toLocaleDateString()}`);
        doc.moveDown();
        doc.text('Bill To:');
        doc.text(order.shippingAddress.fullName);
        doc.text(order.shippingAddress.address);
        doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`);
        doc.text(order.shippingAddress.country);
        doc.moveDown(2);

        // Table Header
        doc.font('Helvetica-Bold');
        doc.text('Item', 50, 250);
        doc.text('Qty', 250, 250, { width: 50, align: 'right' });
        doc.text('Price', 300, 250, { width: 100, align: 'right' });
        doc.text('Total', 400, 250, { width: 100, align: 'right' });
        doc.font('Helvetica');
        doc.moveDown();

        // Table Rows (Order Items)
        let y = 270;
        order.orderItems.forEach(item => {
            doc.text(item.name, 50, y);
            doc.text(item.qty.toString(), 250, y, { width: 50, align: 'right' });
            doc.text(`$${item.price.toFixed(2)}`, 300, y, { width: 100, align: 'right' });
            doc.text(`$${(item.qty * item.price).toFixed(2)}`, 400, y, { width: 100, align: 'right' });
            y += 20;
        });
        doc.moveDown(2);

        // Totals
        const totalsY = y + 20;
        doc.font('Helvetica-Bold');
        doc.text('Subtotal:', 300, totalsY, { width: 100, align: 'right' });
        doc.text(`$${order.itemsPrice.toFixed(2)}`, 400, totalsY, { width: 100, align: 'right' });
        doc.text('Tax:', 300, totalsY + 20, { width: 100, align: 'right' });
        doc.text(`$${order.taxPrice.toFixed(2)}`, 400, totalsY + 20, { width: 100, align: 'right' });
        doc.text('Shipping:', 300, totalsY + 40, { width: 100, align: 'right' });
        doc.text(`$${order.shippingPrice.toFixed(2)}`, 400, totalsY + 40, { width: 100, align: 'right' });
        doc.text('Total:', 300, totalsY + 60, { width: 100, align: 'right' });
        doc.text(`$${order.totalPrice.toFixed(2)}`, 400, totalsY + 60, { width: 100, align: 'right' });
        doc.font('Helvetica');
        doc.moveDown(3);

        // Footer
        doc.fontSize(10).text('Thank you for your business!', { align: 'center' });
        // --- End of PDF Content ---

        doc.end();
    } else {
        res.status(404).json({ message: 'Order not found or not paid' });
    }
});

export default router;
