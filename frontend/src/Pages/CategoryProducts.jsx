
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductCard from '../Components/ProductCard';
import products from '../data/products';

const categoryNames = {
  'tops-tshirts': 'Tops & T-shirts',
  'dresses': 'Dresses',
  'jeans-denim': 'Jeans & Denim',
  'coord-sets': 'Co-ord Sets',
  'blazers': 'Blazers'
};

const CategoryProducts = () => {

  const { slug } = useParams();

  const categoryName = categoryNames[slug];

  const filteredProducts = products.filter(
    (product) => product.category === categoryName
  );

  return (
    <section className="product-section category-products-page">

      <div className="section-heading">
        <p>EXPLORE OUR COLLECTION</p>

        <h2>{categoryName || 'Category Not Found'}</h2>

        <span>
          Discover our collection of {categoryName || 'fashion products'}.
        </span>
      </div>

      <div className="category-products-grid">

        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))
        ) : (
          <p className="no-products">
            No products available in this category.
          </p>
        )}

      </div>

      <div className="back-to-shop">
        <Link to="/">← Back to Home</Link>
      </div>

    </section>
  );
};

export default CategoryProducts;
