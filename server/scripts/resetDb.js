import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Order from '../models/Order.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const MONGO_URI = 'mongodb+srv://rksaran2006:Saran%40192@saran.wsvwwra.mongodb.net/contact-manager?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
    .then(() => resetDb())
    .catch(err => {
        console.error('DB Connection Error:', err);
        process.exit(1);
    });

async function resetDb() {
    try {
        console.log('Dropping collections...');
        try {
            await mongoose.connection.collection('users').drop();
            console.log('Users collection dropped.');
        } catch (e) {
            console.log('Users collection might not exist or empty.');
        }

        try {
            await mongoose.connection.collection('orders').drop();
            console.log('Orders collection dropped.');
        } catch (e) {
            console.log('Orders collection might not exist or empty.');
        }

        console.log('Seeding Admin...');
        const adminUsername = 'admin';
        const adminPassword = 'adminpassword123';

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
        console.error('Error resetting DB:', error);
        process.exit(1);
    }
}
