
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminProducts.css';

const API_URL = 'http://localhost:5000/api/products';

const initialForm = {
  name: '',
  category: '',
  price: '',
  originalPrice: '',
  description: '',
  images: '',
  sizes: '',
  colors: '',
  stock: '',
  label: ''
};

const AdminProducts = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem('adminToken');

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Load products from MongoDB
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load products.');
      }

      setProducts(data.products || []);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchProducts();
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // Add product to MongoDB
  const handleAddProduct = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');
      setMessage('');

      const productData = {
        name: form.name.trim(),
        category: form.category.trim(),
        price: Number(form.price),
        originalPrice: form.originalPrice
          ? Number(form.originalPrice)
          : 0,
        description: form.description.trim(),
        images: form.images
          .split('\n')
          .map((image) => image.trim())
          .filter(Boolean),
        sizes: form.sizes
          .split(',')
          .map((size) => size.trim())
          .filter(Boolean),
        colors: form.colors
          .split(',')
          .map((color) => color.trim())
          .filter(Boolean),
        stock: Number(form.stock),
        label: form.label.trim()
      };

      if (
        !productData.name ||
        !productData.category ||
        !productData.description ||
        !Number.isFinite(productData.price) ||
        productData.price < 0 ||
        !Number.isFinite(productData.originalPrice) ||
        productData.originalPrice < 0 ||
        !Number.isInteger(productData.stock) ||
        productData.stock < 0
      ) {
        throw new Error('Please enter valid product information.');
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        navigate('/admin/login');
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Unable to add product.');
      }

      setMessage('Product added successfully!');
      setForm(initialForm);
      setShowForm(false);

      await fetchProducts();

    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this product?'
    );

    if (!confirmed) return;

    try {
      setError('');
      setMessage('');

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        navigate('/admin/login');
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'Unable to delete product.');
      }

      setMessage('Product deleted successfully!');
      await fetchProducts();

    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    navigate('/admin/login');
  };

  return (
    <div className="admin-dashboard">

      <aside className="admin-sidebar">
        <h2>ZÉLORA</h2>
        <p className="admin-sidebar-label">ADMIN PANEL</p>

        <nav>
          <button onClick={() => navigate('/admin/dashboard')}>
            Dashboard
          </button>

          <button className="active">
            Products
          </button>

          <button onClick={() => navigate('/admin/orders')}>
            Orders
          </button>

          <button onClick={() => navigate('/admin/customers')}>
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
            <h1>Products</h1>
            <p>Manage your ZÉLORA product collection.</p>
          </div>

          <button
            className="admin-add-product-btn"
            onClick={() => {
              setError('');
              setMessage('');
              setShowForm(!showForm);
            }}
          >
            {showForm ? 'CANCEL' : '+ ADD PRODUCT'}
          </button>
        </header>

        {message && (
          <p className="admin-product-success">{message}</p>
        )}

        {error && (
          <p className="admin-product-error">{error}</p>
        )}

        {showForm && (
          <section className="admin-product-form-section">

            <h2>Add New Product</h2>

            <form onSubmit={handleAddProduct}>

              <div className="admin-product-form-grid">

                <div className="admin-product-field">
                  <label>Product Name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Example: Floral Summer Dress"
                    required
                  />
                </div>

                <div className="admin-product-field">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Tops & T-shirts">Tops & T-shirts</option>
                    <option value="Dresses">Dresses</option>
                    <option value="Jeans & Denim">Jeans & Denim</option>
                    <option value="Co-ord Sets">Co-ord Sets</option>
                    <option value="Blazers">Blazers</option>
                  </select>
                </div>

                <div className="admin-product-field">
                  <label>Selling Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="1999"
                    required
                  />
                </div>

                <div className="admin-product-field">
                  <label>Original Price (₹)</label>
                  <input
                    type="number"
                    name="originalPrice"
                    min="0"
                    value={form.originalPrice}
                    onChange={handleChange}
                    placeholder="2499"
                  />
                </div>

                <div className="admin-product-field">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    name="stock"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="10"
                    required
                  />
                </div>

                <div className="admin-product-field">
                  <label>Product Label</label>
                  <input
                    name="label"
                    value={form.label}
                    onChange={handleChange}
                    placeholder="NEW / SALE / BESTSELLER"
                  />
                </div>

                <div className="admin-product-field full-width">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Enter product description..."
                    rows="4"
                    required
                  />
                </div>

                <div className="admin-product-field full-width">
                  <label>Image URLs</label>
                  <textarea
                    name="images"
                    value={form.images}
                    onChange={handleChange}
                    placeholder={'Paste image URLs, one URL per line'}
                    rows="3"
                  />
                  <small>For now, enter publicly accessible image URLs. File uploads will be added later.</small>
                </div>

                <div className="admin-product-field">
                  <label>Available Sizes</label>
                  <input
                    name="sizes"
                    value={form.sizes}
                    onChange={handleChange}
                    placeholder="S, M, L, XL"
                  />
                </div>

                <div className="admin-product-field">
                  <label>Available Colours</label>
                  <input
                    name="colors"
                    value={form.colors}
                    onChange={handleChange}
                    placeholder="Black, White, Beige"
                  />
                </div>

              </div>

              <button
                type="submit"
                className="admin-save-product-btn"
                disabled={saving}
              >
                {saving ? 'SAVING...' : 'SAVE PRODUCT'}
              </button>

            </form>

          </section>
        )}

        <section className="admin-products-list">

          <div className="admin-products-list-header">
            <h2>All Products</h2>
            <span>{products.length} Products</span>
          </div>

          {loading ? (
            <p className="admin-product-message">Loading products...</p>
          ) : products.length === 0 ? (
            <div className="admin-products-empty">
              <h3>No products found</h3>
              <p>Start adding products to your ZÉLORA store.</p>
            </div>
          ) : (
            <div className="admin-products-table-wrapper">
              <table className="admin-products-table">

                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Label</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>

                      <td>
                        <div className="admin-product-name-cell">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                            />
                          ) : (
                            <div className="admin-product-no-image">
                              No Image
                            </div>
                          )}

                          <span>{product.name}</span>
                        </div>
                      </td>

                      <td>{product.category}</td>

                      <td>₹{product.price}</td>

                      <td>{product.stock}</td>

                      <td>{product.label || '—'}</td>

                      <td>
                        <button
                          className="admin-delete-product-btn"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          Delete
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

export default AdminProducts;
