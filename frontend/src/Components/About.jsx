
import React from 'react';
import './About.css';

const About = () => {
  return (
    <section id="about" className="about-section">

      <div className="about-content">

        <p className="about-eyebrow">
          DISCOVER ZÉLORA
        </p>

        <h2>
          Where Style Meets
          <br />
          Confidence.
        </h2>

        <p className="about-description">
          At ZÉLORA, we believe every woman deserves
          to feel confident, beautiful, and effortlessly
          stylish.

          <br /><br />

          Our collection of thoughtfully curated women's
          western wear brings together modern trends,
          timeless elegance, and everyday comfort.
          From everyday essentials to statement pieces,
          every style is selected to help you express
          your individuality.

          <br /><br />

          Because your style tells your story — make
          every look unforgettable.
        </p>

        <a href="#categories" className="hero-button">
          EXPLORE COLLECTION
        </a>

      </div>

      <div className="about-image">
        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900"
          alt="ZÉLORA women's western fashion collection"
        />
      </div>

    </section>
  );
};

export default About;
