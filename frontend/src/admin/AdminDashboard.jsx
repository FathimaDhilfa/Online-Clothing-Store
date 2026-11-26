import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminProducts.css";
import "./AdminDashboard.css";

const STATS_API = "http://localhost:5000/api/admin/dashboard-stats";
const ORDERS_API = "http://localhost:5000/api/admin/orders";
const PRODUCTS_API = "http://localhost:5000/api/products";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");
  const adminInfo = JSON.parse(localStorage.getItem("adminInfo") || "{}");

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalSales: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const headers = { Authorization: `Bearer ${token}` };

        const [statsRes, ordersRes, productsRes] = await Promise.all([
          fetch(STATS_API, { headers }),
          fetch(ORDERS_API, { headers }),
          fetch(PRODUCTS_API),
        ]);

        if (
          statsRes.status === 401 ||
          statsRes.status === 403 ||
          ordersRes.status === 401 ||
          ordersRes.status === 403
        ) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminInfo");
          navigate("/admin/login");
          return;
        }

        const [statsData, ordersData, productsData] = await Promise.all([
          statsRes.json(),
          ordersRes.json(),
          productsRes.json(),
        ]);

        if (!statsRes.ok) {
          throw new Error(
            statsData.message || "Unable to load dashboard stats.",
          );
        }

        setStats(statsData.stats || {});

        const allOrders = ordersData.orders || [];
        setRecentOrders(allOrders.slice(0, 5));
        setPendingOrdersCount(
          allOrders.filter((o) => (o.status || "Pending") === "Pending").length,
        );

        const allProducts = productsData.products || [];
        setLowStockProducts(allProducts.filter((p) => Number(p.stock) <= 3));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    navigate("/admin/login");
  };

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <h2>ZÉLORA</h2>
        <p className="admin-sidebar-label">ADMIN PANEL</p>

        <nav>
          <button className="active">Dashboard</button>
          <button onClick={() => navigate("/admin/products")}>Products</button>
          <button onClick={() => navigate("/admin/orders")}>Orders</button>
          <button onClick={() => navigate("/admin/customers")}>
            Customers
          </button>
        </nav>

        <button className="admin-logout" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-products-header">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome to your ZÉLORA store management panel.</p>
          </div>

          <div
            style={{
              padding: "10px 18px",
              background: "#ffffff",
              border: "1px solid #e5dfd5",
              fontSize: "14px",
            }}
          >
            {adminInfo.name || "zelora_admin"}
          </div>
        </header>

        {error && <p className="admin-product-error">{error}</p>}

        {loading ? (
          <p className="admin-product-message">Loading store overview...</p>
        ) : (
          <>
            {/* KPI Summary Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
                marginBottom: "28px",
              }}
            >
              <div
                onClick={() => navigate("/admin/products")}
                style={{
                  background: "#ffffff",
                  padding: "24px",
                  border: "1px solid #ece7df",
                  cursor: "pointer",
                }}
              >
                <p
                  style={{
                    color: "#6e685f",
                    fontSize: "14px",
                    marginBottom: "12px",
                  }}
                >
                  Total Products
                </p>
                <h2 style={{ fontSize: "30px", margin: 0 }}>
                  {stats.totalProducts}
                </h2>
              </div>

              <div
                onClick={() => navigate("/admin/orders")}
                style={{
                  background: "#ffffff",
                  padding: "24px",
                  border: "1px solid #ece7df",
                  cursor: "pointer",
                }}
              >
                <p
                  style={{
                    color: "#6e685f",
                    fontSize: "14px",
                    marginBottom: "12px",
                  }}
                >
                  Total Orders ({pendingOrdersCount} Pending)
                </p>
                <h2 style={{ fontSize: "30px", margin: 0 }}>
                  {stats.totalOrders}
                </h2>
              </div>

              <div
                onClick={() => navigate("/admin/customers")}
                style={{
                  background: "#ffffff",
                  padding: "24px",
                  border: "1px solid #ece7df",
                  cursor: "pointer",
                }}
              >
                <p
                  style={{
                    color: "#6e685f",
                    fontSize: "14px",
                    marginBottom: "12px",
                  }}
                >
                  Total Customers
                </p>
                <h2 style={{ fontSize: "30px", margin: 0 }}>
                  {stats.totalCustomers}
                </h2>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  padding: "24px",
                  border: "1px solid #ece7df",
                }}
              >
                <p
                  style={{
                    color: "#6e685f",
                    fontSize: "14px",
                    marginBottom: "12px",
                  }}
                >
                  Total Sales (Delivered)
                </p>
                <h2 style={{ fontSize: "30px", margin: 0 }}>
                  ₹{stats.totalSales}
                </h2>
              </div>
            </div>

            {/* Low-Stock Inventory Alerts */}
            <section
              className="admin-products-list"
              style={{ marginBottom: "28px" }}
            >
              <div className="admin-products-list-header">
                <h2>Low-Stock Alerts</h2>
                <span>{lowStockProducts.length} Items</span>
              </div>

              {lowStockProducts.length === 0 ? (
                <p style={{ color: "#4c7c59", padding: "12px 0" }}>
                  All products are well-stocked (more than 3 units available).
                </p>
              ) : (
                <div className="admin-products-table-wrapper">
                  <table className="admin-products-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Remaining Stock</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockProducts.map((product) => (
                        <tr key={product._id}>
                          <td>
                            <strong>{product.name}</strong>
                          </td>
                          <td>{product.category}</td>
                          <td style={{ color: "#b42318", fontWeight: "600" }}>
                            {product.stock === 0
                              ? "Out of Stock"
                              : `${product.stock} left`}
                          </td>
                          <td>
                            <button
                              className="admin-edit-product-btn"
                              onClick={() => navigate("/admin/products")}
                            >
                              Restock
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Recent Orders Preview */}
            <section className="admin-products-list">
              <div className="admin-products-list-header">
                <h2>Recent Orders</h2>
                <button
                  className="admin-edit-product-btn"
                  onClick={() => navigate("/admin/orders")}
                >
                  View All Orders
                </button>
              </div>

              {recentOrders.length === 0 ? (
                <div className="admin-products-empty">
                  <h3>No orders yet</h3>
                  <p>Recent customer orders will appear here.</p>
                </div>
              ) : (
                <div className="admin-products-table-wrapper">
                  <table className="admin-products-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td>
                            <strong>{order.orderId}</strong>
                          </td>
                          <td>
                            {order.deliveryAddress?.name ||
                              order.customer?.name}
                          </td>
                          <td>₹{order.totalAmount}</td>
                          <td>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td>{order.status || "Pending"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
