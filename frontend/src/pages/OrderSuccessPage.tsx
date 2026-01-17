import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle,
  ChefHat,
  Clock,
  ArrowRight,
  Printer,
  Loader2,
  AlertCircle,
  Smartphone, // Icon for Digital Receipt
  QrCode, // Icon for QR
} from "lucide-react";
import { io } from "socket.io-client";
import { fetchOrderById } from "../services/api";

// Define the Order Interface
interface OrderDetails {
  id: number;
  queue_number: string;
  status: "queued" | "preparing" | "ready" | "completed";
  order_type: string;
  total_amount: number | string;
  created_at: string;
  payment_method: string;
  items: { name: string; quantity: number; price: number | string }[];
}

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 1. SMART ID RETRIEVAL:
  // Check 'location.state' (from Kiosk Checkout) OR 'URL params' (from Mobile QR Scan)
  const orderId = location.state?.orderId || searchParams.get("id");

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Determine if we are on Mobile (simple check) or Kiosk
  const isMobileView = !location.state?.orderId && !!searchParams.get("id");

  useEffect(() => {
    if (!orderId) {
      navigate("/");
      return;
    }

    const loadData = async () => {
      try {
        const data = await fetchOrderById(Number(orderId));
        setOrder(data);
      } catch (error) {
        console.error("Failed to load order", error);
        setError("Could not load order details.");
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Real-time socket
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const SOCKET_URL = API_URL.replace("/api", "");
    const socket = io(SOCKET_URL);

    socket.on("orders_updated", () => loadData());

    return () => {
      socket.disconnect();
    };
  }, [orderId, navigate]);

  // Loading & Error States
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 size={48} className="text-brand-yellow animate-spin mb-4" />
        <h2 className="text-xl font-bold text-gray-400">Loading Ticket...</h2>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Order Not Found</h2>
        <p className="text-gray-500 mb-6">{error || "Invalid Ticket ID"}</p>
        {!isMobileView && (
          <button
            onClick={() => navigate("/")}
            className="text-brand-dark font-bold underline"
          >
            Return to Home
          </button>
        )}
      </div>
    );
  }

  // --- CALCULATIONS ---
  const steps = [
    { id: "queued", label: "Order Placed", icon: Clock },
    { id: "preparing", label: "Kitchen Working", icon: ChefHat },
    { id: "ready", label: "Ready to Serve", icon: CheckCircle },
  ];
  const currentStepIndex = steps.findIndex((s) => s.id === order.status);
  const safeTotal = Number(order.total_amount) || 0;
  const subtotal = safeTotal / 1.12;
  const vat = safeTotal - subtotal;

  // --- QR CODE URL GENERATION ---
  // This generates a link to THIS page with the ?id= parameter
  const trackUrl = `${window.location.protocol}//${window.location.host}/order-success?id=${order.id}`;
  // Use a public API to generate the QR image (Google Charts or goqr.me)
  const qrCodeImage = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(trackUrl)}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
      {/* PRINT STYLES */}
      <style>{`
        @media print {
          @page { margin: 0; size: 80mm auto; }
          body * { visibility: hidden; }
          #receipt, #receipt * { visibility: visible; }
          #receipt { 
            position: absolute; left: 0; top: 0; width: 100%; 
            padding: 15px; font-family: 'Courier New', monospace; 
            color: black; background: white;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* --- MOBILE BANNER (Visible only if viewing on phone) --- */}
      {isMobileView && (
        <div className="w-full max-w-md bg-brand-dark text-white p-3 rounded-xl mb-4 text-center shadow-lg animate-in slide-in-from-top">
          <p className="text-sm font-bold flex items-center justify-center gap-2">
            <Smartphone size={16} /> Digital Receipt Active
          </p>
        </div>
      )}

      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden text-center relative">
        {/* --- RECEIPT CONTAINER --- */}
        <div id="receipt">
          {/* Print Header */}
          <div className="hidden print:block text-center mb-4">
            <h2 className="text-xl font-black uppercase tracking-widest">
              BEELINE FOODS
            </h2>
            <p className="text-[10px]">123 Ayala Ave, Makati City</p>
            <p className="text-[10px] mt-1">
              {new Date(order.created_at).toLocaleString()}
            </p>
            <div className="border-b-2 border-dashed border-black my-2"></div>
          </div>

          {/* Screen Header */}
          <div className="p-8 no-print bg-gradient-to-b from-green-50 to-white">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6 shadow-sm">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-black text-brand-dark mb-2">
              {isMobileView ? "Here's your Ticket!" : "Order Confirmed!"}
            </h1>
            <p className="text-gray-500 text-sm">
              {isMobileView
                ? "Show this to the counter."
                : "Sit tight! We'll call your number."}
            </p>
          </div>

          {/* QUEUE NUMBER CARD */}
          <div className="bg-gray-100 rounded-2xl p-6 mx-6 mb-8 border-2 border-dashed border-gray-300 print:border-0 print:p-0 print:m-0 print:mb-4 relative">
            {/* Cutout Circles decoration */}
            <div className="absolute top-1/2 -left-3 w-6 h-6 bg-white rounded-full no-print"></div>
            <div className="absolute top-1/2 -right-3 w-6 h-6 bg-white rounded-full no-print"></div>

            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 print:text-black print:text-center">
              Queue Number
            </p>
            <div className="text-6xl font-black text-brand-dark tracking-tighter print:text-6xl print:text-center print:my-2">
              {order.queue_number}
            </div>

            <div className="mt-2 flex justify-center gap-2 print:justify-center">
              <span className="text-xs font-bold uppercase bg-white border px-2 py-1 rounded print:border-black">
                {order.order_type}
              </span>
              <span className="text-xs font-bold uppercase bg-white border px-2 py-1 rounded print:border-black">
                {order.payment_method}
              </span>
            </div>
          </div>

          {/* --- DIGITAL RECEIPT QR (Kiosk Only) --- */}
          {!isMobileView && (
            <div className="no-print mx-6 mb-8 bg-blue-50 p-4 rounded-2xl flex items-center gap-4 text-left border border-blue-100">
              <div className="bg-white p-2 rounded-lg shadow-sm flex-shrink-0">
                <img
                  src={qrCodeImage}
                  alt="Scan for Receipt"
                  className="w-20 h-20"
                />
              </div>
              <div>
                <h3 className="font-bold text-brand-dark flex items-center gap-2">
                  <QrCode size={16} /> Digital Receipt
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Scan with your phone to save your queue number and receipt.
                </p>
              </div>
            </div>
          )}

          {/* ORDER DETAILS */}
          <div className="px-6 mb-4 text-xs text-left w-full print:px-0">
            <h3 className="font-bold text-gray-400 uppercase tracking-widest mb-3 print:hidden">
              Order Details
            </h3>

            <div className="space-y-2">
              {order.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between border-b border-dashed border-gray-200 pb-2 print:border-black"
                >
                  <span className="font-bold text-gray-700 print:text-black">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="text-gray-900 print:text-black font-medium">
                    {(Number(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-1 bg-gray-50 p-4 rounded-xl print:bg-transparent print:p-0">
              <div className="flex justify-between text-gray-500 print:text-black">
                <span>Subtotal</span>
                <span>{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500 print:text-black">
                <span>VAT (12%)</span>
                <span>{vat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-lg mt-2 text-brand-dark print:text-black border-t border-gray-200 pt-2 print:border-black">
                <span>TOTAL</span>
                <span>P {safeTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="hidden print:block text-center text-[10px] mt-6">
            <p>Order ID: #{order.id}</p>
            <p className="mt-2 font-bold">THANK YOU FOR DINING WITH US!</p>
          </div>
        </div>

        {/* --- TRACKER STEPS (Screen Only) --- */}
        <div className="px-8 pb-8 space-y-6 text-left no-print mt-6">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 transition-all ${isCompleted ? "opacity-100" : "opacity-30"}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${isCurrent ? "bg-brand-yellow scale-110 shadow-lg" : isCompleted ? "bg-green-500 text-white" : "bg-gray-200"}`}
                >
                  <step.icon
                    size={20}
                    className={
                      isCurrent ? "text-brand-dark animate-bounce" : ""
                    }
                  />
                </div>
                <div>
                  <h3 className="font-bold">{step.label}</h3>
                  {isCurrent && (
                    <p className="text-xs text-brand-red font-bold animate-pulse">
                      In Progress...
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* --- ACTION BUTTONS (Kiosk Only) --- */}
        {!isMobileView && (
          <div className="bg-gray-50 p-4 border-t border-gray-100 space-y-3 no-print">
            <button
              onClick={() => window.print()}
              className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg"
            >
              <Printer size={20} /> Print Receipt
            </button>
            <button
              onClick={() => navigate("/")}
              className="text-gray-400 text-sm font-bold flex items-center justify-center gap-2 hover:text-brand-dark transition-colors w-full"
            >
              Start New Order <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSuccessPage;
