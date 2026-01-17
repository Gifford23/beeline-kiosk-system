import React, { useState, useEffect } from "react";
import {
  ChefHat,
  LogOut,
  Clock,
  CheckCircle,
  AlertCircle,
  Flame,
  Loader2,
  Utensils,
  ShoppingBag,
  CreditCard,
  Banknote,
  Volume2,
  RefreshCw, // Added Refresh Icon
} from "lucide-react";
import { fetchKitchenOrders, updateStatus } from "../services/api";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import toast from "react-hot-toast"; // Recommend installing react-hot-toast if not present

interface Order {
  id: number;
  queue_number: string;
  status: "queued" | "preparing" | "ready";
  items: { name: string; quantity: number }[];
  created_at: string;
  order_type: "dine-in" | "take-out";
  payment_status: "paid" | "pending";
  payment_method: "card" | "cash";
}

const KitchenPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [currentTime, setCurrentTime] = useState(new Date());

  // New State for Visual Alert
  const [isNewOrderAlert, setIsNewOrderAlert] = useState(false);

  // --- AUTH CHECK & LOAD ---
  const loadOrders = async () => {
    try {
      const data = await fetchKitchenOrders();
      setOrders(data);
    } catch (error: any) {
      console.error("Connection failed", error);

      // If the backend says "Unauthorized" (401/403), force logout
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        toast.error("Session expired. Please login again.");
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio(
      "https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3"
    );
    audio.volume = 1.0;
    audio
      .play()
      .catch((e) =>
        console.log("Audio play blocked (user must interact first)", e)
      );
  };

  useEffect(() => {
    // 1. Security Check on Mount
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    loadOrders();

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const SOCKET_URL = API_URL.replace("/api", ""); // Result: http://localhost:5000

    // Connect to Socket
    const socket = io(SOCKET_URL, {
      transports: ["websocket"], // Force websocket for better performance
      reconnection: true,
    });

    socket.on("connect", () => {
      console.log("🟢 Kitchen connected to live updates");
    });

    socket.on("orders_updated", () => {
      console.log("🔔 New Order Received!");
      playNotificationSound();

      // Flash Effect
      setIsNewOrderAlert(true);
      setTimeout(() => setIsNewOrderAlert(false), 800);

      // Refresh Data
      loadOrders();
    });

    const timerInterval = setInterval(() => setCurrentTime(new Date()), 60000);

    return () => {
      socket.disconnect();
      clearInterval(timerInterval);
    };
  }, [navigate]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    // Optimistic Update (Update UI immediately)
    if (newStatus === "completed") {
      setOrders(orders.filter((o) => o.id !== id));
    } else {
      setOrders(
        orders.map((o) =>
          o.id === id ? { ...o, status: newStatus as any } : o
        )
      );
    }

    try {
      await updateStatus(id, newStatus);
    } catch (error) {
      toast.error("Failed to update status");
      loadOrders(); // Revert on failure
    }
  };

  const handleLogout = () => {
    // CRITICAL: Remove the token so the Interceptor stops sending bad data
    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const getElapsedMinutes = (dateString: string) => {
    const created = new Date(dateString);
    const diff = currentTime.getTime() - created.getTime();
    return Math.floor(diff / 60000);
  };

  const filteredOrders =
    activeFilter === "all"
      ? orders
      : orders.filter((o) => o.status === activeFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 size={20} className="animate-spin" />
          <span className="font-bold tracking-widest uppercase text-sm">
            Syncing Kitchen...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col transition-all duration-300 ${isNewOrderAlert ? "ring-8 ring-inset ring-brand-yellow" : ""}`}
    >
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 shadow-md z-10 sticky top-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div
              className={`p-2 rounded-lg text-brand-dark shadow-lg transition-colors ${isNewOrderAlert ? "bg-white scale-110" : "bg-brand-yellow shadow-yellow-500/20"}`}
            >
              <ChefHat size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">
                KITCHEN DISPLAY
              </h1>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Real-Time • {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            {/* Manual Refresh Button */}
            <button
              onClick={loadOrders}
              className="flex items-center gap-2 bg-gray-700 text-gray-300 px-3 py-2 rounded-lg text-xs font-bold hover:bg-gray-600 hover:text-white transition-colors"
              title="Force Refresh"
            >
              <RefreshCw size={14} /> Refresh
            </button>

            <button
              onClick={playNotificationSound}
              className="hidden md:flex items-center gap-2 bg-gray-700 text-gray-300 px-3 py-2 rounded-lg text-xs font-bold hover:bg-gray-600"
              title="Test Audio"
            >
              <Volume2 size={14} /> Test Sound
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-900/30 text-red-400 border border-red-900/50 hover:bg-red-900/50 px-4 py-2 rounded-lg transition-all font-bold text-sm"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 mt-6 overflow-x-auto pb-1">
          {["all", "queued", "preparing", "ready"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all border
                    ${
                      activeFilter === filter
                        ? "bg-white text-gray-900 border-white shadow-lg shadow-white/10 scale-105"
                        : "bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-500 hover:text-gray-300"
                    }`}
            >
              {filter} (
              {
                orders.filter((o) =>
                  filter === "all" ? true : o.status === filter
                ).length
              }
              )
            </button>
          ))}
        </div>
      </header>

      {/* Orders Grid */}
      <div className="flex-1 p-6 overflow-y-auto bg-gray-900">
        {filteredOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
            <div className="bg-gray-800 p-6 rounded-full">
              <ChefHat size={64} className="opacity-20" />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-500">
                No active tickets
              </p>
              <p className="text-sm text-gray-600">
                The kitchen is clear. Standing by...
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredOrders.map((order) => {
              const elapsed = getElapsedMinutes(order.created_at);
              const isUrgent = elapsed > 15;
              const isTakeOut = order.order_type === "take-out";
              const isPaid = order.payment_status === "paid";

              return (
                <div
                  key={order.id}
                  className={`flex flex-col rounded-xl overflow-hidden shadow-lg border-t-4 bg-gray-800 transition-all hover:translate-y-[-2px] hover:shadow-xl
                    ${
                      order.status === "queued"
                        ? "border-red-500 shadow-red-900/10"
                        : ""
                    }
                    ${
                      order.status === "preparing"
                        ? "border-yellow-500 shadow-yellow-900/10"
                        : ""
                    }
                    ${
                      order.status === "ready"
                        ? "border-green-500 shadow-green-900/10"
                        : ""
                    }
                    `}
                >
                  {/* Card Header */}
                  <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-700 flex justify-between items-start">
                    <div>
                      <h2 className="text-4xl font-black text-white leading-none tracking-tighter">
                        {order.queue_number}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">
                          #{order.id.toString().padStart(4, "0")}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {/* Payment Badge */}
                      <div
                        className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          isPaid
                            ? "bg-green-900/30 text-green-400 border-green-900/50"
                            : "bg-red-900/30 text-red-400 border-red-900/50"
                        }`}
                      >
                        {order.payment_method === "card" ? (
                          <CreditCard size={10} />
                        ) : (
                          <Banknote size={10} />
                        )}
                        {isPaid ? "PAID" : "UNPAID"}
                      </div>

                      {/* Order Type Badge */}
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider
                                ${
                                  isTakeOut
                                    ? "bg-yellow-500 text-black"
                                    : "bg-blue-600 text-white"
                                }`}
                      >
                        {isTakeOut ? (
                          <ShoppingBag size={10} />
                        ) : (
                          <Utensils size={10} />
                        )}
                        {isTakeOut ? "TO GO" : "DINE IN"}
                      </div>

                      {/* Timer */}
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold border
                                ${
                                  isUrgent
                                    ? "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse"
                                    : "bg-gray-700 text-gray-300 border-gray-600"
                                }
                            `}
                      >
                        <Clock size={12} />
                        <span>{elapsed}m</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex-1 space-y-3">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm group"
                      >
                        <span
                          className={`font-medium transition-colors ${
                            order.status === "ready"
                              ? "text-gray-500 line-through"
                              : "text-gray-300 group-hover:text-white"
                          }`}
                        >
                          {item.name}
                        </span>
                        <span className="bg-gray-700 text-white px-2.5 py-1 rounded-md text-sm font-bold min-w-[2rem] text-center shadow-sm">
                          {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Card Footer */}
                  <div className="p-3 bg-gray-800 border-t border-gray-700 mt-auto">
                    {order.status === "queued" && (
                      <button
                        onClick={() =>
                          handleStatusChange(order.id, "preparing")
                        }
                        className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-yellow-900/20"
                      >
                        <Flame size={18} /> Start Cooking
                      </button>
                    )}
                    {order.status === "preparing" && (
                      <button
                        onClick={() => handleStatusChange(order.id, "ready")}
                        className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-green-900/20"
                      >
                        <CheckCircle size={18} /> Mark Ready
                      </button>
                    )}
                    {order.status === "ready" && (
                      <button
                        onClick={() =>
                          handleStatusChange(order.id, "completed")
                        }
                        className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all hover:text-green-400"
                      >
                        <AlertCircle size={18} /> Clear Ticket
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default KitchenPage;
