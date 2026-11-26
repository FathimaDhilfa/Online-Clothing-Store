
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({

  // Customer who placed the order
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },

  // Unique order number
  orderId: {
    type: String,
    required: true,
    unique: true
  },

  // Products in the order
  items: [
    {
      productId: {
        type: String
      },

      name: {
        type: String,
        required: true
      },

      image: {
        type: String
      },

      price: {
        type: Number,
        required: true,
        min: 0
      },

      quantity: {
        type: Number,
        required: true,
        min: 1
      },

      selectedSize: {
        type: String
      },

      selectedColor: {
        type: String
      }
    }
  ],

  // Delivery information
  deliveryAddress: {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      required: true
    },

    address: {
      type: String,
      required: true
    },

    city: {
      type: String,
      required: true
    },

    pincode: {
      type: String,
      required: true
    }
  },

  // Payment information
  paymentMethod: {
    type: String,
    default: 'Cash on Delivery'
  },

  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },

  // Order status
  status: {
    type: String,
    enum: [
      'Pending',
      'Confirmed',
      'Shipped',
      'Delivered',
      'Cancelled'
    ],
    default: 'Pending'
  }

}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
