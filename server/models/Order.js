import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    products: [{
        productId: String,
        name: String,
        quantity: Number,
        price: Number,
    }],
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'cancelled'],
        default: 'pending',
    },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
