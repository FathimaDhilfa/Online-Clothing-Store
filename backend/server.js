const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
// ========================================
// 1. LOAD ENVIRONMENT VARIABLES
// ========================================

require("dotenv").config();

// ========================================
// 2. IMPORT PACKAGES
// ========================================

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Customer = require("./models/Customer");
const Order = require("./models/Order");

const Product = require("./models/Product");
const Admin = require("./models/Admin");
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

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.customerId = decoded.customerId;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired login session.",
    });
  }
};

// ========================================
// ADMIN AUTHENTICATION MIDDLEWARE
// ========================================

const verifyAdminToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin" || !decoded.adminId) {
      return res.status(403).json({
        success: false,
        message: "Admin access denied.",
      });
    }

    const admin = await Admin.findById(decoded.adminId);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin account not found.",
      });
    }

    req.adminId = admin._id;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired admin session.",
    });
  }
};

// ========================================
// 5. HOME API
// ========================================

app.get("/", (req, res) => {
  res.send("Welcome to ZÉLORA Backend!");
});

// ========================================
// 6. ABOUT API
// ========================================

app.get("/about", (req, res) => {
  res.send("ZÉLORA is a luxury fashion store.");
});

/* ========================================
   PRODUCT MANAGEMENT APIs
======================================== */

// GET ALL ACTIVE PRODUCTS
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Fetch products error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve products.",
    });
  }
});

// GET SINGLE PRODUCT
app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Fetch product error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve product.",
    });
  }
});

// ADD NEW PRODUCT
app.post("/api/products", verifyAdminToken, async (req, res) => {
  try {
    const {
      name,
      category,
      price,
      originalPrice,
      description,
      images,
      sizes,
      colors,
      stock,
      label,
    } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof category !== "string" ||
      !category.trim() ||
      typeof description !== "string" ||
      !description.trim() ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Array.isArray(images) ||
      !Array.isArray(sizes) ||
      !Array.isArray(colors) ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid product information.",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      category: category.trim(),
      price,
      originalPrice,
      description: description.trim(),
      images,
      sizes,
      colors,
      stock,
      label,
    });

    return res.status(201).json({
      success: true,
      message: "Product added successfully!",
      product,
    });
  } catch (error) {
    console.error("Add product error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add product.",
    });
  }
});

// UPDATE PRODUCT
app.put("/api/products/:id", verifyAdminToken, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully!",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update product.",
    });
  }
});

// DELETE PRODUCT
app.delete("/api/products/:id", verifyAdminToken, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully!",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete product.",
    });
  }
});

// ========================================
// 8. CUSTOMER SIGNUP API
// ========================================

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Validate name
    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must contain at least 2 characters.",
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // Check existing customer
    const existingCustomer = await Customer.findOne({
      email: normalizedEmail,
    });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create customer
    const newCustomer = new Customer({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    // Save customer
    await newCustomer.save();

    // Send response
    return res.status(201).json({
      success: true,
      message: "Account created successfully!",
      customer: {
        id: newCustomer._id,
        name: newCustomer.name,
        email: newCustomer.email,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }

    console.error("Signup error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during registration.",
    });
  }
});

// ========================================
// 9. CUSTOMER LOGIN API
// ========================================

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Find customer
    const customer = await Customer.findOne({
      email: normalizedEmail,
    });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, customer.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from environment variables.");

      return res.status(500).json({
        success: false,
        message: "Server configuration error.",
      });
    }
    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is missing.",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        customerId: customer._id,
        role: "customer",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // Send successful response
    return res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
});

// ========================================
// ADMIN LOGIN API
// ========================================

app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const admin = await Admin.findOne({
      email: normalizedEmail,
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password.",
      });
    }

    const token = jwt.sign(
      {
        adminId: admin._id,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    return res.status(200).json({
      success: true,
      message: "Admin login successful!",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during admin login.",
    });
  }
});

// ========================================
// ADMIN DASHBOARD STATISTICS API
// ========================================

app.get("/api/admin/dashboard-stats", verifyAdminToken, async (req, res) => {
  try {
    const [totalProducts, totalOrders, totalCustomers, salesResult] =
      await Promise.all([
        Product.countDocuments({ isActive: true }),

        Order.countDocuments(),

        Customer.countDocuments(),

        Order.aggregate([
          {
            $match: {
              status: "Delivered",
            },
          },
          {
            $group: {
              _id: null,
              totalSales: { $sum: "$totalAmount" },
            },
          },
        ]),
      ]);

    const totalSales = salesResult.length > 0 ? salesResult[0].totalSales : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalOrders,
        totalCustomers,
        totalSales,
      },
    });
  } catch (error) {
    console.error("Dashboard statistics error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve dashboard statistics.",
    });
  }
});

// ========================================
// ADMIN ORDERS APIs (VIEW ALL & UPDATE STATUS)
// ========================================

app.get("/api/admin/orders", verifyAdminToken, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Admin fetch orders error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve orders.",
    });
  }
});

app.put("/api/admin/orders/:id/status", verifyAdminToken, async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated!",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update order status.",
    });
  }
});

// ========================================
// ADMIN CUSTOMERS API (VIEW ALL REGISTERED CUSTOMERS)
// ========================================

app.get("/api/admin/customers", verifyAdminToken, async (req, res) => {
  try {
    const customers = await Customer.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error("Admin fetch customers error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve customers.",
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
      throw new Error("MONGODB_URI is missing from .env file.");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from .env file.");
    }

    // Connect MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully!");

    // Start Express server
    app.listen(PORT, () => {
      console.log(`ZÉLORA server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);

    process.exit(1);
  }
};

// ========================================
// CREATE CUSTOMER ORDER API
// ========================================

app.post("/api/orders", verifyToken, async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod } = req.body;

    // Validate order items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your order must contain at least one product.",
      });
    }

    // Validate delivery information
    const requiredAddressFields = [
      "name",
      "email",
      "phone",
      "address",
      "city",
      "pincode",
    ];

    if (
      !deliveryAddress ||
      requiredAddressFields.some(
        (field) =>
          typeof deliveryAddress[field] !== "string" ||
          !deliveryAddress[field].trim(),
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide complete delivery information.",
      });
    }

    // Validate and calculate product totals on the server
    let totalAmount = 0;

    const validatedItems = [];

    for (const item of items) {
      const price = Number(item.price);
      const quantity = Number(item.quantity);

      if (
        typeof item.name !== "string" ||
        !item.name.trim() ||
        !Number.isFinite(price) ||
        price < 0 ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product information in your order.",
        });
      }

      totalAmount += price * quantity;

      validatedItems.push({
        productId: String(item.id || ""),
        name: item.name.trim(),
        image: typeof item.image === "string" ? item.image : "",
        price,
        quantity,
        selectedSize: item.selectedSize || "",
        selectedColor: item.selectedColor || "",
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
        pincode: deliveryAddress.pincode.trim(),
      },
      paymentMethod: paymentMethod || "Cash on Delivery",
      totalAmount,
    });

    // Deduct ordered quantities from product stock
    for (const item of validatedItems) {
      if (mongoose.Types.ObjectId.isValid(item.productId)) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: newOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to place your order.",
    });
  }
});

// ========================================
// GET LOGGED-IN CUSTOMER ORDERS API
// ========================================

app.get("/api/orders/my-orders", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({
      customer: req.customerId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Fetch orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your orders.",
    });
  }
});

// Run server
startServer();
