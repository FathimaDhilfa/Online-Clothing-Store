import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../Components/Navbar";
import { useProducts } from "../context/ProductContext";

const SearchResults = () => {
  const { products, loading } = useProducts();
  const [searchParams] = useSearchParams();

  const searchTerm = searchParams.get("q") || "";
  const search = searchTerm.trim().toLowerCase();

  // Find matching products from live MongoDB catalog
  const filteredProducts = products.filter((product) => {
    const name = product.name || "";
    const category = product.category || "";
    const description = product.description || "";

    return (
      name.toLowerCase().includes(search) ||
      category.toLowerCase().includes(search) ||
      description.toLowerCase().includes(search)
    );
  });

  return (
    <>
      <Navbar />
      <main className="search-page">
        {/* Search Page Heading */}
        <div className="search-page-header">
          <p className="search-breadcrumb">HOME / SEARCH</p>
          <h1>Search Results</h1>
          <p>Results for "{searchTerm}"</p>
          <span>
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "product" : "products"} found
          </span>
        </div>

        {/* Loading State */}
        {loading && products.length === 0 ? (
          <p style={{ textAlign: "center", color: "#777", padding: "40px 0" }}>
            Searching collection...
          </p>
        ) : filteredProducts.length > 0 ? (
          /* Product Results Grid */
          <div className="search-page-grid">
            {filteredProducts.map((product) => {
              const prodId = product.id || product._id;
              return (
                <Link
                  to={`/product/${prodId}`}
                  className="search-page-card"
                  key={prodId}
                >
                  <div className="search-page-image">
                    <img src={product.image} alt={product.name} />

                    {product.label && (
                      <span className="search-page-label">{product.label}</span>
                    )}
                  </div>

                  <div className="search-page-info">
                    <p>{product.category}</p>

                    <h3>{product.name}</h3>

                    <div className="search-page-price">
                      <span>
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </span>

                      {Number(product.originalPrice) >
                        Number(product.price) && (
                        <del>
                          ₹
                          {Number(product.originalPrice).toLocaleString(
                            "en-IN",
                          )}
                        </del>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* No Products Found */
          <div className="search-page-empty">
            <div className="search-empty-icon">
              <svg viewBox="0 0 24 24">
                <circle cx="10.8" cy="10.8" r="7.2" />
                <path d="M16.2 16.2L21 21" />
              </svg>
            </div>

            <h2>No products found</h2>

            <p>Sorry, we couldn't find any products matching "{searchTerm}".</p>

            <p>Try searching with another product name or category.</p>

            <Link to="/" className="search-back-home">
              CONTINUE SHOPPING
            </Link>
          </div>
        )}
      </main>
    </>
  );
};

export default SearchResults;
