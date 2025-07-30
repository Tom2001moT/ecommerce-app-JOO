**🥰by: WDG🥰**

# ProShop: Full-Stack MERN E-commerce Platform

This document provides a complete overview and source code for the ProShop e-commerce application. It is a fully functional, feature-rich website built with the MERN (MongoDB, Express.js, React.js, Node.js) stack, inspired by modern platforms like Amazon and Flipkart. The application is designed as a Single-Page Application (SPA) for a fast and responsive user experience, with a robust backend to handle all business logic securely and efficiently.

## Features

### Customer-Facing Features

- **Product Browse & Details**: Users can seamlessly browse a grid of all available products on the homepage. Clicking on any product card navigates them to a dedicated details page with an expanded view, larger image, detailed description, price, and stock availability, all without a full page reload. This dynamic rendering is a core benefit of the React frontend.

- **Dynamic Shopping Cart**: A persistent shopping cart allows users to add products and adjust quantities. The cart's state is saved to the browser's local storage, ensuring items remain even if the user closes the tab.

- **Secure User Authentication**: The platform features a complete authentication system for registration and login. Passwords are securely hashed using the bcryptjs library. Upon login, the backend issues a JSON Web Token (JWT) to authenticate subsequent user requests for a secure session.

- **Multi-Step Checkout Flow**: A guided, multi-step checkout process includes:
  - **Step 1: Shipping**: Users enter and save a shipping address.
  - **Step 2: Payment**: Users select their preferred payment method.
  - **Step 3: Place Order**: Users review a comprehensive summary of their order before finalizing the purchase.

- **Dual Payment Gateway Integration**: The application integrates two leading payment gateways in a sandbox environment:
  - **PayPal**: A globally recognized option for international payments.
  - **Razorpay**: A premier choice for users in India, offering local payment methods like UPI and net banking.

- **Comprehensive Order History & Tracking**: Logged-in users can access a personal dashboard with their complete order history, showing order ID, date, total price, and payment and delivery status.

- **Detailed Order Summary**: Users can view a detailed breakdown of any specific order, including items, shipping address, and payment transaction ID.

- **On-the-Fly PDF Invoice Generation**: Users can download a professionally formatted PDF invoice for any paid order, generated dynamically by the backend using the pdfkit library.

### Admin Panel Features

- **Secure Admin Authentication**: Role-based access control ensures that only authenticated admin users can access administrative routes, using a custom middleware and an isAdmin flag in the user model.

- **Full Product Management (CRUD)**: Admins have complete control over the store's inventory:
  - **List Products**: View a comprehensive, paginated table of all products.
  - **Create Products**: Generate a new sample product to be edited.
  - **Edit Products**: Update product details like name, price, description, image, and stock count.
  - **Delete Products**: Permanently remove products from the database.

## Tech Stack

- **Frontend**: React.js, React Bootstrap, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JSON Web Tokens (JWT), bcryptjs
- **Payment Gateways**: PayPal, Razorpay
- **PDF Generation**: PDFKit

## Project Structure

### Backend (ecommerce-backend)

```
/ecommerce-backend
├── config/
│   └── db.js              # Database connection logic
├── data/
│   └── products.js        # Sample data for seeding
├── middleware/
│   └── authMiddleware.js  # Custom middleware (e.g., for authentication)
├── models/
│   ├── orderModel.js      # Mongoose schemas for database collections
│   ├── productModel.js
│   └── userModel.js
├── routes/
│   ├── orderRoutes.js     # API endpoint definitions
│   ├── productRoutes.js
│   └── userRoutes.js
├── uploads/
│   └── images/            # Folder for static assets like images
├── utils/
│   └── generateToken.js   # Utility functions (e.g., JWT generator)
├── .env                   # Environment variables (secrets)
├── package.json           # Project dependencies and scripts
├── seeder.js              # Script to seed the database
└── server.js              # Main backend server entry point
```

### Frontend (frontend)

```
/frontend
├── public/
│   └── index.html         # Public assets and the main HTML file
└── src/
    ├── components/        # Reusable React components
    │   ├── AdminRoute.js
    │   ├── CheckoutSteps.js
    │   ├── Footer.js
    │   ├── Header.js
    │   └── Product.js
    ├── context/
    │   └── Store.js       # Global state management (React Context)
    ├── screens/
    │   ├── CartScreen.js
    │   ├── HomeScreen.js
    │   └── (and all other screens)
    ├── App.js             # Main application component with routing
    ├── bootstrap.min.css  # Custom Bootstrap theme
    ├── index.js           # Top-level entry point for the React app
    ├── .env               # (Optional) Frontend environment variables
    └── package.json       # Project dependencies and scripts
```

## Environment Variables (.env)

You need to create a `.env` file in the root of the ecommerce-backend folder. **This file should never be committed to version control.**

```env
# Sets the environment for Node.js
NODE_ENV=development

# The port your backend server will run on
PORT=5000

# Your full connection string from the MongoDB Atlas dashboard
MONGO_URI=mongodb+srv://...

# A long, random, and secret string used for signing authentication tokens
JWT_SECRET=yourrandomjwtsecretkey

# Your public client ID from the PayPal Developer dashboard
PAYPAL_CLIENT_ID=YOUR_PAYPAL_CLIENT_ID

# Your API keys from the Razorpay Test Mode dashboard
RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_KEY_SECRET
```

## Getting Started

### Prerequisites

- **Node.js**: Must have Node.js and npm installed.
- **MongoDB Atlas account**: A free account is required.
- **PayPal Developer account**: Needed for sandbox API keys.
- **Razorpay Test account**: Needed for test mode API keys.

### Installation & Setup

1. **Set Up Project Files**: Create the complete folder structure for both ecommerce-backend and frontend as detailed above and populate the files with the source code.

2. **Install Backend Dependencies**: In the ecommerce-backend directory, run:
   ```bash
   npm install
   ```

3. **Install Frontend Dependencies**: In the frontend directory, run:
   ```bash
   npm install
   ```

4. **Configure Environment Variables**: Create a .env file in the ecommerce-backend folder and populate it with your secret keys and connection string.

5. **Seed the Database**: To populate the database with sample products, run the following from the ecommerce-backend terminal:
   ```bash
   npm run seed
   ```
   
   To destroy all data, run:
   ```bash
   npm run seed:destroy
   ```

## Running the Application

You must run both the backend and frontend servers simultaneously in separate terminals.

1. **Run Backend Server** (from ecommerce-backend directory):
   ```bash
   npm start
   ```
   The API will be accessible at http://localhost:5000.

2. **Run Frontend Server** (from frontend directory):
   ```bash
   npm start
   ```
   The application will open in your browser at http://localhost:3000. The frontend is pre-configured to proxy API requests to the backend.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help with setup, please open an issue in the GitHub repository.

**🥰by: WDG🥰**
