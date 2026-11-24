
import React from 'react';

import Navbar from '../Components/Navbar';
import Hero from '../Components/Hero';
import CategorySection from '../Components/CategorySection';
import ProductSection from '../Components/ProductSection';
import About from '../Components/About';

import { useAuth } from '../context/AuthContext';

const Home = () => {

  const { customer, isAuthenticated } = useAuth();

  return (
    <>
      <Navbar />

      <main>

        {isAuthenticated && customer && (
          <div className="customer-welcome">
            <h2>Welcome back, {customer.name}!</h2>
            <p>Discover your next favourite look at ZÉLORA.</p>
          </div>
        )}

        <Hero />

        <CategorySection />

        <ProductSection />

        <About />

      </main>
    </>
  );
};

export default Home;
