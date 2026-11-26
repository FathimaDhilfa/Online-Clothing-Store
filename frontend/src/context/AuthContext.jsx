import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  // Load existing customer session
  const [customer, setCustomer] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("zeloraCustomer"));
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("zeloraToken"));

  // Login function
  const login = (data) => {
    console.log("Saving customer:", data.customer);

    localStorage.setItem("zeloraToken", data.token);

    localStorage.setItem("zeloraCustomer", JSON.stringify(data.customer));

    setToken(data.token);
    setCustomer(data.customer);
  };

  // Logout function
  const logout = () => {

    localStorage.removeItem("zeloraToken");
    localStorage.removeItem("zeloraCustomer");

    setToken(null);
    setCustomer(null);
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        token,
        isAuthenticated: Boolean(token && customer),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom authentication hook
export const useAuth = () => useContext(AuthContext);
