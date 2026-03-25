import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret_key_here_change_in_prod'; // In a real app, use env var

// Middleware to verify token
export const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    jwt.verify(token.split(' ')[1], JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Unauthorized' });
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

const verifyAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Require Admin Role' });
    }
    next();
}


// Signup
router.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword }); // isApproved defaults to false
        await user.save();

        res.status(201).json({ message: 'User registered successfully. Please wait for admin approval.' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        if (!user.isApproved && user.role !== 'admin') {
            return res.status(403).json({ message: 'Account not approved yet' });
        }

        const token = jwt.sign({ id: user._id, role: user.role, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, role: user.role, username: user.username });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
});

// Get All Users (Admin)
router.get('/all-users', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const users = await User.find({ role: 'customer' }).sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
});

// Approve User (Admin)
router.put('/approve-user/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
        res.json({ message: 'User approved successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error approving user', error });
    }
});

// Reject (Delete) User (Admin)
router.delete('/reject-user/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User rejected and deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting user', error });
    }
});

export default router;
