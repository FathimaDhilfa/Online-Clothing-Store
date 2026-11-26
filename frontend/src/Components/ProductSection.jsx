import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../context/ProductContext";

const ProductSection = () => {
  const { products, loading } = useProducts();
  const viewportRef = useRef(null);

  const scrollProducts = (direction) => {
    if (!viewportRef.current) return;
    const scrollAmount = viewportRef.current.clientWidth * 0.8;
    viewportRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section id="new-arrivals" className="product-section">
      <div className="section-heading">
        <p>CURATED SELECTION</p>
        <h2>New Arrivals</h2>
        <span>
          Explore our latest seasonal pieces crafted for everyday elegance
        </span>
      </div>

      {loading && products.length === 0 ? (
        <p style={{ textAlign: "center", color: "#777" }}>
          Loading collection...
        </p>
      ) : (
        <div className="product-carousel">
          <button
            type="button"
            className="product-arrow product-arrow-left"
            onClick={() => scrollProducts("left")}
            aria-label="Scroll products left"
          >
            ‹
          </button>

          <div className="product-carousel-viewport" ref={viewportRef}>
            <div className="product-grid">
              {products.map((product) => (
                <div className="product-card" key={product.id || product._id}>
                  <Link
                    to={`/product/${product.id || product._id}`}
                    className="product-image-link"
                  >
                    <div className="product-image">
                      {product.label && (
                        <span className="product-label">{product.label}</span>
                      )}
                      <img src={product.image} alt={product.name} />
                    </div>
                  </Link>

                  <div className="product-info">
                    <Link
                      to={`/product/${product.id || product._id}`}
                      className="product-name-link"
                    >
                      <h3>{product.name}</h3>
                    </Link>

                    <div className="product-price">
                      <span>
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </span>
                      {product.originalPrice &&
                        product.originalPrice > product.price && (
                          <del>
                            ₹
                            {Number(product.originalPrice).toLocaleString(
                              "en-IN",
                            )}
                          </del>
                        )}
                    </div>

                    <Link
                      to={`/product/${product.id || product._id}`}
                      className="add-to-cart"
                    >
                      VIEW DETAILS
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="product-arrow product-arrow-right"
            onClick={() => scrollProducts("right")}
            aria-label="Scroll products right"
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
};

export default ProductSection;
