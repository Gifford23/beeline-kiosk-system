import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Printer,
  AlertCircle,
  Home,
  Receipt,
  MapPin,
  Clock,
  ShoppingBag,
  Utensils,
  CreditCard,
  Banknote,
  // ChefHat removed as it is no longer needed
} from "lucide-react";
import { io } from "socket.io-client";
import { fetchOrderById } from "../services/api";

// Order Interface
interface OrderDetails {
  id: number;
  queue_number: string;
  status: "queued" | "preparing" | "ready" | "completed";
  order_type: "dine-in" | "take-out";
  total_amount: number | string;
  created_at: string;
  payment_method: string;
  items: { name: string; quantity: number; price: number | string }[];
}

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // 1. Get Order ID: Prioritize State (Checkout), fallback to URL (QR Scan)
  const orderId = location.state?.orderId || searchParams.get("id");

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Check if viewing on mobile (via QR link)
  const isMobileView = !location.state?.orderId && !!searchParams.get("id");

  useEffect(() => {
    // Safety Check: If no ID, redirect home after a delay
    if (!orderId) {
      console.warn("No Order ID found. Redirecting...");
      const timer = setTimeout(() => navigate("/"), 3000);
      return () => clearTimeout(timer);
    }

    const loadData = async () => {
      try {
        const data = await fetchOrderById(Number(orderId));
        if (data) {
          setOrder(data);
        } else {
          setError("Ticket not found in database.");
        }
      } catch (err) {
        console.error("Failed to load ticket:", err);
        setError("Connection failed. Could not load ticket.");
      } finally {
        // Ensure loading stops so the UI appears
        setLoading(false);
      }
    };

    // Initial Load
    loadData();

    // Listen for updates (e.g. Status changes)
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const socket = io(API_URL.replace("/api", ""));
    socket.on("orders_updated", () => loadData());

    return () => {
      socket.disconnect();
    };
  }, [orderId, navigate]);

  // --- 1. PROFESSIONAL LOADER ---
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden font-sans">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-900/20 via-zinc-950 to-zinc-950"></div>

        <div className="relative z-10 flex flex-col items-center">
          {/* Animated Icon Container */}
          <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center border-4 border-brand-yellow shadow-2xl shadow-yellow-500/20 animate-bounce">
            <Receipt size={48} className="text-brand-yellow" />
          </div>

          <h2 className="mt-8 text-2xl font-black text-white uppercase tracking-widest">
            Generating Ticket
          </h2>

          {/* Custom Dots Animation */}
          <div className="mt-4 flex gap-2">
            <span className="w-3 h-3 bg-brand-yellow rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-3 h-3 bg-brand-yellow rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-3 h-3 bg-brand-yellow rounded-full animate-bounce"></span>
          </div>

          <p className="mt-6 text-zinc-500 text-xs font-bold uppercase tracking-[0.2em]">
            Please wait a moment...
          </p>
        </div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error || !order) {
    return (
      <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="bg-red-500/10 p-6 rounded-full mb-6">
          <AlertCircle className="text-red-500" size={64} />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight">
          Ticket Error
        </h1>
        <p className="text-gray-400 mb-8 mt-2 max-w-xs mx-auto">
          {error || "We couldn't locate your order details."}
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
        >
          Return to Menu
        </button>
      </div>
    );
  }

  // Calculations
  const safeTotal = Number(order.total_amount) || 0;
  const subtotal = safeTotal / 1.12;
  const vat = safeTotal - subtotal;
  const isPaid = order.payment_method !== "counter";

  // --- MAIN RECEIPT UI ---
  return (
    <div className="min-h-screen bg-zinc-900 font-sans py-8 px-4 flex flex-col items-center justify-center relative overflow-hidden animate-in fade-in zoom-in duration-500">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 transform -rotate-12">
          <Utensils size={150} className="text-white" />
        </div>
        <div className="absolute bottom-20 right-10 transform rotate-12">
          <ShoppingBag size={150} className="text-white" />
        </div>
        {/* Central Glow */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-red rounded-full blur-[120px] opacity-20"></div>
      </div>

      {/* PRINT STYLES */}
      <style>{`
        @media print {
            @page { margin: 0; size: 80mm auto; }
            body * { visibility: hidden; }
            #receipt-container, #receipt-container * { visibility: visible; }
            #receipt-container { 
                position: absolute; left: 0; top: 0; width: 100%; 
                margin: 0; padding: 0; background: white; color: black;
                box-shadow: none;
            }
            .no-print { display: none !important; }
            .zigzag-bottom { display: none; }
        }
      `}</style>

      {/* --- RECEIPT CARD --- */}
      <div
        id="receipt-container"
        className="relative w-full max-w-sm z-10 drop-shadow-2xl"
      >
        {/* Main Paper Body */}
        <div className="bg-white text-gray-900 relative">
          {/* Top Border Accent */}
          <div className="h-2 bg-gradient-to-r from-red-600 via-yellow-400 to-red-600 w-full"></div>

          {/* HEADER */}
          <div className="p-8 text-center pb-6">
            {/* UPDATED LOGO SECTION */}
            <div className="flex justify-center mb-4">
              <img
                src="/jolibee.jpg"
                alt="Jollibee"
                className="h-24 w-auto object-contain"
                onError={(e) => {
                  // Fallback to a remote URL if local file is missing
                  e.currentTarget.src =
                    "https://upload.wikimedia.org/wikipedia/en/thumb/8/84/Jollibee_2011_logo.svg/1200px-Jollibee_2011_logo.svg.png";
                }}
              />
            </div>

            {/* I removed the <h1> text since the logo image likely contains the text. 
                If you want the text back, uncomment the lines below: */}
            {/* <h1 className="text-3xl font-black tracking-tight uppercase mb-1 text-red-600">
              Jollibee
            </h1> */}

            <div className="flex flex-col gap-1 text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">
              <span className="flex items-center justify-center gap-1">
                <MapPin size={10} /> Masterson Ave, Cagayan de Oro City
              </span>
              <span className="flex items-center justify-center gap-1">
                <Clock size={10} />{" "}
                {new Date(order.created_at).toLocaleString()}
              </span>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="flex items-center justify-between px-6 opacity-20">
            <div className="w-2 h-4 bg-black rounded-r-full"></div>
            <div className="flex-1 border-b-2 border-dashed border-black mx-2"></div>
            <div className="w-2 h-4 bg-black rounded-l-full"></div>
          </div>

          {/* QUEUE NUMBER */}
          <div className="p-6 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
              Queue Number
            </p>
            <div className="text-6xl font-black text-brand-dark tracking-tighter leading-none mb-4">
              {order.queue_number}
            </div>

            {/* Status Badges */}
            <div className="flex justify-center gap-2">
              <span
                className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border flex items-center gap-1 shadow-sm
                        ${order.order_type === "take-out" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-red-50 text-red-700 border-red-200"}`}
              >
                {order.order_type === "take-out" ? (
                  <ShoppingBag size={12} />
                ) : (
                  <Utensils size={12} />
                )}
                {order.order_type}
              </span>
              <span
                className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border flex items-center gap-1 shadow-sm
                        ${isPaid ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"}`}
              >
                {order.payment_method === "card" ? (
                  <CreditCard size={12} />
                ) : (
                  <Banknote size={12} />
                )}
                {isPaid ? "PAID" : "PAY AT COUNTER"}
              </span>
            </div>
          </div>

          {/* ORDER LIST */}
          <div className="px-8 pb-4">
            <div className="border-t-2 border-dashed border-gray-100 py-4 space-y-3">
              {order.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between text-sm items-start"
                >
                  <div className="flex gap-3">
                    <span className="font-bold text-gray-400 w-4">
                      {item.quantity}x
                    </span>
                    <span className="font-bold text-gray-800 uppercase">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-mono font-medium text-gray-600">
                    {(Number(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* FINANCIALS */}
          <div className="bg-gray-50 px-8 py-6">
            <div className="space-y-1 mb-4">
              <div className="flex justify-between text-xs text-gray-500 font-medium">
                <span>Subtotal</span>
                <span className="font-mono">{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 font-medium">
                <span>VAT (12%)</span>
                <span className="font-mono">{vat.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between text-xl font-black text-brand-dark pt-4 border-t border-gray-200">
              <span>TOTAL</span>
              <span>P {safeTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* FOOTER MESSAGE */}
          <div className="p-6 text-center text-xs text-gray-400 font-medium leading-relaxed pb-8">
            {isPaid
              ? "Sit tight! We're preparing your meal."
              : "Please present this ticket to the cashier."}
            <br />
            <span className="opacity-50 mt-2 block">
              ID: #{order.id} • BeeLine Systems
            </span>
          </div>
        </div>

        {/* ZIGZAG BOTTOM (Paper Tear Effect) */}
        <div
          className="w-full h-4 bg-white relative zigzag-bottom no-print"
          style={{
            background:
              "linear-gradient(45deg, transparent 33.333%, #ffffff 33.333%, #ffffff 66.667%, transparent 66.667%), linear-gradient(-45deg, transparent 33.333%, #ffffff 33.333%, #ffffff 66.667%, transparent 66.667%)",
            backgroundSize: "20px 40px",
            backgroundPosition: "0 -20px",
          }}
        ></div>
      </div>

      {/* --- ACTIONS --- */}
      <div className="w-full max-w-sm mt-8 space-y-3 no-print z-20">
        {!isMobileView && (
          <button
            onClick={() => window.print()}
            className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/20 transition-all"
          >
            <Printer size={18} /> Print Receipt
          </button>
        )}

        <button
          onClick={() => navigate("/")}
          className="w-full bg-brand-yellow text-brand-dark font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-yellow-400 hover:scale-[1.02] transition-all shadow-lg shadow-yellow-500/20"
        >
          <Home size={18} /> {isMobileView ? "Close Ticket" : "Start New Order"}{" "}
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
