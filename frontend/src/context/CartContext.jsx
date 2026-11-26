import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

const getItemKey = (item) => {
  const productId = String(item._id || item.id || "");
  const size = String(item.selectedSize || "").trim();
  const color = String(item.selectedColor || "").trim();
  return `${productId}_${size}_${color}`;
};

export const CartProvider = ({ children }) => {
  const { customer } = useAuth();
  const userId = customer?._id || customer?.id || "guest";
  const cartStorageKey = `cartItems_${userId}`;

  // Load cart specific to the current logged-in user (or guest)
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(cartStorageKey)) || [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("wishlist")) || [];
    } catch {
      return [];
    }
  });

  // Switch cart automatically when user logs in or logs out
  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem(cartStorageKey)) || [];
      setCartItems(savedCart);
    } catch {
      setCartItems([]);
    }
  }, [cartStorageKey]);

  // Save current user's cart to LocalStorage
  useEffect(() => {
    localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
  }, [cartItems, cartStorageKey]);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = (newItem) => {
    const normalizedItem = {
      ...newItem,
      id: newItem._id || newItem.id,
      selectedSize: newItem.selectedSize || "",
      selectedColor: newItem.selectedColor || "",
      quantity: Number(newItem.quantity) || 1,
    };

    const newKey = getItemKey(normalizedItem);

    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => getItemKey(item) === newKey,
      );

      if (existingItem) {
        return prevItems.map((item) =>
          getItemKey(item) === newKey
            ? {
                ...item,
                quantity:
                  (Number(item.quantity) || 1) + normalizedItem.quantity,
              }
            : item,
        );
      }

      return [...prevItems, normalizedItem];
    });
  };

  const removeFromCart = (id, size = "", color = "") => {
    const targetKey = `${String(id || "")}_${String(size || "").trim()}_${String(color || "").trim()}`;
    setCartItems((prevItems) =>
      prevItems.filter((item) => getItemKey(item) !== targetKey),
    );
  };

  const updateQuantity = (id, size = "", color = "", quantity) => {
    const parsedQty = Number(quantity);
    if (parsedQty < 1) return;

    const targetKey = `${String(id || "")}_${String(size || "").trim()}_${String(color || "").trim()}`;
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        getItemKey(item) === targetKey
          ? { ...item, quantity: parsedQty }
          : item,
      ),
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem(cartStorageKey);
  };

  const toggleWishlist = (product) => {
    const productId = String(product._id || product.id || "");
    setWishlist((prevItems) => {
      const exists = prevItems.some(
        (item) => String(item._id || item.id || "") === productId,
      );

      return exists
        ? prevItems.filter(
            (item) => String(item._id || item.id || "") !== productId,
          )
        : [...prevItems, { ...product, id: product._id || product.id }];
    });
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        wishlist,
        toggleWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
