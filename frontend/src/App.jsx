
import './App.css';
import { ProductProvider } from "./context/ProductContext";
import AdminProducts from './admin/AdminProducts';
import Home from './Pages/Home';
import ProductDetails from './Pages/ProductDetails';
import Cart from './Pages/Cart';
import Wishlist from './Pages/Wishlist';
import Checkout from './Pages/Checkout';
import OrderSuccess from './Pages/OrderSuccess';
import CategoryProducts from './Pages/CategoryProducts';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import Account from './Pages/Account';
import SearchResults from './Pages/SearchResults';
import AdminOrders from "./Pages/AdminOrders";
import AdminCustomers from "./Pages/AdminCustomers";
import Footer from './Components/Footer';
import ScrollToTop from './Components/ScrollToTop';

import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import {
  BrowserRouter,
  Routes,
  Route,
  useLocation
} from 'react-router-dom';

function AppContent() {
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      <ScrollToTop />

      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <Routes>
              {/* Storefront Routes */}
              <Route path="/" element={<Home />} />

              <Route
                path="/products/category/:slug"
                element={<CategoryProducts />}
              />

              <Route path="/product/:id" element={<ProductDetails />} />

              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/account" element={<Account />} />
              <Route path="/search" element={<SearchResults />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />

              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/customers" element={<AdminCustomers />} />
            </Routes>

            {/* Footer only appears on storefront pages */}
            {!isAdminRoute && <Footer />}
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
