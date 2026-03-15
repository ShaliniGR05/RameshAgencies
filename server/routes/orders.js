import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// Create Order (Customer only, technically admin can too but usually for customers)
router.post('/', verifyToken, async (req, res) => {
    try {
        const { products, totalAmount } = req.body;
        const order = new Order({
            userId: req.userId,
            products,
            totalAmount,
        });
        await order.save();

        // Send WhatsApp notification to admin (non-blocking)
        // Dynamic import ensures dotenv has already loaded env vars before Twilio client is created
        User.findById(req.userId)
            .then(async (user) => {
                const username = user ? user.username : 'Unknown Customer';
                const { sendOrderNotification } = await import('../utils/whatsapp.js');
                return sendOrderNotification(order, username);
            })
            .catch(err => {
                console.error('WhatsApp notification failed:', err.message);
            });

        res.status(201).json({ message: 'Order placed successfully', order });
    } catch (error) {
        res.status(500).json({ message: 'Error placing order', error });
    }
});

// Update Order Status (Admin)
router.put('/:id/status', verifyToken, async (req, res) => {
    try {
        if (req.userRole !== 'admin') {
            return res.status(403).json({ message: 'Require Admin Role' });
        }
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json({ message: 'Order status updated', order });
    } catch (error) {
        res.status(500).json({ message: 'Error updating order', error });
    }
});

// Get Orders
router.get('/', verifyToken, async (req, res) => {
    try {
        if (req.userRole === 'admin') {
            // Admin sees all orders, populate user info
            const orders = await Order.find().populate('userId', 'username').sort({ createdAt: -1 });
            res.json(orders);
        } else {
            // Customer sees their own orders
            const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
            res.json(orders);
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders', error });
    }
});

export default router;
