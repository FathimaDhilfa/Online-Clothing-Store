import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductContext";


const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Search states
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Cart and Wishlist information
  const { cartItems, wishlist } = useCart();

  // Customer authentication information
  // Profile dropdown state & outside-click ref
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef(null);

  // Customer authentication information
  const { customer, isAuthenticated, logout } = useAuth();
const { products } = useProducts();

  // Clean display name (e.g. "fathima3" -> "Fathima")
  const rawFirstName = customer?.name ? customer.name.split(" ")[0] : "";
  const cleanFirstName = rawFirstName
    ? rawFirstName.replace(/[0-9]+$/, "").replace(/^./, (c) => c.toUpperCase())
    : "";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setProfileMenuOpen(false);
    logout();
    navigate("/");
  };

  // Calculate total cart quantity
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Navigate to homepage sections
  const handleSectionClick = (sectionId) => {
    if (location.pathname !== "/") {
      navigate(`/#${sectionId}`);
      return;
    }

    const section = document.getElementById(sectionId);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // Filter products for live search suggestions
  const filteredProducts = products.filter((product) => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return false;

    const name = product.name || "";
    const category = product.category || "";
    const description = product.description || "";

    return (
      name.toLowerCase().includes(search) ||
      category.toLowerCase().includes(search) ||
      description.toLowerCase().includes(search)
    );
  });

  // Close search panel
  const closeSearch = () => {
    setSearchOpen(false);
    setSearchTerm("");
  };

  // Submit search and navigate to results page
  const handleSearch = (e) => {
    e.preventDefault();

    const search = searchTerm.trim();

    if (!search) return;

    navigate(`/search?q=${encodeURIComponent(search)}`);

    closeSearch();
  };

  // Open product details from suggestions
  const handleProductClick = () => {
    closeSearch();
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  };

  return (
    <header className="zelora-header">
      {/* Announcement Bar */}
      <div className="announcement">
        {isAuthenticated && customer
          ? `ZÉLORA MEMBER • FREE EXPRESS SHIPPING ON ORDERS ABOVE ₹1999`
          : `FREE SHIPPING ON ORDERS ABOVE ₹1999`}
      </div>

      {/* Main Navigation */}
      <nav className="navbar">
        {/* Logo */}
        <Link to="/" className="logo">
          ZÉLORA<span>.</span>
        </Link>

        {/* Navigation Links */}
        <div className="nav-links">
          <Link to="/">HOME</Link>

          <a
            href="/#categories"
            onClick={(e) => {
              e.preventDefault();
              handleSectionClick("categories");
            }}
          >
            SHOP
          </a>

          <a
            href="/#new-arrivals"
            onClick={(e) => {
              e.preventDefault();
              handleSectionClick("new-arrivals");
            }}
          >
            NEW ARRIVALS
          </a>

          <a
            href="/#about"
            onClick={(e) => {
              e.preventDefault();
              handleSectionClick("about");
            }}
          >
            ABOUT
          </a>
        </div>

        {/* Navigation Icons */}
        <div className="nav-icons">
          {/* Search Icon */}
          <button
            type="button"
            aria-label="Search"
            title="Search"
            onClick={() => {
              setSearchOpen(!searchOpen);
              setSearchTerm("");
            }}
          >
            <svg viewBox="0 0 24 24">
              <circle cx="10.8" cy="10.8" r="7.2" />
              <path d="M16.2 16.2L21 21" />
            </svg>
          </button>

          {/* Account Icon */}
          {/* Account Dropdown (Logged In) or Sign Up Link (Guest) */}
          {isAuthenticated && customer ? (
            <div className="nav-profile-wrapper" ref={profileRef}>
              <button
                type="button"
                className="nav-icon-link nav-account-pill"
                aria-expanded={profileMenuOpen}
                aria-label="Account menu"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
              >
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="7.5" r="4" />
                  <path d="M4.5 21v-2a7.5 7.5 0 0 1 15 0v2" />
                </svg>
                <span className="nav-user-name">
                  Hi, {cleanFirstName || customer.name}
                </span>
                <span className={`nav-caret ${profileMenuOpen ? "open" : ""}`}>
                  ▾
                </span>
              </button>

              {profileMenuOpen && (
                <div className="nav-profile-dropdown">
                  <div className="dropdown-header">
                    <p className="dropdown-name">
                      {cleanFirstName || customer.name}
                    </p>
                    <span className="dropdown-email">{customer.email}</span>
                  </div>

                  <div className="dropdown-divider" />

                  <Link
                    to="/account"
                    className="dropdown-item"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    My Profile & Orders
                  </Link>

                  <Link
                    to="/wishlist"
                    className="dropdown-item"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    My Wishlist ({wishlist.length})
                  </Link>

                  <Link
                    to="/cart"
                    className="dropdown-item"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    Shopping Bag ({cartCount})
                  </Link>

                  <div className="dropdown-divider" />

                  <button
                    type="button"
                    className="dropdown-item dropdown-logout"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/signup"
              className="nav-icon-link"
              aria-label="Account"
              title="Sign In"
            >
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="7.5" r="4" />
                <path d="M4.5 21v-2a7.5 7.5 0 0 1 15 0v2" />
              </svg>
            </Link>
          )}

          {/* Wishlist Icon */}
          <Link
            to="/wishlist"
            className="nav-icon-link"
            aria-label={`Wishlist (${wishlist.length})`}
            title="My Wishlist"
          >
            <svg viewBox="0 0 24 24">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
            </svg>

            <span>{wishlist.length}</span>
          </Link>

          {/* Shopping Bag Icon */}
          <Link
            to="/cart"
            className="nav-icon-link"
            aria-label={`Shopping Bag (${cartCount})`}
            title="Shopping Bag"
          >
            <svg viewBox="0 0 24 24">
              <path d="M5.5 8h13l1.5 13h-16L5.5 8Z" />
              <path d="M9 9V6a3 3 0 0 1 6 0v3" />
            </svg>

            <span>{cartCount}</span>
          </Link>
        </div>
      </nav>

      {/* Search Panel */}
      {searchOpen && (
        <div className="navbar-search-panel">
          {/* Search Form */}
          <form className="search-input-wrapper" onSubmit={handleSearch}>
            <button
              type="submit"
              aria-label="Submit search"
              className="search-submit-button"
            >
              <svg viewBox="0 0 24 24">
                <circle cx="10.8" cy="10.8" r="7.2" />
                <path d="M16.2 16.2L21 21" />
              </svg>
            </button>

            <input
              type="search"
              placeholder="Search for products, categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />

            <button
              type="button"
              onClick={closeSearch}
              aria-label="Close search"
            >
              ✕
            </button>
          </form>

          {/* Live Search Suggestions */}
          {searchTerm.trim() !== "" && (
            <div className="search-results-container">
              <div className="search-results-heading">
                <h3>Suggested Products</h3>

                <span>{filteredProducts.length} products found</span>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="search-product-grid">
                  {filteredProducts.slice(0, 6).map((product) => (
                    <Link
                      to={`/product/${product.id}`}
                      className="search-product-card"
                      key={product.id}
                      onClick={handleProductClick}
                    >
                      <div className="search-product-image">
                        <img src={product.image} alt={product.name} />

                        {product.label && (
                          <span className="search-product-label">
                            {product.label}
                          </span>
                        )}
                      </div>

                      <div className="search-product-info">
                        <p className="search-product-category">
                          {product.category}
                        </p>

                        <h4>{product.name}</h4>

                        <div className="search-product-price">
                          <span>₹{product.price.toLocaleString("en-IN")}</span>

                          {product.originalPrice && (
                            <del>
                              ₹{product.originalPrice.toLocaleString("en-IN")}
                            </del>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="search-empty-state">
                  <h3>No products found</h3>

                  <p>Try searching for dresses, tops, jeans or blazers.</p>
                </div>
              )}

              {/* View All Results */}
              {filteredProducts.length > 0 && (
                <button
                  type="button"
                  className="view-all-search-results"
                  onClick={handleSearch}
                >
                  VIEW ALL RESULTS →
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
};;

export default Navbar;
