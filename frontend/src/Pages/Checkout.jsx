
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, clearCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const formatPrice = (price) =>
    `₹${Number(price).toLocaleString('en-IN')}`;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCustomer((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // PLACE ORDER
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    if (!token) {
      alert('Please sign in before placing your order.');
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setLoading(true);

    try {
      // Send order to backend
      const response = await fetch(
        'http://localhost:5000/api/orders',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            items: cartItems,
            deliveryAddress: customer,
            paymentMethod: 'Cash on Delivery'
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Unable to place your order.'
        );
      }

      // Prepare order details for success page
      const savedOrder = {
        orderId: data.order.orderId,
        customer,
        items: data.order.items,
        subtotal: data.order.totalAmount,
        paymentMethod: data.order.paymentMethod,
        orderDate: data.order.createdAt
      };

      // Save temporary confirmation details
      sessionStorage.setItem(
        'latestOrder',
        JSON.stringify(savedOrder)
      );

      // Clear cart only after successful database save
      clearCart();

      // Open success page
      navigate('/order-success');

    } catch (error) {
      console.error('Order placement error:', error);
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Your Shopping Bag is Empty</h2>
        <p>Add something beautiful to continue.</p>

        <Link to="/" className="checkout-continue-button">
          CONTINUE SHOPPING
        </Link>
      </div>
    );
  }

  return (
    <main className="checkout-page">

      <Link to="/cart" className="checkout-back-link">
        ← BACK TO CART
      </Link>

      <div className="checkout-heading">
        <h1>Checkout</h1>
        <p>COMPLETE YOUR ORDER</p>
      </div>

      <div className="checkout-container">

        {/* DELIVERY FORM */}

        <form
          className="checkout-form"
          onSubmit={handleSubmit}
        >
          <div className="checkout-section">

            <h2>Delivery Information</h2>

            <p className="checkout-section-description">
              Please enter your delivery details below.
            </p>

            <div className="checkout-input-grid">

              <div className="checkout-field">
                <label htmlFor="customer-name">Full Name</label>
                <input
                  id="customer-name"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={customer.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="customer-email">Email Address</label>
                <input
                  id="customer-email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={customer.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="customer-phone">Phone Number</label>
                <input
                  id="customer-phone"
                  type="tel"
                  name="phone"
                  placeholder="10-digit phone number"
                  value={customer.phone}
                  onChange={handleChange}
                  pattern="[0-9]{10}"
                  title="Enter a valid 10-digit phone number"
                  required
                />
              </div>

              <div className="checkout-field full-width">
                <label htmlFor="customer-address">
                  Full Delivery Address
                </label>
                <textarea
                  id="customer-address"
                  name="address"
                  placeholder="House number, street, area..."
                  value={customer.address}
                  onChange={handleChange}
                  rows="3"
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="customer-city">City</label>
                <input
                  id="customer-city"
                  type="text"
                  name="city"
                  placeholder="Enter your city"
                  value={customer.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="customer-pincode">PIN Code</label>
                <input
                  id="customer-pincode"
                  type="text"
                  name="pincode"
                  placeholder="6-digit PIN code"
                  value={customer.pincode}
                  onChange={handleChange}
                  pattern="[0-9]{6}"
                  title="Enter a valid 6-digit PIN code"
                  required
                />
              </div>

            </div>
          </div>

          {/* PAYMENT */}

          <div className="payment-section">
            <h2>Payment Method</h2>

            <div className="payment-option">
              <div className="payment-radio">
                <span></span>
              </div>

              <div>
                <h3>Cash on Delivery</h3>
                <p>Pay when your order arrives.</p>
              </div>

              <span className="cod-label">COD</span>
            </div>
          </div>

          {/* ERROR MESSAGE */}

          {error && (
            <p style={{ color: 'red', marginBottom: '15px' }}>
              {error}
            </p>
          )}

          {/* PLACE ORDER BUTTON */}

          <button
            type="submit"
            className="place-order-button"
            disabled={loading}
          >
            {loading ? 'PLACING ORDER...' : 'PLACE ORDER'}
          </button>

          <p className="secure-order-note">
            Please verify your delivery information before placing your order.
          </p>

        </form>

        {/* ORDER SUMMARY */}

        <aside className="checkout-summary">

          <h2>Order Summary</h2>

          <p className="summary-item-count">
            {cartItems.reduce(
              (total, item) => total + item.quantity,
              0
            )} ITEMS
          </p>

          <div className="checkout-summary-items">

            {cartItems.map((item) => (
              <div
                key={`${item.id}-${item.selectedSize}-${item.selectedColor || ''}`}
                className="checkout-summary-item"
              >
                <img src={item.image} alt={item.name} />

                <div className="checkout-summary-product">
                  <h3>{item.name}</h3>
                  <p>Size: {item.selectedSize}</p>

                  {item.selectedColor && (
                    <p>Colour: {item.selectedColor}</p>
                  )}

                  <p>Quantity: {item.quantity}</p>
                </div>

                <strong>
                  {formatPrice(item.price * item.quantity)}
                </strong>
              </div>
            ))}

          </div>

          <div className="checkout-summary-divider"></div>

          <div className="checkout-summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <div className="checkout-summary-row">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>

          <div className="checkout-summary-divider"></div>

          <div className="checkout-summary-total">
            <strong>Total</strong>
            <strong>{formatPrice(subtotal)}</strong>
          </div>

          <p className="checkout-summary-note">
            Payment method: Cash on Delivery
          </p>

        </aside>

      </div>
    </main>
  );
};

export default Checkout;
