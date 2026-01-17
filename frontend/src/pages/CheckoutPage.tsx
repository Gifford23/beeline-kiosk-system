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
  CheckCircle,
  Smartphone,
  Wallet,
  ScanLine,
  Wifi,
  Ticket, // Added Ticket Icon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { createOrder } from "../services/api";
import toast from "react-hot-toast";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();

  const [diningOption, setDiningOption] = useState<"dine-in" | "take-out">(
    () => {
      const saved = localStorage.getItem("orderType");
      return saved === "take-out" ? "take-out" : "dine-in";
    }
  );

  const [paymentMethod, setPaymentMethod] = useState<
    "card" | "gcash" | "maya" | "counter"
  >("card");

  const [isProcessing, setIsProcessing] = useState(false);
  // Added "queue_shown" step
  const [paymentStep, setPaymentStep] = useState<
    "idle" | "awaiting_interaction" | "processing_payment" | "queue_shown"
  >("idle");

  // New state to hold the number to show in the modal
  const [generatedQueueNum, setGeneratedQueueNum] = useState<string>("");

  useEffect(() => {
    localStorage.setItem("orderType", diningOption);
  }, [diningOption]);

  const total = getCartTotal();

  const handlePayNow = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    setIsProcessing(true);

    // Step 1: User Interaction
    if (paymentMethod === "counter") {
      setPaymentStep("processing_payment"); // Skip interaction for counter
    } else {
      setPaymentStep("awaiting_interaction");
    }

    // SIMULATION DELAY (Scanning/Tapping)
    const interactionDelay = paymentMethod === "counter" ? 1000 : 3000;

    setTimeout(() => {
      // Step 2: Processing / Verifying
      setPaymentStep("processing_payment");

      setTimeout(async () => {
        try {
          // --- REAL API CALL HAPPENS HERE NOW ---
          const orderData = {
            customer_name: "Guest User",
            total_amount: total,
            items: cart.map((item) => ({
              id: item.id,
              quantity: item.quantity,
              price: item.price,
            })),
            order_type: diningOption,
            payment_method: paymentMethod,
          };

          const result = await createOrder(orderData);

          // 1. Capture the Queue Number from Backend
          setGeneratedQueueNum(result.queueNumber);

          // 2. Clear Cart
          clearCart();

          // 3. Show the Formal Queue Modal
          setPaymentStep("queue_shown");

          // 4. Redirect after user sees the number (4 seconds)
          setTimeout(() => {
            navigate("/order-success", { state: { orderId: result.orderId } });
          }, 4000);
        } catch (error) {
          console.error("Payment Error:", error);
          toast.error("Transaction Failed. Try again.");
          setIsProcessing(false);
          setPaymentStep("idle");
        }
      }, 2000); // Processing delay
    }, interactionDelay);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6">
        <h2 className="text-2xl font-bold text-gray-400 mb-4">
          Your bag is empty
        </h2>
        <button
          onClick={() => navigate("/")}
          className="text-brand-dark font-bold underline"
        >
          Go back to menu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-gray pb-32 font-sans relative animate-in fade-in">
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
        {/* LEFT COLUMN: Options */}
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-brand-red" /> Dining Option
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setDiningOption("dine-in")}
                className={`p-6 rounded-3xl border-4 flex flex-col items-center gap-3 transition-all ${diningOption === "dine-in" ? "border-brand-red bg-red-50/50 text-brand-red shadow-lg scale-105" : "border-transparent bg-white text-gray-400 hover:bg-gray-100"}`}
              >
                <Store className="w-10 h-10" />
                <span className="font-extrabold text-lg">Dine In</span>
              </button>
              <button
                onClick={() => setDiningOption("take-out")}
                className={`p-6 rounded-3xl border-4 flex flex-col items-center gap-3 transition-all ${diningOption === "take-out" ? "border-brand-yellow bg-yellow-50/50 text-brand-dark shadow-lg scale-105 border-brand-yellow" : "border-transparent bg-white text-gray-400 hover:bg-gray-100"}`}
              >
                <ShoppingBag className="w-10 h-10" />
                <span className="font-extrabold text-lg">Take Out</span>
              </button>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-red" /> Payment Method
            </h2>
            <div className="space-y-3">
              {/* Card */}
              <div
                onClick={() => setPaymentMethod("card")}
                className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${paymentMethod === "card" ? "border-blue-500 bg-blue-50/30 shadow-md" : "border-transparent bg-white hover:bg-gray-50"}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-md">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-brand-dark text-lg">
                    Card Payment
                  </span>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === "card" ? "border-blue-500" : "border-gray-300"}`}
                >
                  {paymentMethod === "card" && (
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                  )}
                </div>
              </div>

              {/* GCash */}
              <div
                onClick={() => setPaymentMethod("gcash")}
                className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${paymentMethod === "gcash" ? "border-blue-400 bg-blue-50/50 shadow-md" : "border-transparent bg-white hover:bg-gray-50"}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#007DFE] rounded-xl flex items-center justify-center text-white shadow-md">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-brand-dark text-lg">
                    GCash
                  </span>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === "gcash" ? "border-[#007DFE]" : "border-gray-300"}`}
                >
                  {paymentMethod === "gcash" && (
                    <div className="w-3 h-3 rounded-full bg-[#007DFE]" />
                  )}
                </div>
              </div>

              {/* Maya */}
              <div
                onClick={() => setPaymentMethod("maya")}
                className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${paymentMethod === "maya" ? "border-green-500 bg-green-50/30 shadow-md" : "border-transparent bg-white hover:bg-gray-50"}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-green-400 shadow-md border border-green-500">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-brand-dark text-lg">
                    Maya
                  </span>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === "maya" ? "border-green-500" : "border-gray-300"}`}
                >
                  {paymentMethod === "maya" && (
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  )}
                </div>
              </div>

              {/* Counter */}
              <div
                onClick={() => setPaymentMethod("counter")}
                className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${paymentMethod === "counter" ? "border-brand-yellow bg-yellow-50/30 shadow-md" : "border-transparent bg-white hover:bg-gray-50"}`}
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
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === "counter" ? "border-brand-yellow" : "border-gray-300"}`}
                >
                  {paymentMethod === "counter" && (
                    <div className="w-3 h-3 rounded-full bg-brand-yellow" />
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Receipt Summary */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 h-fit sticky top-24 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-brand-red opacity-10"></div>
          <h2 className="text-xl font-black text-brand-dark mb-6 flex items-center gap-2">
            <Receipt className="text-gray-400" /> Order Summary
          </h2>
          <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-gray-500">
                    {item.quantity}x
                  </div>
                  <span className="font-bold text-gray-700">{item.name}</span>
                </div>
                <span className="font-bold text-gray-900">
                  ₱{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="bg-brand-gray p-4 rounded-xl flex justify-between items-center mb-6">
            <span className="font-bold text-gray-600">Total to Pay</span>
            <span className="text-3xl font-black text-brand-red">
              ₱{total.toFixed(2)}
            </span>
          </div>
          <button
            onClick={handlePayNow}
            disabled={isProcessing}
            className="w-full bg-brand-red text-white py-5 rounded-2xl font-black text-xl shadow-lg shadow-red-200 hover:bg-red-700 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isProcessing ? "PROCESSING..." : "PAY NOW"}
          </button>
        </div>
      </div>

      {/* --- QUEUE / PAYMENT MODAL --- */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden border-4 border-white">
            {/* 1. INTERACTION STAGE */}
            {paymentStep === "awaiting_interaction" && (
              <div className="py-4 animate-in zoom-in duration-300">
                {(paymentMethod === "gcash" || paymentMethod === "maya") && (
                  <>
                    <h3 className="text-xl font-black text-gray-800 mb-4">
                      Scan to Pay
                    </h3>
                    <div className="bg-gray-900 p-4 rounded-xl inline-block mb-4 shadow-inner relative">
                      <ScanLine className="text-white w-32 h-32 animate-pulse" />
                    </div>
                    <p className="text-gray-500 font-bold mb-2">
                      Total: ₱{total.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">
                      Open your app and scan this QR code.
                    </p>
                  </>
                )}
                {paymentMethod === "card" && (
                  <>
                    <h3 className="text-xl font-black text-gray-800 mb-4">
                      Follow Terminal
                    </h3>
                    <div className="bg-blue-50 p-6 rounded-full inline-block mb-6 animate-pulse">
                      <Wifi className="text-blue-500 w-16 h-16" />
                    </div>
                    <p className="text-gray-600 font-bold mb-2">
                      Tap or Insert Card
                    </p>
                  </>
                )}
              </div>
            )}

            {/* 2. PROCESSING STAGE */}
            {paymentStep === "processing_payment" && (
              <div className="py-8 flex flex-col items-center">
                <Loader2
                  size={64}
                  className="text-brand-yellow animate-spin mb-6"
                />
                <h3 className="text-2xl font-black text-gray-800 mb-2">
                  {paymentMethod === "counter"
                    ? "Generating Ticket..."
                    : "Verifying Payment..."}
                </h3>
                <p className="text-gray-500 font-medium">
                  Please wait a moment...
                </p>
              </div>
            )}

            {/* 3. QUEUE NUMBER DISPLAY (NEW FORMAL MODAL) */}
            {paymentStep === "queue_shown" && (
              <div className="py-4 flex flex-col items-center animate-in zoom-in duration-500">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                  <CheckCircle size={32} strokeWidth={4} />
                </div>

                <h3 className="text-lg font-bold text-gray-500 uppercase tracking-widest mb-1">
                  Order Successful
                </h3>

                {/* TICKET VISUAL */}
                <div className="bg-brand-gray w-full p-6 rounded-2xl border-2 border-dashed border-gray-300 my-4 relative">
                  <div className="absolute -left-3 top-1/2 w-6 h-6 bg-white rounded-full"></div>
                  <div className="absolute -right-3 top-1/2 w-6 h-6 bg-white rounded-full"></div>

                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                    Your Queue Number
                  </p>
                  <p className="text-6xl font-black text-brand-dark tracking-tighter">
                    {generatedQueueNum}
                  </p>
                </div>

                <p className="text-gray-400 text-xs">
                  Redirecting to your receipt...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
