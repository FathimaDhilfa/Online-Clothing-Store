import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../admin/AdminProducts.css";

const ORDERS_API = "http://localhost:5000/api/admin/orders";

const AdminOrders = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(ORDERS_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminInfo");
        navigate("/admin/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to load orders.");
      }

      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchOrders();
  }, [token, navigate]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setError("");
      setMessage("");

      const response = await fetch(`${ORDERS_API}/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status.");
      }

      setMessage(`Order status updated to "${newStatus}".`);
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order,
        ),
      );

      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    navigate("/admin/login");
  };

  const filteredOrders =
    statusFilter === "All"
      ? orders
      : orders.filter((order) => (order.status || "Pending") === statusFilter);

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <h2>ZÉLORA</h2>
        <p className="admin-sidebar-label">ADMIN PANEL</p>

        <nav>
          <button onClick={() => navigate("/admin/dashboard")}>
            Dashboard
          </button>
          <button onClick={() => navigate("/admin/products")}>Products</button>
          <button className="active">Orders</button>
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
            <h1>Orders</h1>
            <p>Track and fulfill ZÉLORA customer orders.</p>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "10px 14px",
              border: "1px solid #b89b6a",
              background: "#ffffff",
              fontSize: "14px",
            }}
          >
            <option value="All">All Statuses ({orders.length})</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </header>

        {message && <p className="admin-product-success">{message}</p>}
        {error && <p className="admin-product-error">{error}</p>}

        {/* Order Details Drawer/Card */}
        {selectedOrder && (
          <section
            className="admin-product-form-section"
            style={{ marginBottom: "24px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h2>Order Details — {selectedOrder.orderId}</h2>
              <button
                className="admin-edit-product-btn"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "20px",
              }}
            >
              <div>
                <h4 style={{ marginBottom: "8px" }}>Shipping Address</h4>
                <p>
                  <strong>{selectedOrder.deliveryAddress?.name}</strong>
                </p>
                <p>{selectedOrder.deliveryAddress?.address}</p>
                <p>
                  {selectedOrder.deliveryAddress?.city} -{" "}
                  {selectedOrder.deliveryAddress?.pincode}
                </p>
                <p>Phone: {selectedOrder.deliveryAddress?.phone}</p>
                <p>Email: {selectedOrder.deliveryAddress?.email}</p>
              </div>

              <div>
                <h4 style={{ marginBottom: "8px" }}>Order & Payment</h4>
                <p>
                  Payment Method: <strong>{selectedOrder.paymentMethod}</strong>
                </p>
                <p>
                  Total Amount: <strong>₹{selectedOrder.totalAmount}</strong>
                </p>
                <p>
                  Placed On:{" "}
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
                <p>
                  Current Status:{" "}
                  <strong>{selectedOrder.status || "Pending"}</strong>
                </p>
              </div>

              <div>
                <h4 style={{ marginBottom: "8px" }}>Purchased Items</h4>
                {selectedOrder.items?.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "8px 0",
                      borderBottom: "1px solid #eee8de",
                    }}
                  >
                    <strong>{item.name}</strong>
                    <div>
                      Size: {item.selectedSize || "Standard"} | Color:{" "}
                      {item.selectedColor || "Default"}
                    </div>
                    <div>
                      Qty: {item.quantity} × ₹{item.price}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="admin-products-list">
          <div className="admin-products-list-header">
            <h2>
              {statusFilter === "All" ? "All Orders" : `${statusFilter} Orders`}
            </h2>
            <span>{filteredOrders.length} Orders</span>
          </div>

          {loading ? (
            <p className="admin-product-message">Loading orders...</p>
          ) : filteredOrders.length === 0 ? (
            <div className="admin-products-empty">
              <h3>No orders found</h3>
              <p>No customer orders match the selected filter.</p>
            </div>
          ) : (
            <div className="admin-products-table-wrapper">
              <table className="admin-products-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <strong>{order.orderId}</strong>
                      </td>
                      <td>
                        <div>
                          {order.deliveryAddress?.name || order.customer?.name}
                        </div>
                        <small>
                          {order.deliveryAddress?.city} •{" "}
                          {order.deliveryAddress?.phone}
                        </small>
                      </td>
                      <td>
                        {order.items?.map((item, idx) => (
                          <div key={idx}>
                            {item.name} ({item.selectedSize || "Std"}) ×{" "}
                            {item.quantity}
                          </div>
                        ))}
                      </td>
                      <td>₹{order.totalAmount}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        <select
                          value={order.status || "Pending"}
                          onChange={(e) =>
                            handleStatusChange(order._id, e.target.value)
                          }
                          style={{
                            padding: "6px 10px",
                            border: "1px solid #b89b6a",
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="admin-edit-product-btn"
                          onClick={() => {
                            setSelectedOrder(order);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminOrders;
