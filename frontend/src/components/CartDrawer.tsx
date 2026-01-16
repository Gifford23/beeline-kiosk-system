import React from "react";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

// 1. Add orderType to interface
interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  orderType?: string; // Optional string prop
}

const CartDrawer = ({ isOpen, onClose, orderType }: CartDrawerProps) => {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-red" />
            <div>
              <h2 className="text-xl font-black text-brand-dark leading-none">
                My Order
              </h2>
              {/* 2. Display Order Type */}
              {orderType && (
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {orderType === "take-out" ? "Take Out" : "Dine In"}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Cart Items Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
              <ShoppingBag className="w-24 h-24 text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-400">
                Your bag is empty
              </h3>
              <p className="text-sm text-gray-400">
                Start adding delicious food!
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2 bg-white border border-gray-300 rounded-full text-sm font-bold text-gray-500 hover:bg-gray-50"
              >
                Go Back to Menu
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4"
              >
                {/* Image Thumbnail */}
                <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Info & Controls */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-brand-dark text-sm line-clamp-2">
                      {item.name}
                    </h3>
                    <span className="font-bold text-brand-red">
                      ₱{item.price * item.quantity}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-brand-red disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-black w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-7 h-7 flex items-center justify-center bg-white rounded-md shadow-sm text-brand-dark hover:text-green-600"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer (Total & Checkout) */}
        {cart.length > 0 && (
          <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500 font-bold">Total Amount</span>
              <span className="text-3xl font-black text-brand-dark">
                ₱{getCartTotal()}
              </span>
            </div>
            <button
              onClick={() => {
                onClose();
                navigate("/checkout");
              }}
              className="w-full bg-brand-red text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-red-200 hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
