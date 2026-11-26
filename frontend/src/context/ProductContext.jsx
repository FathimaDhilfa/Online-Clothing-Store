import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import staticProducts from "../data/products";

const ProductContext = createContext();

const normalizeProduct = (item) => {
  const firstImage =
    item.image ||
    (Array.isArray(item.images) && item.images.length > 0
      ? item.images[0]
      : "");

  return {
    ...item,
    id: String(item._id || item.id),
    _id: item._id || item.id,
    image: firstImage,
    images:
      Array.isArray(item.images) && item.images.length > 0
        ? item.images
        : firstImage
          ? [firstImage]
          : [],
    price: Number(item.price) || 0,
    originalPrice: item.originalPrice ? Number(item.originalPrice) : null,
    stock: item.stock !== undefined ? Number(item.stock) : 10,
    sizes:
      Array.isArray(item.sizes) && item.sizes.length > 0
        ? item.sizes
        : ["XS", "S", "M", "L"],
    colors: item.colors || item.colours || [],
  };
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      const rawList = Array.isArray(data) ? data : data.products || [];

      if (rawList.length > 0) {
        setProducts(rawList.map(normalizeProduct));
      } else {
        setProducts(staticProducts.map(normalizeProduct));
      }
    } catch (error) {
      console.error("Using fallback static products:", error);
      setProducts(staticProducts.map(normalizeProduct));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <ProductContext.Provider
      value={{ products, loading, refreshProducts: fetchProducts }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
