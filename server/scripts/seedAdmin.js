import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: '../.env' }); // Adjust path if needed, or just rely on default if run from root relative

// Hardcoded for simplicity in this script as per request structure, 
// normally would load from env or args.
const MONGO_URI = 'mongodb+srv://rksaran2006:Saran%40192@saran.wsvwwra.mongodb.net/contact-manager?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
    .then(() => seedAdmin())
    .catch(err => {
        console.error('DB Connection Error:', err);
        process.exit(1);
    });

async function seedAdmin() {
    try {
        const adminUsername = 'admin';
        const adminPassword = 'adminpassword123'; // Change this!

        const existingAdmin = await User.findOne({ username: adminUsername });
        if (existingAdmin) {
            console.log('Admin already exists');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const admin = new User({
            username: adminUsername,
            password: hashedPassword,
            role: 'admin',
            isApproved: true,
        });

        await admin.save();
        console.log('Admin created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
}
