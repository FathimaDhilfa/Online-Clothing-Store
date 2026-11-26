import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../admin/AdminProducts.css";

const CUSTOMERS_API = "http://localhost:5000/api/admin/customers";

const AdminCustomers = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await fetch(CUSTOMERS_API, {
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
          throw new Error(data.message || "Unable to load customers.");
        }

        setCustomers(data.customers || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
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
          <button onClick={() => navigate("/admin/dashboard")}>
            Dashboard
          </button>
          <button onClick={() => navigate("/admin/products")}>Products</button>
          <button onClick={() => navigate("/admin/orders")}>Orders</button>
          <button className="active">Customers</button>
        </nav>

        <button className="admin-logout" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-products-header">
          <div>
            <h1>Customers</h1>
            <p>Registered members of your ZÉLORA store.</p>
          </div>
        </header>

        {error && <p className="admin-product-error">{error}</p>}

        <section className="admin-products-list">
          <div className="admin-products-list-header">
            <h2>All Customers</h2>
            <span>{customers.length} Customers</span>
          </div>

          {loading ? (
            <p className="admin-product-message">Loading customers...</p>
          ) : customers.length === 0 ? (
            <div className="admin-products-empty">
              <h3>No registered customers yet</h3>
              <p>Customer accounts will appear here after sign-up.</p>
            </div>
          ) : (
            <div className="admin-products-table-wrapper">
              <table className="admin-products-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer._id}>
                      <td>
                        <strong>{customer.name}</strong>
                      </td>
                      <td>{customer.email}</td>
                      <td>
                        {customer.createdAt
                          ? new Date(customer.createdAt).toLocaleDateString()
                          : "—"}
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

export default AdminCustomers;
