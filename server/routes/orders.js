import express from 'express';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// Create Order (Customer)
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

// Update Order Status (Admin only — approve / reject)
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

// Edit Order (User — only pending orders)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Only the owner can edit
        if (order.userId.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to edit this order' });
        }

        // Can only edit pending orders
        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending orders can be edited' });
        }

        const { products, totalAmount } = req.body;
        order.products = products;
        order.totalAmount = totalAmount;
        order.isEdited = true;
        await order.save();

        // Notify admin via WhatsApp (non-blocking)
        User.findById(req.userId)
            .then(async (user) => {
                const username = user ? user.username : 'Unknown Customer';
                const { sendOrderEditNotification } = await import('../utils/whatsapp.js');
                return sendOrderEditNotification(order, username);
            })
            .catch(err => {
                console.error('WhatsApp edit notification failed:', err.message);
            });

        res.json({ message: 'Order updated successfully', order });
    } catch (error) {
        res.status(500).json({ message: 'Error updating order', error });
    }
});

// Delete Order (User — only pending orders)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Only the owner can delete
        if (order.userId.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this order' });
        }

        // Can only delete pending orders
        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending orders can be deleted' });
        }

        const orderId = order._id.toString();
        const deletedProducts = order.products; // capture for notification
        const deletedTotal = order.totalAmount;

        // Soft-delete: mark as 'deleted' so admin can still see it
        order.status = 'deleted';
        await order.save();

        // Notify admin via WhatsApp (non-blocking)
        User.findById(req.userId)
            .then(async (user) => {
                const username = user ? user.username : 'Unknown Customer';
                const { sendOrderDeleteNotification } = await import('../utils/whatsapp.js');
                return sendOrderDeleteNotification(orderId, username, deletedProducts, deletedTotal);
            })
            .catch(err => {
                console.error('WhatsApp delete notification failed:', err.message);
            });

        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting order', error });
    }
});

// Get Orders
router.get('/', verifyToken, async (req, res) => {
    try {
        if (req.userRole === 'admin') {
            // Admin sees all orders.
            // We want 'deleted' and edited ones to float to the top, so we sort by updatedAt descendingly.
            const orders = await Order.find().populate('userId', 'username').sort({ updatedAt: -1 });
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
