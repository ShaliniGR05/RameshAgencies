import express from 'express';
import Product from '../models/Products.js';
import { verifyToken } from './auth.js';

const router = express.Router();

const verifyAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Require Admin Role' });
    }
    next();
};

// GET all products - PUBLIC (optionally filter by category)
router.get('/', async (req, res) => {
    try {
        const filter = req.query.category ? { category: req.query.category } : {};
        const products = await Product.find(filter).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
    }
});

// POST add a new product
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { product_name, description, image_url, price, category } = req.body;
        if (!product_name || !category || price === undefined) {
            return res.status(400).json({ message: 'product_name, category and price are required' });
        }
        const product = new Product({ product_name, description, image_url, price, category });
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error adding product', error });
    }
});

// DELETE a product
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error });
    }
});

// PUT update a product
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { product_name, description, image_url, price, category } = req.body;
        const updated = await Product.findByIdAndUpdate(
            req.params.id,
            { product_name, description, image_url, price, category },
            { new: true, runValidators: true }
        );
        if (!updated) return res.status(404).json({ message: 'Product not found' });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error });
    }
});

export default router;
