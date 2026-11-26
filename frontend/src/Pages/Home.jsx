import React from "react";
import { Link } from "react-router-dom";

import Navbar from "../Components/Navbar";
import Hero from "../Components/Hero";
import CategorySection from "../Components/CategorySection";
import ProductSection from "../Components/ProductSection";
import About from "../Components/About";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Home = () => {
  const { customer, isAuthenticated } = useAuth();
  const { cartItems, wishlist } = useCart();

  // Format display name cleanly (e.g., "fathima3" -> "Fathima")
  const rawFirstName = customer?.name ? customer.name.split(" ")[0] : "Member";
  const cleanName = rawFirstName.replace(/[0-9]+$/, "") || rawFirstName;
  const firstName =
    cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();

  const totalCartItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  // Live subtotal & free shipping progress (₹1,999 threshold)
  const FREE_SHIPPING_THRESHOLD = 1999;
  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * item.quantity,
    0,
  );
  const amountRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);
  const shippingProgress = Math.min(
    100,
    Math.round((cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100),
  );

  return (
    <>
      <Navbar />

      <main>
        {isAuthenticated && customer ? (
          <>
            {/* Personalized Editorial Member Hero */}
            <section className="member-hero">
              <div className="member-hero-container">
                {/* Left Column */}
                <div className="member-hero-text">
                  <span className="member-eyebrow">
                    ZÉLORA PRIVÉ • MEMBER PORTAL
                  </span>
                  <h1>Welcome back, {firstName}.</h1>
                  <p>
                    Your curated wardrobe, saved pieces, and order updates are
                    ready.
                  </p>

                  <div className="member-quick-actions">
                    <Link to="/account" className="member-btn-primary">
                      MY ORDERS & PROFILE
                    </Link>
                    <a href="#new-arrivals" className="member-link-editorial">
                      Explore New Arrivals →
                    </a>
                  </div>
                </div>

            
              </div>
            </section>

            {/* Pick Up Where You Left Off (Shows if Cart or Wishlist has items) */}
            {(cartItems.length > 0 || wishlist.length > 0) && (
              <section className="member-shelf">
                <div className="member-shelf-header">
                  <div>
                    <span className="member-eyebrow">
                      PICK UP WHERE YOU LEFT OFF
                    </span>
                    <h2>
                      {cartItems.length > 0
                        ? "Waiting in Your Bag"
                        : "Your Saved Wishlist"}
                    </h2>
                  </div>
                  <Link
                    to={cartItems.length > 0 ? "/cart" : "/wishlist"}
                    className="member-shelf-link"
                  >
                    {cartItems.length > 0
                      ? "PROCEED TO BAG →"
                      : "VIEW ALL SAVED →"}
                  </Link>
                </div>

                <div className="member-shelf-grid">
                  {(cartItems.length > 0 ? cartItems : wishlist)
                    .slice(0, 4)
                    .map((item, idx) => (
                      <Link
                        to={`/product/${item.id}`}
                        key={`${item.id}-${item.size || idx}`}
                        className="member-shelf-card"
                      >
                        <img src={item.image} alt={item.name} />
                        <div className="member-shelf-info">
                          <h4>{item.name}</h4>
                          <p>
                            ₹{Number(item.price).toLocaleString("en-IN")}
                            {item.size ? ` • Size ${item.size}` : ""}
                            {item.quantity ? ` (Qty: ${item.quantity})` : ""}
                          </p>
                        </div>
                      </Link>
                    ))}
                </div>
              </section>
            )}
          </>
        ) : (
          /* Default Storefront Hero for Guests */
          <Hero />
        )}

        {/* Shared Catalog Sections */}
        <CategorySection />
        <ProductSection />
        <About />
      </main>
    </>
  );
};

export default Home;
