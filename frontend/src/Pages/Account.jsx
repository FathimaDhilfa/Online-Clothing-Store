import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Account.css';


const Account = () => {
 const { customer, isAuthenticated, logout, token } = useAuth();

  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('overview');
  
  // Order information
const [orders, setOrders] = useState([]);
const [ordersLoading, setOrdersLoading] = useState(false);
const [ordersError, setOrdersError] = useState('');

// Fetch logged-in customer's orders
useEffect(() => {
  if (activeSection !== 'orders' || !token) {
    return;
  }

  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersError('');

    try {
      const response = await fetch(
        'http://localhost:5000/api/orders/my-orders',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Unable to load your orders.'
        );
      }

      setOrders(data.orders || []);

    } catch (error) {
      setOrdersError(error.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  fetchOrders();

}, [activeSection, token]);
  if (!isAuthenticated || !customer) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Keep your existing return JSX below


  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '⌂' },
    { id: 'profile', label: 'Personal Information', icon: '♙' },
    { id: 'orders', label: 'My Orders', icon: '▤' },
    { id: 'wishlist', label: 'My Wishlist', icon: '♡', link: '/wishlist' },
    { id: 'cart', label: 'My Cart', icon: '▱', link: '/cart' }
  ];

  return (
    <div className="account-page">

      <header className="account-header">
        <Link to="/" className="account-logo">
          ZÉLORA<span>.</span>
        </Link>

        <Link to="/" className="back-to-store">
          Continue Shopping →
        </Link>
      </header>

      <main className="account-layout">

        <aside className="account-sidebar">

          <div className="account-user">
            <div className="account-avatar">
              {customer.name?.charAt(0).toUpperCase()}
            </div>

            <h3>{customer.name}</h3>
            <p>{customer.email}</p>
          </div>

          <div className="account-menu">
            <p className="menu-heading">MY ACCOUNT</p>

            {menuItems.map((item) => (
              item.link ? (
                <Link
                  key={item.id}
                  to={item.link}
                  className="account-menu-item"
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.id}
                  className={`account-menu-item ${
                    activeSection === item.id ? 'active' : ''
                  }`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              )
            ))}
          </div>

          <button
  type="button"
  className="account-logout"
  onClick={handleLogout}
>
  LOG OUT
</button>

        </aside>

        <section className="account-content">

          {activeSection === 'overview' && (
            <>
              <p className="account-eyebrow">YOUR PERSONAL SPACE</p>

              <h1>
                Welcome back, {customer.name}!
              </h1>

              <p className="account-intro">
                We're happy to have you here.
                Explore your account and enjoy your ZÉLORA experience.
              </p>

              <div className="account-welcome-banner">
                <p>THE ZÉLORA EXPERIENCE</p>
                <h2>
                  Style is a way to say
                  <br />
                  who you are.
                </h2>
                <Link to="/" className="account-shop-button">
                  EXPLORE COLLECTION
                </Link>
              </div>

              <h2 className="account-section-title">
                Your Account
              </h2>

              <div className="account-cards">

                <button
                  onClick={() => setActiveSection('profile')}
                  className="account-info-card"
                >
                  <span>♙</span>
                  <h3>Personal Information</h3>
                  <p>View your account details</p>
                  <strong>VIEW DETAILS →</strong>
                </button>

                <Link to="/wishlist" className="account-info-card">
                  <span>♡</span>
                  <h3>My Wishlist</h3>
                  <p>Discover your saved favourites</p>
                  <strong>VIEW WISHLIST →</strong>
                </Link>

                <Link to="/cart" className="account-info-card">
                  <span>▱</span>
                  <h3>My Cart</h3>
                  <p>Continue your shopping journey</p>
                  <strong>VIEW CART →</strong>
                </Link>

              </div>
            </>
          )}

          {activeSection === 'profile' && (
            <>
              <p className="account-eyebrow">ACCOUNT SETTINGS</p>
              <h1>Personal Information</h1>

              <p className="account-intro">
                Your personal account details.
              </p>

              <div className="profile-details">
                <div>
                  <label>FULL NAME</label>
                  <p>{customer.name}</p>
                </div>

                <div>
                  <label>EMAIL ADDRESS</label>
                  <p>{customer.email}</p>
                </div>
              </div>

              <p className="profile-note">
                Your profile is currently displaying the information
                provided during registration. Profile editing will be
                added in the next development step.
              </p>
            </>
          )}

          
{activeSection === 'orders' && (
  <>
    <p className="account-eyebrow">YOUR PURCHASES</p>
    <h1>My Orders</h1>

    {ordersLoading && (
      <p className="account-intro">Loading your orders...</p>
    )}

    {ordersError && (
      <p style={{ color: 'red' }}>{ordersError}</p>
    )}

    {!ordersLoading && !ordersError && orders.length === 0 && (
      <p className="account-intro">
        You haven't placed any orders yet.
        Your purchases will appear here.
      </p>
    )}

    {!ordersLoading && orders.map((order) => (
      <div className="customer-order-card" key={order._id}>

        <div className="customer-order-header">
          <div>
            <p>ORDER NUMBER</p>
            <strong>{order.orderId}</strong>
          </div>

          <span className="customer-order-status">
            {order.status}
          </span>
        </div>

        <p className="customer-order-date">
          Order Date: {new Date(order.createdAt).toLocaleDateString('en-IN')}
        </p>

        <div className="customer-order-products">
          {order.items.map((item, index) => (
            <div className="customer-order-product" key={index}>
              {item.image && (
                <img src={item.image} alt={item.name} />
              )}

              <div>
                <h3>{item.name}</h3>
                <p>Quantity: {item.quantity}</p>

                {item.selectedSize && (
                  <p>Size: {item.selectedSize}</p>
                )}
              </div>

              <strong>
                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
              </strong>
            </div>
          ))}
        </div>

        <div className="customer-order-total">
          <span>Payment: {order.paymentMethod}</span>

          <strong>
            Total: ₹{Number(order.totalAmount).toLocaleString('en-IN')}
          </strong>
        </div>

      </div>
    ))}
  </>
)}



        </section>
      </main>

      <footer className="account-footer">
        © 2026 ZÉLORA. ALL RIGHTS RESERVED.
      </footer>

    </div>
  );
};

export default Account;
