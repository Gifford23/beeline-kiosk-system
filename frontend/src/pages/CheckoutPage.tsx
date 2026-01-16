import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  CreditCard,
  Banknote,
  Store,
  ShoppingBag,
  Loader2,
  Utensils,
  Receipt,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { placeOrder } from "../services/api";
import PaymentModal from "../components/PaymentModal";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal } = useCart();

  // 1. Initialize State from LocalStorage (Memory)
  const [diningOption, setDiningOption] = useState<"dine-in" | "take-out">(
    () => {
      const saved = localStorage.getItem("orderType");
      return saved === "take-out" ? "take-out" : "dine-in";
    }
  );

  const [paymentMethod, setPaymentMethod] = useState<
    "gcash" | "maya" | "card" | "counter"
  >("gcash");

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // 2. Update LocalStorage if user changes their mind here
  useEffect(() => {
    localStorage.setItem("orderType", diningOption);
  }, [diningOption]);

  const handlePaymentInitiation = () => {
    setIsPaymentModalOpen(true);
  };

  const handleFinalizeOrder = async () => {
    setIsPaymentModalOpen(false);
    setIsProcessing(true);

    try {
      const orderData = {
        customer_name: "Guest User",
        total_amount: getCartTotal(),
        payment_method: paymentMethod,
        items: cart,
        order_type: diningOption, // 3. CRITICAL: Send this to Backend
      };

      const result = await placeOrder(orderData);

      // Clear cart/storage after success if you want, or handle in SuccessPage
      navigate("/success", { state: { queueNumber: result.queueNumber } });
    } catch (error) {
      console.error("Order Failed:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-gray pb-32 font-sans">
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={getCartTotal()}
        method={paymentMethod}
        onPaymentSuccess={handleFinalizeOrder}
      />

      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center gap-4 shadow-sm sticky top-0 z-20">
        <button
          onClick={() => navigate("/menu")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-8 h-8 text-brand-dark" />
        </button>
        <h1 className="text-2xl font-black text-brand-dark">Checkout</h1>
      </div>

      <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Options */}
        <div className="space-y-8">
          {/* Dining Option */}
          <section>
            <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-brand-red" /> Dining Option
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setDiningOption("dine-in")}
                className={`p-6 rounded-3xl border-4 flex flex-col items-center gap-3 transition-all duration-300
                  ${
                    diningOption === "dine-in"
                      ? "border-brand-red bg-red-50/50 text-brand-red shadow-lg scale-105"
                      : "border-transparent bg-white text-gray-400 hover:bg-gray-100"
                  }`}
              >
                <Store className="w-10 h-10" />
                <span className="font-extrabold text-lg">Dine In</span>
              </button>
              <button
                onClick={() => setDiningOption("take-out")}
                className={`p-6 rounded-3xl border-4 flex flex-col items-center gap-3 transition-all duration-300
                  ${
                    diningOption === "take-out"
                      ? "border-brand-yellow bg-yellow-50/50 text-brand-dark shadow-lg scale-105 border-brand-yellow"
                      : "border-transparent bg-white text-gray-400 hover:bg-gray-100"
                  }`}
              >
                <ShoppingBag className="w-10 h-10" />
                <span className="font-extrabold text-lg">Take Out</span>
              </button>
            </div>
          </section>

          {/* Payment Method */}
          <section>
            <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-red" /> Payment Method
            </h2>
            <div className="space-y-3">
              {/* GCash */}
              <div
                onClick={() => setPaymentMethod("gcash")}
                className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all
                  ${
                    paymentMethod === "gcash"
                      ? "border-blue-500 bg-blue-50/30 shadow-md"
                      : "border-transparent bg-white hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-md">
                    GCash
                  </div>
                  <span className="font-bold text-brand-dark text-lg">
                    GCash
                  </span>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "gcash"
                      ? "border-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {paymentMethod === "gcash" && (
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                  )}
                </div>
              </div>

              {/* Maya */}
              <div
                onClick={() => setPaymentMethod("maya")}
                className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all
                  ${
                    paymentMethod === "maya"
                      ? "border-green-500 bg-green-50/30 shadow-md"
                      : "border-transparent bg-white hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-md">
                    Maya
                  </div>
                  <span className="font-bold text-brand-dark text-lg">
                    Maya
                  </span>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "maya"
                      ? "border-green-500"
                      : "border-gray-300"
                  }`}
                >
                  {paymentMethod === "maya" && (
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  )}
                </div>
              </div>

              {/* Counter */}
              <div
                onClick={() => setPaymentMethod("counter")}
                className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all
                  ${
                    paymentMethod === "counter"
                      ? "border-brand-yellow bg-yellow-50/30 shadow-md"
                      : "border-transparent bg-white hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-yellow rounded-xl flex items-center justify-center text-brand-dark shadow-md">
                    <Banknote className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-brand-dark text-lg">
                    Pay at Counter
                  </span>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === "counter"
                      ? "border-brand-yellow"
                      : "border-gray-300"
                  }`}
                >
                  {paymentMethod === "counter" && (
                    <div className="w-3 h-3 rounded-full bg-brand-yellow" />
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Receipt */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 h-fit sticky top-24 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-brand-red opacity-10"></div>

          <h2 className="text-xl font-black text-brand-dark mb-6 flex items-center gap-2">
            <Receipt className="text-gray-400" /> Order Summary
          </h2>

          <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-gray-500">
                    {item.quantity}x
                  </div>
                  <span className="font-bold text-gray-700">{item.name}</span>
                </div>
                <span className="font-bold text-gray-900">
                  ₱{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t-2 border-dashed border-gray-200 py-4 space-y-2">
            <div className="flex justify-between text-gray-500 text-sm">
              <span>Subtotal</span>
              <span>₱{getCartTotal()}</span>
            </div>
            <div className="flex justify-between text-gray-500 text-sm">
              <span>Service Fee</span>
              <span>₱0.00</span>
            </div>
          </div>

          <div className="bg-brand-gray p-4 rounded-xl flex justify-between items-center mb-6">
            <span className="font-bold text-gray-600">Total to Pay</span>
            <span className="text-3xl font-black text-brand-red">
              ₱{getCartTotal()}
            </span>
          </div>

          <button
            onClick={handlePaymentInitiation}
            disabled={isProcessing}
            className="w-full bg-brand-red text-white py-5 rounded-2xl font-black text-xl shadow-lg shadow-red-200 hover:bg-red-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Processing...
              </>
            ) : (
              `PAY NOW`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
