import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  ChefHat,
  Clock,
  ArrowRight,
  Printer,
  ShoppingBag,
  Utensils,
} from "lucide-react";
import { io } from "socket.io-client";
import { fetchOrderById } from "../services/api";

// Define the Order Interface locally
interface OrderDetails {
  id: number;
  queue_number: string;
  status: "queued" | "preparing" | "ready" | "completed";
  order_type: string;
  total_amount: number;
  created_at: string;
  payment_method: string;
  items: { name: string; quantity: number; price: number }[];
}

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = location.state || {};

  const [order, setOrder] = useState<OrderDetails | null>(null);

  useEffect(() => {
    if (!orderId) {
      navigate("/");
      return;
    }

    const loadData = async () => {
      try {
        const data = await fetchOrderById(orderId);
        setOrder(data);
      } catch (error) {
        console.error("Failed to load order");
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

  if (!order) return null;

  // Status Steps
  const steps = [
    { id: "queued", label: "Order Placed", icon: Clock },
    { id: "preparing", label: "Kitchen Working", icon: ChefHat },
    { id: "ready", label: "Ready to Serve", icon: CheckCircle },
  ];
  const currentStepIndex = steps.findIndex((s) => s.id === order.status);

  // Financial Calculations for Receipt
  const subtotal = order.total_amount / 1.12;
  const vat = order.total_amount - subtotal;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
      {/* --- PRINT STYLES (Thermal Printer Optimized) --- */}
      <style>{`
        @media print {
          @page { margin: 0; size: 80mm auto; } /* Standard Thermal Paper Width */
          body * { visibility: hidden; }
          #receipt, #receipt * { visibility: visible; }
          #receipt { 
            position: absolute; left: 0; top: 0; width: 100%; 
            padding: 15px; font-family: 'Courier New', monospace; 
            color: black; background: white;
          }
          .no-print { display: none !important; }
          button { display: none !important; }
        }
      `}</style>

      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden text-center relative">
        {/* --- RECEIPT SECTION --- */}
        <div id="receipt">
          {/* 1. Business Header */}
          <div className="hidden print:block text-center mb-4">
            <h2 className="text-xl font-black uppercase tracking-widest">
              BEELINE FOODS
            </h2>
            <p className="text-[10px]">123 Ayala Ave, Makati City</p>
            <p className="text-[10px]">VAT Reg TIN: 123-456-789-000</p>
            <p className="text-[10px] mt-1">
              {new Date(order.created_at).toLocaleDateString()}{" "}
              {new Date(order.created_at).toLocaleTimeString()}
            </p>
            <div className="border-b-2 border-dashed border-black my-2"></div>
          </div>

          {/* Screen UI Header (Not for Print) */}
          <div className="p-8 no-print">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-black text-brand-dark mb-2">
              Order Confirmed!
            </h1>
            <p className="text-gray-500 mb-6">
              Sit tight! We'll call your number.
            </p>
          </div>

          {/* Queue Number */}
          <div className="bg-gray-100 rounded-2xl p-6 mx-6 mb-8 border border-gray-200 print:border-0 print:bg-transparent print:p-0 print:m-0 print:mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 print:text-black print:text-center">
              Queue Number
            </p>
            <div className="text-6xl font-black text-brand-dark tracking-tighter print:text-6xl print:text-center print:my-2">
              {order.queue_number}
            </div>

            <div className="mt-2 flex justify-center gap-2 print:justify-center">
              <span className="text-xs font-bold uppercase border px-2 py-1 rounded print:border-black">
                {order.order_type}
              </span>
              <span className="text-xs font-bold uppercase border px-2 py-1 rounded print:border-black">
                {order.payment_method}
              </span>
            </div>
          </div>

          {/* 2. Itemized List (Hidden on Screen, Visible on Print) */}
          <div className="hidden print:block text-xs text-left w-full mb-4">
            <div className="flex justify-between font-bold border-b border-black pb-1 mb-2">
              <span>Item</span>
              <span>Amt</span>
            </div>
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between mb-1">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span>{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-b-2 border-dashed border-black my-2"></div>

            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT (12%)</span>
              <span>{vat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-2">
              <span>TOTAL</span>
              <span>P {order.total_amount.toFixed(2)}</span>
            </div>
          </div>

          {/* 3. Footer */}
          <div className="hidden print:block text-center text-[10px] mt-6">
            <p>Order ID: #{order.id}</p>
            <p className="mt-2 font-bold">THANK YOU FOR DINING WITH US!</p>
            <p>Wifi: BeeLineGuest / Pass: yummybee</p>
          </div>
        </div>

        {/* --- TRACKER UI (Screen Only) --- */}
        <div className="px-8 pb-8 space-y-6 text-left no-print">
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

        {/* --- BUTTONS --- */}
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
      </div>
    </div>
  );
};

export default OrderSuccessPage;
