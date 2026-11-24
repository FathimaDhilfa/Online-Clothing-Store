
// ========================================
// 1. LOAD ENVIRONMENT VARIABLES
// ========================================

require('dotenv').config();


// ========================================
// 2. IMPORT PACKAGES
// ========================================

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Customer = require('./models/Customer');
const Order = require('./models/Order');


// ========================================
// 3. CREATE EXPRESS APPLICATION
// ========================================

const app = express();
const PORT = process.env.PORT || 5000;


// ========================================
// 4. MIDDLEWARE
// ========================================

app.use(cors());
app.use(express.json());
// ========================================
// JWT AUTHENTICATION MIDDLEWARE
// ========================================

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.customerId = decoded.customerId;

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired login session.'
    });
  }
};


// ========================================
// 5. HOME API
// ========================================

app.get('/', (req, res) => {
  res.send('Welcome to ZÉLORA Backend!');
});


// ========================================
// 6. ABOUT API
// ========================================

app.get('/about', (req, res) => {
  res.send('ZÉLORA is a luxury fashion store.');
});


// ========================================
// 7. PRODUCTS API
// ========================================

app.get('/products', (req, res) => {
  res.json({
    success: true,
    products: [
      'Luxury Co-ord set',
      'Elegant White Top',
      'Classic Denim Jeans'
    ]
  });
});


// ========================================
// 8. CUSTOMER SIGNUP API
// ========================================

app.post('/api/auth/signup', async (req, res) => {

  try {

    const { name, email, password } = req.body;

    // Validate required fields
    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.'
      });
    }

    // Validate name
    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must contain at least 2 characters.'
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters.'
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    // Check existing customer
    const existingCustomer = await Customer.findOne({
      email: normalizedEmail
    });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create customer
    const newCustomer = new Customer({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword
    });

    // Save customer
    await newCustomer.save();

    // Send response
    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      customer: {
        id: newCustomer._id,
        name: newCustomer.name,
        email: newCustomer.email
      }
    });

  } catch (error) {

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered.'
      });
    }

    console.error('Signup error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error during registration.'
    });

  }

});


// ========================================
// 9. CUSTOMER LOGIN API
// ========================================

app.post('/api/auth/login', async (req, res) => {

  try {

    const { email, password } = req.body;

    // Validate input
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Find customer
    const customer = await Customer.findOne({
      email: normalizedEmail
    });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(
      password,
      customer.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing from environment variables.');

      return res.status(500).json({
        success: false,
        message: 'Server configuration error.'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        customerId: customer._id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d'
      }
    );

    // Send successful response
    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email
      }
    });

  } catch (error) {

    console.error('Login error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error during login.'
    });

  }

});


// ========================================
// 10. START SERVER AND CONNECT MONGODB
// ========================================

const startServer = async () => {

  try {

    // Check required environment variables
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing from .env file.');
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing from .env file.');
    }

    // Connect MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB connected successfully!');

    // Start Express server
    app.listen(PORT, () => {
      console.log(`ZÉLORA server running on port ${PORT}`);
    });

  } catch (error) {

    console.error('Server startup failed:', error.message);

    process.exit(1);

  }

};


// ========================================
// CREATE CUSTOMER ORDER API
// ========================================

app.post('/api/orders', verifyToken, async (req, res) => {
  try {
    const {
      items,
      deliveryAddress,
      paymentMethod
    } = req.body;

    // Validate order items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your order must contain at least one product.'
      });
    }

    // Validate delivery information
    const requiredAddressFields = [
      'name',
      'email',
      'phone',
      'address',
      'city',
      'pincode'
    ];

    if (
      !deliveryAddress ||
      requiredAddressFields.some(
        field =>
          typeof deliveryAddress[field] !== 'string' ||
          !deliveryAddress[field].trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide complete delivery information.'
      });
    }

    // Validate and calculate product totals on the server
    let totalAmount = 0;

    const validatedItems = [];

    for (const item of items) {
      const price = Number(item.price);
      const quantity = Number(item.quantity);

      if (
        typeof item.name !== 'string' ||
        !item.name.trim() ||
        !Number.isFinite(price) ||
        price < 0 ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product information in your order.'
        });
      }

      totalAmount += price * quantity;

      validatedItems.push({
        productId: String(item.id || ''),
        name: item.name.trim(),
        image: typeof item.image === 'string' ? item.image : '',
        price,
        quantity,
        selectedSize: item.selectedSize || '',
        selectedColor: item.selectedColor || ''
      });
    }

    // Generate order number
    const orderId = `ZELORA-${Date.now()}`;

    // Save order in MongoDB
    const newOrder = await Order.create({
      customer: req.customerId,
      orderId,
      items: validatedItems,
      deliveryAddress: {
        name: deliveryAddress.name.trim(),
        email: deliveryAddress.email.trim().toLowerCase(),
        phone: deliveryAddress.phone.trim(),
        address: deliveryAddress.address.trim(),
        city: deliveryAddress.city.trim(),
        pincode: deliveryAddress.pincode.trim()
      },
      paymentMethod: paymentMethod || 'Cash on Delivery',
      totalAmount
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: newOrder
    });

  } catch (error) {
    console.error('Create order error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to place your order.'
    });
  }
});


// ========================================
// GET LOGGED-IN CUSTOMER ORDERS API
// ========================================

app.get('/api/orders/my-orders', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({
      customer: req.customerId
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders
    });

  } catch (error) {
    console.error('Fetch orders error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve your orders.'
    });
  }
});

// Run server
startServer();
