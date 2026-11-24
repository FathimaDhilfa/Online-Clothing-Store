
import React, { useRef, useState, useEffect, useCallback } from 'react';
import {useNavigate} from 'react-router-dom';

const categories = [
  {
    name: "Tops & T-shirts",
    image: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=800&q=85",
    slug: "tops-tshirts"
  },
  {
    name: "Dresses",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600",
    slug: "dresses"
  },
  {
    name: "Jeans & Denim",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600",
    slug: "jeans-denim"
  },
  {
    name: "Co-ord Sets",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600",
    slug: "coord-sets"
  },
  {
    name: "Blazers",
    image: "https://th.bing.com/th/id/OIP.XrWNdvuAcE6XetiYAzJh3AHaLH?w=186&h=279&c=7&r=0&o=7&dpr=1.7&pid=1.7&rm=3",
    slug: "blazers"
  }
];

const CategorySection = () => {
  const navigate = useNavigate();

  const sliderRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check whether more categories are available
  const checkScrollPosition = useCallback(() => {
    const slider = sliderRef.current;

    if (!slider) return;

    const maxScroll = slider.scrollWidth - slider.clientWidth;

    setCanScrollLeft(slider.scrollLeft > 2);
    setCanScrollRight(slider.scrollLeft < maxScroll - 2);
  }, []);

  // Scroll one category card at a time
  const scrollCategories = (direction) => {
    const slider = sliderRef.current;

    if (!slider) return;

    const card = slider.querySelector('.category-card');

    if (!card) return;

    const styles = window.getComputedStyle(slider);
    const gap = parseFloat(styles.columnGap) || 20;

    const scrollAmount = card.getBoundingClientRect().width + gap;

    slider.scrollBy({
      left: direction * scrollAmount,
      behavior: 'smooth'
    });
  };

  // Check initial position and listen for resizing
  useEffect(() => {
    const slider = sliderRef.current;

    if (!slider) return;

    checkScrollPosition();

    const observer = new ResizeObserver(() => {
      checkScrollPosition();
    });

    observer.observe(slider);

    return () => {
      observer.disconnect();
    };
  }, [checkScrollPosition]);

  return (
    <section className="category-section" id="categories">

      {/* Section Heading */}
      <div className="section-heading">
        <p>EXPLORE OUR COLLECTION</p>
        <h2>Shop by Category</h2>
      </div>

      {/* Slider Wrapper */}
      <div className="category-slider-wrapper">

        {/* Previous Arrow */}
        {canScrollLeft && (
          <button
            type="button"
            className="category-arrow left-arrow"
            onClick={() => scrollCategories(-1)}
            aria-label="Previous categories"
          >
            &#8249;
          </button>
        )}

        {/* Category Cards */}
        <div
          className="category-grid"
          ref={sliderRef}
          onScroll={checkScrollPosition}
        >
          {categories.map((category) => (
            <div
              className="category-card"
              key={category.name}
              onClick={() => navigate(`/products/category/${category.slug}`)}
            >
              <img
                src={category.image}
                alt={category.name}
              />

              <div className="category-overlay">
                <h3>{category.name}</h3>
                <span>SHOP NOW →</span>
              </div>
            </div>
          ))}
        </div>

        {/* Next Arrow */}
        {canScrollRight && (
          <button
            type="button"
            className="category-arrow right-arrow"
            onClick={() => scrollCategories(1)}
            aria-label="Next categories"
          >
            &#8250;
          </button>
        )}

      </div>
    </section>
  );
};

export default CategorySection;
