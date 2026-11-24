
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const adminToken = localStorage.getItem('adminToken');

  const adminInfo = JSON.parse(
    localStorage.getItem('adminInfo') || 'null'
  );

  // Dashboard statistics
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalSales: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch dashboard statistics
  useEffect(() => {
    if (!adminToken) {
      navigate('/admin/login');
      return;
    }

    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          'http://localhost:5000/api/admin/dashboard-stats',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${adminToken}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminInfo');
            navigate('/admin/login');
            return;
          }

          throw new Error(
            data.message || 'Unable to load dashboard statistics.'
          );
        }

        setStats(data.stats);

      } catch (err) {
        setError(err.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();

  }, [adminToken, navigate]);

  // Admin logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    navigate('/admin/login');
  };

  if (!adminToken) return null;

  // Format sales in Indian Rupees
  const formatSales = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="admin-dashboard">

      {/* SIDEBAR */}
      <aside className="admin-sidebar">

        <h2>ZÉLORA</h2>

        <p className="admin-sidebar-label">
          ADMIN PANEL
        </p>

        <nav>
          <button className="active">
            Dashboard
          </button>

          <button onClick={() => navigate('/admin/products')}>
            Products
          </button>

          <button onClick={() => navigate('/admin/orders')}>
            Orders
          </button>

          <button onClick={() => navigate('/admin/customers')}>
            Customers
          </button>
        </nav>

        <button
          className="admin-logout"
          onClick={handleLogout}
        >
          Logout
        </button>

      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">

        <header className="admin-topbar">

          <div>
            <h1>Dashboard</h1>

            <p>
              Welcome to your ZÉLORA store management panel.
            </p>
          </div>

          <div className="admin-profile">
            <span>
              {adminInfo?.name || 'Administrator'}
            </span>
          </div>

        </header>

        {/* ERROR MESSAGE */}
        {error && (
          <p className="admin-login-error">
            {error}
          </p>
        )}

        {/* STATISTICS CARDS */}
        <section className="admin-stats">

          <div className="admin-stat-card">
            <p>Total Products</p>
            <h2>
              {loading ? '...' : stats.totalProducts}
            </h2>
          </div>

          <div className="admin-stat-card">
            <p>Total Orders</p>
            <h2>
              {loading ? '...' : stats.totalOrders}
            </h2>
          </div>

          <div className="admin-stat-card">
            <p>Total Customers</p>
            <h2>
              {loading ? '...' : stats.totalCustomers}
            </h2>
          </div>

          <div className="admin-stat-card">
            <p>Total Sales</p>
            <h2>
              {loading ? '...' : formatSales(stats.totalSales)}
            </h2>
          </div>

        </section>

        {/* WELCOME SECTION */}
        <section className="admin-welcome">

          <h2>
            Welcome to ZÉLORA Administration
          </h2>

          <p>
            Manage your products, orders, inventory and customers
            from one place.
          </p>

        </section>

      </main>

    </div>
  );
};

export default AdminDashboard;
