import React, { createContext, useContext, useState, ReactNode } from "react";
import toast from "react-hot-toast"; // 1. Import Toast

// 2. Define Types
export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: any) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void; // Added for +/- buttons
  getCartCount: () => number;
  getCartTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Function: Add Item
  const addToCart = (product: any) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        toast.success(`Added another ${product.name}`, { icon: "👌" }); // Feedback
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        toast.success(`${product.name} added to bag!`, { icon: "🍗" }); // Feedback
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // Function: Update Quantity (Directly set quantity)
  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return; // Prevent going below 1 (use remove for that)

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: quantity } : item
      )
    );
  };

  // Function: Remove Item Completely
  const removeFromCart = (id: number) => {
    toast.error("Item removed", { icon: "🗑️" });
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        getCartCount,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
