import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import productRoutes from './routes/products.js';

// Load env vars FIRST before any module that reads them
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS — allow all origins (auth is protected by JWT, so this is safe)
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

// Database Connection
mongoose.connect('mongodb+srv://rksaran2006:Saran%40192@saran.wsvwwra.mongodb.net/contact-manager?retryWrites=true&w=majority')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  // Initialise Twilio WhatsApp after env vars are loaded
  await import('./utils/whatsapp.js');
});
