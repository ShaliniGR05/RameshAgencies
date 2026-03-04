import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    category_name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    }
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);