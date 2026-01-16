import React, { useState, useEffect } from "react";
import { ShoppingBag, ChevronLeft, Loader2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartDrawer from "../components/CartDrawer";
import { fetchMenu } from "../services/api";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  image_url: string;
  description: string;
  is_available: boolean; // 1. Added this field
}

const CATEGORIES = [
  "All",
  "Chicken",
  "Burgers",
  "Spaghetti",
  "Sides",
  "Drinks",
];

const MenuPage = () => {
  const navigate = useNavigate();
  const { addToCart, getCartCount } = useCart();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const data = await fetchMenu();
        // 2. We do NOT filter here. We want to fetch everything so we can show "Sold Out" items.
        setMenuItems(data);
      } catch (error) {
        console.error("Failed to load menu:", error);
      } finally {
        setLoading(false);
      }
    };
    loadMenu();
  }, []);

  const filteredItems =
    activeCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-gray text-brand-red">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-bold text-xl">Loading Deliciousness...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-8 h-8 text-brand-dark" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-brand-dark">Our Menu</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">
              Cagayan de Oro Branch
            </p>
          </div>
        </div>

        <div
          className="relative p-3 bg-brand-red/10 rounded-full cursor-pointer hover:bg-brand-red/20 transition-colors"
          onClick={() => setIsCartOpen(true)}
        >
          <ShoppingBag className="w-6 h-6 text-brand-red" />
          {getCartCount() > 0 && (
            <span className="absolute -top-1 -right-1 bg-brand-red text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-bounce">
              {getCartCount()}
            </span>
          )}
        </div>
      </div>

      {/* Category Sidebar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-[80px] z-30 overflow-x-auto no-scrollbar">
        <div className="flex gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all transform hover:scale-105
                    ${
                      activeCategory === cat
                        ? "bg-brand-red text-white shadow-lg shadow-red-200"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col transition-all duration-300 group relative overflow-hidden
                  ${
                    !item.is_available
                      ? "opacity-70 grayscale pointer-events-none bg-gray-50"
                      : "hover:shadow-xl"
                  }`}
            >
              {/* 3. SOLD OUT STAMP (Only visible if unavailable) */}
              {!item.is_available && (
                <div className="absolute top-4 right-4 z-10 bg-gray-800 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  Sold Out
                </div>
              )}

              {/* Image Area */}
              <div className="h-48 w-full rounded-2xl mb-4 overflow-hidden relative flex items-center justify-center">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://placehold.co/400x300?text=No+Image";
                  }}
                />

                {/* Hover Add Button (Only if available) */}
                {item.is_available && (
                  <button
                    onClick={() =>
                      addToCart({
                        id: item.id,
                        name: item.name,
                        price: Number(item.price),
                        image: item.image_url,
                      })
                    }
                    className="absolute bottom-3 right-3 bg-brand-yellow text-brand-dark p-3 rounded-xl shadow-lg hover:bg-yellow-400 active:scale-95 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                  >
                    <span className="font-black text-sm">ADD +</span>
                  </button>
                )}
              </div>

              {/* Info Area */}
              <div className="flex flex-col flex-1">
                <h3 className="font-extrabold text-lg text-brand-dark leading-tight mb-1">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-1">
                  {item.description}
                </p>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xl font-black text-brand-red">
                    ₱{Number(item.price).toFixed(0)}
                  </span>

                  {/* Mobile Add / Sold Out Button */}
                  <button
                    disabled={!item.is_available}
                    onClick={() =>
                      addToCart({
                        id: item.id,
                        name: item.name,
                        price: Number(item.price),
                        image: item.image_url,
                      })
                    }
                    className={`px-4 py-2 rounded-lg font-bold text-sm shadow-sm lg:hidden
                                ${
                                  item.is_available
                                    ? "bg-brand-yellow text-brand-dark"
                                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                }`}
                  >
                    {item.is_available ? "ADD" : "SOLD OUT"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default MenuPage;
