import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    product_name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    image_url: {
        type: String
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    category: {
        type: String,
        required: true
    }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);