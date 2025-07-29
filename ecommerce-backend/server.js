/*
 * =================================================================
 * FILE: /server.js (UPDATED)
 * =================================================================
 * This version adds the necessary code to serve static files (like images)
 * from the 'uploads' directory.
 */
import path from 'path'; // Import the 'path' module
import express from 'express';
import dotenv from 'dotenv';
import colors from 'colors';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();
connectDB();
const app = express();

app.use(express.json());

// --- THIS IS THE NEW CODE ---
const __dirname = path.resolve(); // Set __dirname to current directory
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
// When a request comes in for '/uploads', it will be served from the '/uploads' folder.
// We will need to update our image paths to reflect this.

app.get('/api/config/paypal', (req, res) =>
  res.send(process.env.PAYPAL_CLIENT_ID)
);

app.get('/api/config/razorpay', (req, res) => {
    res.send(process.env.RAZORPAY_KEY_ID);
});

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);


/*
 * =================================================================
 * IMPORTANT NOTE ON IMAGE PATHS
 * =================================================================
 * Our current product data has image paths like '/images/airpods.jpg'.
 * For the static serving to work, we should ideally place images in
 * '/uploads/images/airpods.jpg' and update the data accordingly.
 *
 * For now, let's also add a rule to serve the '/images' path from our new folder
 * to avoid having to update all the data immediately.
 */

// Add this line to server.js as well for backward compatibility
app.use('/images', express.static(path.join(__dirname, '/uploads/images')));
