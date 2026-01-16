import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  ChefHat,
  Clock,
  ArrowRight,
  ShoppingBag,
  Utensils,
} from "lucide-react";
import { io } from "socket.io-client"; // Import Socket
import { fetchOrderById } from "../services/api"; // Import API

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get the Order ID passed from Checkout Page
  const { orderId } = location.state || {};

  const [status, setStatus] = useState<
    "queued" | "preparing" | "ready" | "completed"
  >("queued");
  const [queueNumber, setQueueNumber] = useState("...");
  const [orderType, setOrderType] = useState("");

  useEffect(() => {
    if (!orderId) {
      // If they refreshed and lost state, try to recover from localStorage or redirect
      navigate("/");
      return;
    }

    const loadStatus = async () => {
      try {
        const order = await fetchOrderById(orderId);
        setStatus(order.status);
        setQueueNumber(order.queue_number);
        setOrderType(order.order_type);
      } catch (error) {
        console.error("Failed to track order");
      }
    };

    loadStatus(); // Initial check

    // ⚡ REAL-TIME TRACKING
    const socket = io("http://localhost:5000");

    socket.on("orders_updated", () => {
      // When kitchen updates ANY order, we check ours
      loadStatus();
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId, navigate]);

  // Visual Steps logic
  const steps = [
    { id: "queued", label: "Order Placed", icon: Clock },
    { id: "preparing", label: "Kitchen Working", icon: ChefHat },
    { id: "ready", label: "Ready to Serve", icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === status);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden text-center relative">
        {/* Top Decoration */}
        <div
          className={`h-2 w-full ${
            status === "ready" ? "bg-green-500" : "bg-brand-red animate-pulse"
          }`}
        ></div>

        <div className="p-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-3xl font-black text-brand-dark mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-500 mb-6">
            Sit tight! We'll call your number.
          </p>

          <div className="bg-gray-100 rounded-2xl p-6 mb-8 border border-gray-200">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
              Your Queue Number
            </p>
            <div className="text-6xl font-black text-brand-dark tracking-tighter">
              {queueNumber}
            </div>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-xs font-bold shadow-sm">
              {orderType === "take-out" ? (
                <ShoppingBag size={12} />
              ) : (
                <Utensils size={12} />
              )}
              {orderType === "take-out" ? "TAKE OUT" : "DINE IN"}
            </div>
          </div>

          {/* LIVE TRACKER STEPS */}
          <div className="space-y-6 text-left">
            {steps.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-4 transition-all duration-500 ${
                    isCompleted ? "opacity-100" : "opacity-30"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
                                ${
                                  isCurrent
                                    ? "bg-brand-yellow scale-110 shadow-lg ring-4 ring-yellow-100"
                                    : isCompleted
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-200"
                                }`}
                  >
                    <step.icon
                      size={20}
                      className={
                        isCurrent ? "text-brand-dark animate-bounce" : ""
                      }
                    />
                  </div>
                  <div>
                    <h3
                      className={`font-bold ${
                        isCurrent ? "text-brand-dark text-lg" : "text-gray-600"
                      }`}
                    >
                      {step.label}
                    </h3>
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
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-100">
          <button
            onClick={() => navigate("/")}
            className="text-gray-400 text-sm font-bold flex items-center justify-center gap-2 hover:text-brand-dark transition-colors"
          >
            Start New Order <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
