import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'customer'],
        default: 'customer',
    },
    isApproved: {
        type: Boolean,
        default: false, // Default to false for customers
    },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
