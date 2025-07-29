ProShop: Full-Stack MERN E-commerce Platform
This document provides a complete overview and source code for the ProShop e-commerce application, a fully functional website built with the MERN stack, inspired by platforms like Amazon and Flipkart.

Features
Customer-Facing Features
Product Browsing: View a list of all products on the homepage.

Product Details: Click on any product to see a detailed description, price, and stock status.

Shopping Cart: Add products to a shopping cart and adjust quantities.

User Authentication: Secure user registration and login system using JWT.

Checkout Flow:

Step 1: Shipping: Enter and save a shipping address.

Step 2: Payment: Choose a payment method.

Step 3: Place Order: Review all details on a final summary screen before placing the order.

Payment Integration:

PayPal: Fully integrated payment using the PayPal Sandbox.

Razorpay: Fully integrated payment for Indian users, supporting UPI, cards, etc.

Order History: Logged-in users can view a list of their past orders and their status.

Order Details: View the full details of any past order, including transaction IDs.

PDF Invoice: Download a PDF invoice for any paid order.

Admin Panel Features
Admin Authentication: Secure routes and UI components that are only accessible to admin users.

Product Management (CRUD):

List Products: View all products in a paginated table.

Create Products: Create a new sample product with one click.

Edit Products: Update any detail of an existing product (name, price, stock, etc.).

Delete Products: Permanently remove products from the store.

Tech Stack
Frontend: React.js, React Bootstrap, React Router

Backend: Node.js, Express.js

Database: MongoDB (with Mongoose)

Authentication: JSON Web Tokens (JWT), bcryptjs for password hashing

Payment Gateways: PayPal, Razorpay

PDF Generation: PDFKit

Project Structure
Backend (ecommerce-backend)
/ecommerce-backend
├── config/
│   └── db.js
├── data/
│   └── products.js
├── middleware/
│   └── authMiddleware.js
├── models/
│   ├── orderModel.js
│   ├── productModel.js
│   └── userModel.js
├── routes/
│   ├── orderRoutes.js
│   ├── productRoutes.js
│   └── userRoutes.js
├── uploads/
│   └── images/
│       └── (Your product images go here)
├── utils/
│   └── generateToken.js
├── .env
├── package.json
├── seeder.js
└── server.js

Frontend (frontend)
/frontend
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── AdminRoute.js
│   │   ├── CheckoutSteps.js
│   │   ├── Footer.js
│   │   ├── Header.js
│   │   └── Product.js
│   ├── context/
│   │   └── Store.js
│   ├── screens/
│   │   ├── CartScreen.js
│   │   ├── HomeScreen.js
│   │   ├── LoginScreen.js
│   │   ├── OrderHistoryScreen.js
│   │   ├── OrderScreen.js
│   │   ├── PaymentMethodScreen.js
│   │   ├── PlaceOrderScreen.js
│   │   ├── ProductEditScreen.js
│   │   ├── ProductListScreen.js
│   │   ├── ProductScreen.js
│   │   ├── RegisterScreen.js
│   │   └── ShippingAddressScreen.js
│   ├── App.js
│   ├── bootstrap.min.css
│   └── index.js
├── .env
└── package.json

Environment Variables (.env)
You need to create a .env file in the root of the ecommerce-backend folder with the following variables:

NODE_ENV=development
PORT=5000

# Your MongoDB Connection String from Atlas
MONGO_URI=mongodb+srv://...

# A long, random string for signing tokens
JWT_SECRET=yourrandomjwtsecretkey

# Your API keys from the developer dashboards
PAYPAL_CLIENT_ID=YOUR_PAYPAL_CLIENT_ID
RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_KEY_SECRET

Getting Started
Prerequisites
Node.js installed

MongoDB Atlas account

PayPal Developer account

Razorpay Test account

Installation & Setup
Clone the repository / Set up the files:
Create the folder structure as shown above and populate the files with the source code provided below.

Install Backend Dependencies:
Navigate to the ecommerce-backend directory and run:

npm install

Install Frontend Dependencies:
Navigate to the frontend directory and run:

npm install

Set Up Environment Variables:
Create the ecommerce-backend/.env file and add your secret keys as described above.

Seed the Database:
To populate the database with sample products, run the seeder script from the ecommerce-backend directory:

npm run seed

To destroy all data, run:

npm run seed:destroy

Running the Application
You need to run both the backend and frontend servers simultaneously in separate terminals.

Run Backend Server:
From the ecommerce-backend directory:

npm start

The server will be running on http://localhost:5000.

Run Frontend Server:
From the frontend directory:

npm start

The application will open in your browser at http://localhost:3000.

Complete Source Code
Backend: ecommerce-backend
<details>
<summary><strong>package.json</strong></summary>

{
  "name": "ecommerce-backend",
  "version": "1.0.0",
  "description": "E-commerce API",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "seed": "node seeder.js",
    "seed:destroy": "node seeder.js -d"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "colors": "^1.4.0",
    "dotenv": "^16.0.0",
    "express": "^4.17.3",
    "jsonwebtoken": "^8.5.1",
    "mongoose": "^6.2.9",
    "pdfkit": "^0.13.0",
    "razorpay": "^2.8.3"
  }
}

</details>

<details>
<summary><strong>server.js</strong></summary>

import path from 'path';
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

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
app.use('/images', express.static(path.join(__dirname, '/uploads/images')));

app.get('/api/config/paypal', (req, res) => res.send(process.env.PAYPAL_CLIENT_ID));
app.get('/api/config/razorpay', (req, res) => res.send(process.env.RAZORPAY_KEY_ID));

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server running on port ${PORT}`.yellow.bold));

</details>

<details>
<summary><strong>config/db.js</strong></summary>

import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    process.exit(1);
  }
};

export default connectDB;

</details>

<details>
<summary><strong>middleware/authMiddleware.js</strong></summary>

import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
      }
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

export { protect, admin };

</details>

<details>
<summary><strong>models/orderModel.js</strong></summary>

import mongoose from 'mongoose';

const orderSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  orderItems: [{
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
  }],
  shippingAddress: {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  paymentMethod: { type: String, required: true },
  paymentResult: { id: String, status: String, update_time: String, email_address: String },
  itemsPrice: { type: Number, required: true, default: 0.0 },
  taxPrice: { type: Number, required: true, default: 0.0 },
  shippingPrice: { type: Number, required: true, default: 0.0 },
  totalPrice: { type: Number, required: true, default: 0.0 },
  isPaid: { type: Boolean, required: true, default: false },
  paidAt: { type: Date },
  isDelivered: { type: Boolean, required: true, default: false },
  deliveredAt: { type: Date },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;

</details>

<details>
<summary><strong>models/productModel.js</strong></summary>

import mongoose from 'mongoose';

const productSchema = mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  countInStock: { type: Number, required: true, default: 0 },
  rating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;

</details>

<details>
<summary><strong>models/userModel.js</strong></summary>

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, required: true, default: false },
}, { timestamps: true });

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
export default User;

</details>

<details>
<summary><strong>routes/orderRoutes.js</strong></summary>

import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import PDFDocument from 'pdfkit';
const router = express.Router();
import Order from '../models/orderModel.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// All routes here... (create, get mine, get by id, pay, razorpay, invoice)
// ... (Full code as provided in previous steps)

</details>

<details>
<summary><strong>routes/productRoutes.js</strong></summary>

import express from 'express';
const router = express.Router();
import Product from '../models/productModel.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// All routes here... (get all, get by id, create, update, delete)
// ... (Full code as provided in previous steps)

</details>

<details>
<summary><strong>routes/userRoutes.js</strong></summary>

import express from 'express';
const router = express.Router();
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

// All routes here... (login, register)
// ... (Full code as provided in previous steps)

</details>

<details>
<summary><strong>seeder.js</strong></summary>

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import products from './data/products.js';
import Product from './models/productModel.js';
import User from './models/userModel.js';
import connectDB from './config/db.js';

dotenv.config();

const importData = async () => {
  try {
    await connectDB();
    await Product.deleteMany();
    await User.deleteMany();
    await Product.insertMany(products);
    console.log('Data Imported!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await Product.deleteMany();
    await User.deleteMany();
    console.log('Data Destroyed!'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}

</details>

<details>
<summary><strong>utils/generateToken.js</strong></summary>

import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export default generateToken;

</details>

Frontend: frontend
<details>
<summary><strong>package.json</strong></summary>

{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@paypal/react-paypal-js": "^7.8.1",
    "@testing-library/jest-dom": "^5.16.4",
    "@testing-library/react": "^13.1.1",
    "@testing-library/user-event": "^13.5.0",
    "axios": "^0.27.2",
    "bootstrap": "^5.1.3",
    "react": "^18.0.0",
    "react-bootstrap": "^2.2.3",
    "react-dom": "^18.0.0",
    "react-router-bootstrap": "^0.26.1",
    "react-router-dom": "^6.3.0",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "proxy": "http://127.0.0.1:5000"
}

</details>

<details>
<summary><strong>public/index.html</strong></summary>

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="E-commerce site" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css" />
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    <title>Welcome to ProShop</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>

</details>

<details>
<summary><strong>src/index.js</strong></summary>

import React from 'react';
import ReactDOM from 'react-dom/client';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { StoreProvider } from './context/Store';
import './bootstrap.min.css';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <StoreProvider>
      <PayPalScriptProvider deferLoading={true}>
        <App />
      </PayPalScriptProvider>
    </StoreProvider>
  </React.StrictMode>
);

</details>

<details>
<summary><strong>src/App.js</strong></summary>

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
// ... (all component and screen imports)
import Header from './components/Header';
import Footer from './components/Footer';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import CartScreen from './screens/CartScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ShippingAddressScreen from './screens/ShippingAddressScreen';
import PaymentMethodScreen from './screens/PaymentMethodScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import AdminRoute from './components/AdminRoute';
import ProductListScreen from './screens/ProductListScreen';
import ProductEditScreen from './screens/ProductEditScreen';

const App = () => {
  return (
    <Router>
      <Header />
      <main className="py-3">
        <Container>
          <Routes>
            {/* User Routes */}
            <Route path="/" element={<HomeScreen />} exact />
            <Route path="/product/:id" element={<ProductScreen />} />
            <Route path="/cart" element={<CartScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/shipping" element={<ShippingAddressScreen />} />
            <Route path="/payment" element={<PaymentMethodScreen />} />
            <Route path="/placeorder" element={<PlaceOrderScreen />} />
            <Route path="/order/:id" element={<OrderScreen />} />
            <Route path="/orderhistory" element={<OrderHistoryScreen />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route path="products" element={<ProductListScreen />} />
              <Route path="product/:id" element={<ProductEditScreen />} />
            </Route>
          </Routes>
        </Container>
      </main>
      <Footer />
    </Router>
  );
};
export default App;

</details>

<details>
<summary><strong>src/context/Store.js</strong></summary>

// ... (Full code for the Store context as provided in previous steps)

</details>

<details>
<summary><strong>All Component and Screen Files</strong></summary>

// The code for all other files in `src/components` and `src/screens`
// can be found in the previous steps where they were created and updated.
// This includes:
// - Header.js, Footer.js, Product.js, CheckoutSteps.js, AdminRoute.js
// - HomeScreen.js, ProductScreen.js, CartScreen.js, LoginScreen.js, etc.
// - ProductListScreen.js, ProductEditScreen.js

</details>