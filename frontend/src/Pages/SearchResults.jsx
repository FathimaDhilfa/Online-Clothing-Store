
import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import products from '../data/products';

const SearchResults = () => {
  const [searchParams] = useSearchParams();

  const searchTerm = searchParams.get('q') || '';
  const search = searchTerm.trim().toLowerCase();

  // Find matching products
  const filteredProducts = products.filter((product) => {
    const name = product.name || '';
    const category = product.category || '';
    const description = product.description || '';

    return (
      name.toLowerCase().includes(search) ||
      category.toLowerCase().includes(search) ||
      description.toLowerCase().includes(search)
    );
  });

  return (
    <main className="search-page">

      {/* Search Page Heading */}
      <div className="search-page-header">

        <p className="search-breadcrumb">
          HOME / SEARCH
        </p>

        <h1>Search Results</h1>

        <p>
          Results for "{searchTerm}"
        </p>

        <span>
          {filteredProducts.length} products found
        </span>

      </div>

      {/* Product Results */}
      {filteredProducts.length > 0 ? (

        <div className="search-page-grid">

          {filteredProducts.map((product) => (

            <Link
              to={`/product/${product.id}`}
              className="search-page-card"
              key={product.id}
            >

              <div className="search-page-image">

                <img
                  src={product.image}
                  alt={product.name}
                />

                {product.label && (
                  <span className="search-page-label">
                    {product.label}
                  </span>
                )}

              </div>

              <div className="search-page-info">

                <p>{product.category}</p>

                <h3>{product.name}</h3>

                <div className="search-page-price">

                  <span>
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>

                  {product.originalPrice && (
                    <del>
                      ₹{product.originalPrice.toLocaleString('en-IN')}
                    </del>
                  )}

                </div>

              </div>

            </Link>

          ))}

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

          <p>
            Sorry, we couldn't find any products matching
            "{searchTerm}".
          </p>

          <p>
            Try searching with another product name or category.
          </p>

          <Link to="/" className="search-back-home">
            CONTINUE SHOPPING
          </Link>

        </div>

      )}

    </main>
  );
};

export default SearchResults;
