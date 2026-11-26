import React, { useState } from "react";
import { useProducts } from "../context/ProductContext";

const emptyForm = {
  name: "",
  category: "Women",
  price: "",
  originalPrice: "",
  stock: 10,
  label: "NEW ARRIVAL",
  description: "",
  sizes: "XS, S, M, L",
  colors: "Black, Ivory",
  image: "",
};

const AdminProducts = () => {
  const { products, loading, refreshProducts } = useProducts();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const token =
    localStorage.getItem("adminToken") || localStorage.getItem("zeloraToken");

  const openAddModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingId(product._id || product.id);
    setFormData({
      name: product.name || "",
      category: product.category || "Women",
      price: product.price || "",
      originalPrice: product.originalPrice || "",
      stock: product.stock ?? 10,
      label: product.label || "",
      description: product.description || "",
      sizes: Array.isArray(product.sizes)
        ? product.sizes.join(", ")
        : "XS, S, M, L",
      colors: Array.isArray(product.colors) ? product.colors.join(", ") : "",
      image:
        product.image ||
        (Array.isArray(product.images) ? product.images[0] : "") ||
        "",
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const parsedSizes = formData.sizes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedColors = formData.colors
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    const cleanImageUrl = formData.image.trim();

    const payload = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      price: Number(formData.price),
      originalPrice: formData.originalPrice
        ? Number(formData.originalPrice)
        : 0,
      stock: parseInt(formData.stock, 10) || 0,
      label: formData.label.trim(),
      description: formData.description.trim(),
      sizes: parsedSizes,
      colors: parsedColors,
      images: cleanImageUrl ? [cleanImageUrl] : [],
      isActive: true,
    };

    try {
      const url = editingId
        ? `http://localhost:5000/api/products/${editingId}`
        : "http://localhost:5000/api/products";

      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Failed to save product");
      }

      await refreshProducts();
      setShowModal(false);
      setFormData(emptyForm);
      setEditingId(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Delete this product from Zélora?")) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/products/${productId}`,
        {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      if (!res.ok) throw new Error("Failed to delete product");
      await refreshProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="admin-products-page">
      <div
        className="admin-page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Products ({products.length})</h1>
          <p style={{ color: "#666", margin: "4px 0 0" }}>
            Manage Zélora catalog, pricing, and live inventory
          </p>
        </div>
        <button
          type="button"
          className="admin-primary-btn"
          onClick={openAddModal}
        >
          + ADD PRODUCT
        </button>
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <table
          className="admin-table"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Label</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((item) => (
              <tr key={item.id}>
                <td
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <img
                    src={
                      item.image ||
                      "https://via.placeholder.com/48x60?text=No+Img"
                    }
                    alt={item.name}
                    style={{
                      width: "44px",
                      height: "54px",
                      objectFit: "cover",
                      background: "#f5f3ef",
                    }}
                  />
                  <strong>{item.name}</strong>
                </td>
                <td>{item.category}</td>
                <td>₹{Number(item.price).toLocaleString("en-IN")}</td>
                <td>{item.stock}</td>
                <td>{item.label || "—"}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    style={{ marginRight: "8px", cursor: "pointer" }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item._id || item.id)}
                    style={{ color: "#b42318", cursor: "pointer" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>

            <form onSubmit={handleSubmit}>
              <div className="admin-form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="Women">Women</option>
                  <option value="Men">Men</option>
                  <option value="Outerwear">Outerwear</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "12px",
                }}
              >
                <div className="admin-form-group">
                  <label>Selling Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Original Price (₹)</label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleChange}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>Product Image URL *</label>
                <input
                  type="url"
                  name="image"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={handleChange}
                  required
                />
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                    onLoad={(e) => {
                      e.target.style.display = "block";
                    }}
                    style={{
                      marginTop: "8px",
                      width: "72px",
                      height: "90px",
                      objectFit: "cover",
                      border: "1px solid #ddd",
                    }}
                  />
                )}
              </div>

              <div className="admin-form-group">
                <label>Product Label</label>
                <input
                  type="text"
                  name="label"
                  placeholder="NEW ARRIVAL / BESTSELLER / LIMITED"
                  value={formData.label}
                  onChange={handleChange}
                />
              </div>

              <div className="admin-form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div className="admin-form-group">
                  <label>Available Sizes (comma separated)</label>
                  <input
                    type="text"
                    name="sizes"
                    value={formData.sizes}
                    onChange={handleChange}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Available Colours (comma separated)</label>
                  <input
                    type="text"
                    name="colors"
                    value={formData.colors}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "18px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-primary-btn"
                  disabled={saving}
                >
                  {saving ? "SAVING..." : "SAVE PRODUCT"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
