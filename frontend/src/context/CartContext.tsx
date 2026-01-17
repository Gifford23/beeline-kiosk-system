import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import toast from "react-hot-toast";

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
  updateQuantity: (id: number, quantity: number) => void;
  getCartCount: () => number;
  getCartTotal: () => number;
  clearCart: () => void; // Added clearCart for after checkout
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  // 1. INITIALIZE FROM LOCAL STORAGE
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem("beeline_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // 2. SAVE TO LOCAL STORAGE ON CHANGE
  useEffect(() => {
    localStorage.setItem("beeline_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: any) => {
    const isLikelyExisting = cart.some((item) => item.id === product.id);
    if (isLikelyExisting) {
      toast.success(`Added another ${product.name}`, { icon: "👌" });
    } else {
      toast.success(`${product.name} added to bag!`, { icon: "🍗" });
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return;
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (id: number) => {
    toast.error("Item removed", { icon: "🗑️" });
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // 3. NEW: Clear Cart Function
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("beeline_cart");
  };

  const getCartCount = () =>
    cart.reduce((total, item) => total + item.quantity, 0);
  const getCartTotal = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        getCartCount,
        getCartTotal,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
