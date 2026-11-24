
import React, { useRef, useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import products from '../data/products';

const ProductSection = () => {
  const productSlider = useRef(null);

  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const updateArrows = () => {
    const slider = productSlider.current;
    if (!slider) return;

    setShowLeft(slider.scrollLeft > 5);

    setShowRight(
      slider.scrollLeft + slider.clientWidth < slider.scrollWidth - 5
    );
  };

  const scrollLeft = () => {
    productSlider.current.scrollBy({
      left: -productSlider.current.clientWidth,
      behavior: 'smooth'
    });
  };

  const scrollRight = () => {
    productSlider.current.scrollBy({
      left: productSlider.current.clientWidth,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const slider = productSlider.current;
    if (!slider) return;

    updateArrows();

    slider.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', updateArrows);

    return () => {
      slider.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, []);

  return (
    <section id="new-arrivals" className="product-section">

      <div className="section-heading">
        <p>CURATED FOR YOU</p>
        <h2>New Arrivals</h2>
        <span>Discover the latest additions to our collection.</span>
      </div>

      <div className="product-carousel">

        {showLeft && (
          <button
            className="product-arrow product-arrow-left"
            onClick={scrollLeft}
            aria-label="Previous products"
          >
            &#10094;
          </button>
        )}

        <div className="product-carousel-viewport" ref={productSlider}>

          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

        </div>

        {showRight && (
          <button
            className="product-arrow product-arrow-right"
            onClick={scrollRight}
            aria-label="Next products"
          >
            &#10095;
          </button>
        )}

      </div>

    </section>
  );
};

export default ProductSection;
