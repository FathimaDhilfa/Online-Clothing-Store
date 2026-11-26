import React from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../Components/Navbar";
import { useProducts } from "../context/ProductContext";

const CategoryProducts = () => {
  const params = useParams();
  // Works whether App.jsx uses :category or :categoryName
  const rawCategory = params.categoryName || params.category || "";
  const { products, loading } = useProducts();

  const normalizedParam = rawCategory.toLowerCase().replace(/-/g, " ").trim();

  const filteredProducts = products.filter(
    (product) =>
      (product.category || "").toLowerCase().replace(/-/g, " ").trim() ===
      normalizedParam,
  );

  const displayTitle = rawCategory
    ? rawCategory.replace(/-/g, " ").toUpperCase()
    : "COLLECTION";

  return (
    <>
      <Navbar />
      <main className="product-section category-products-page">
        <div className="section-heading">
          <p>ZÉLORA COLLECTION</p>
          <h2>{displayTitle}</h2>
          <span>
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "Piece" : "Pieces"} Available
          </span>
        </div>

        {loading && products.length === 0 ? (
          <p style={{ textAlign: "center", color: "#777" }}>
            Loading collection...
          </p>
        ) : (
          <div className="category-products-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
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
              ))
            ) : (
              <p className="no-products">
                No products found in this category yet.
              </p>
            )}
          </div>
        )}

        <div className="back-to-shop">
          <Link to="/">← BACK TO HOME</Link>
        </div>
      </main>
    </>
  );
};

export default CategoryProducts;
