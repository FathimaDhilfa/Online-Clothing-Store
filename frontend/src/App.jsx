import './App.css';
import Home from './Pages/Home';
import ProductDetails from './Pages/ProductDetails';
import Cart from './Pages/Cart';
import Wishlist from './Pages/Wishlist';
import Checkout from './Pages/Checkout';
import OrderSuccess from './Pages/OrderSuccess';
import CategoryProducts from './Pages/CategoryProducts';
import Login from './Pages/Login';
import Footer from './Components/Footer';
import Signup from './Pages/Signup';
import Account from './Pages/Account';
import { AuthProvider } from './context/AuthContext';
import SearchResults from './Pages/SearchResults';
import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';

import { CartProvider } from './context/CartContext';

function App() {

  return (
    <BrowserRouter>
  <AuthProvider>
    <CartProvider>

        <Routes>

          <Route path="/" element={<Home />} />

          <Route
            path="/products/category/:slug"
            element={<CategoryProducts />}
          />

          <Route
            path="/product/:id"
            element={<ProductDetails />}
          />

          <Route
            path="/cart"
            element={<Cart />}
          />

          <Route
            path="/wishlist"
            element={<Wishlist />}
          />

          <Route
            path="/checkout"
            element={<Checkout />}
          />

          <Route
            path="/order-success"
            element={<OrderSuccess />}
          />

          <Route
            path="/login"
            element={<Login />}
          />
          <Route path="/signup" element={<Signup />} />
          <Route path="/account" element={<Account />} />
          <Route path="/search" element={<SearchResults />} />

        </Routes>

        <Footer />

      </CartProvider>
  </AuthProvider>
</BrowserRouter>
  );
}

export default App;
