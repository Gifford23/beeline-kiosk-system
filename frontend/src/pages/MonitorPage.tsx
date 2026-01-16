import React, { useState, useEffect } from "react";
import { fetchKitchenOrders } from "../services/api";
import { ChefHat, Clock, Bell } from "lucide-react";

interface Order {
  id: number;
  queue_number: string;
  status: "queued" | "preparing" | "ready" | "completed";
}

const MonitorPage = () => {
  const [preparing, setPreparing] = useState<Order[]>([]);
  const [ready, setReady] = useState<Order[]>([]);
  const [time, setTime] = useState(new Date());

  const loadOrders = async () => {
    try {
      const data: Order[] = await fetchKitchenOrders();

      // Filter: Preparing = Queued + Preparing
      const prepList = data.filter(
        (o) => o.status === "queued" || o.status === "preparing"
      );

      // Filter: Ready
      const readyList = data.filter((o) => o.status === "ready");

      setPreparing(prepList);
      setReady(readyList);
    } catch (err) {
      console.error("Monitor Update Failed", err);
    }
  };

  useEffect(() => {
    loadOrders();

    // 1. Refresh Orders every 3s
    const orderInterval = setInterval(loadOrders, 3000);

    // 2. Update Clock every 1s
    const clockInterval = setInterval(() => setTime(new Date()), 1000);

    return () => {
      clearInterval(orderInterval);
      clearInterval(clockInterval);
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col font-sans overflow-hidden">
      {/* 1. Top Header Bar */}
      <div className="bg-gray-900 border-b border-gray-800 px-8 py-4 flex justify-between items-center shadow-lg z-10">
        <div className="flex items-center gap-4">
          <div className="bg-brand-red p-3 rounded-lg shadow-lg shadow-red-900/50">
            <ChefHat size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wider uppercase text-white leading-none">
              Order Monitor
            </h1>
            <p className="text-gray-400 text-xs tracking-[0.2em] font-bold mt-1">
              NOW SERVING
            </p>
          </div>
        </div>

        {/* Live Clock */}
        <div className="text-right">
          <div className="text-3xl font-black text-white tabular-nums tracking-tight">
            {time.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">
            {time.toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* 2. Main Split Content */}
      <div className="flex-1 flex relative">
        {/* LEFT COLUMN: PREPARING (Darker, Subtle) */}
        <div className="w-1/2 bg-[#1a1a1a] border-r border-gray-800 flex flex-col relative overflow-hidden">
          {/* Column Header */}
          <div className="bg-gray-800/50 p-6 flex items-center justify-center gap-3 border-b border-gray-700">
            <Clock className="text-yellow-500 animate-pulse" size={28} />
            <h2 className="text-3xl font-black uppercase tracking-widest text-yellow-500">
              Preparing
            </h2>
          </div>

          {/* Grid Content */}
          <div className="p-8 flex-1 overflow-hidden">
            {preparing.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-700 space-y-4">
                <Clock size={64} className="opacity-20" />
                <p className="text-xl font-bold uppercase tracking-widest opacity-50">
                  No orders cooking
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-6 auto-rows-min">
                {preparing.map((order) => (
                  <div
                    key={order.id}
                    className="bg-gray-800/50 rounded-xl py-4 text-center border border-gray-700/50 shadow-inner"
                  >
                    <span className="text-4xl font-bold text-gray-400 tracking-tighter">
                      {order.queue_number}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-900/5 to-transparent pointer-events-none"></div>
        </div>

        {/* RIGHT COLUMN: READY (Bright, Attention-Grabbing) */}
        <div className="w-1/2 bg-green-900/20 flex flex-col relative overflow-hidden">
          {/* Column Header */}
          <div className="bg-green-800 p-6 flex items-center justify-center gap-3 shadow-lg z-10">
            <Bell className="text-white animate-bounce" size={28} />
            <h2 className="text-3xl font-black uppercase tracking-widest text-white">
              ORDER READY
            </h2>
          </div>

          {/* Content */}
          <div className="p-8 flex-1 overflow-hidden">
            {ready.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-green-800/30 space-y-4">
                <ChefHat size={64} className="opacity-20" />
                <p className="text-xl font-bold uppercase tracking-widest opacity-50">
                  Wait for your number
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6 content-start">
                {ready.map((order) => (
                  <div
                    key={order.id}
                    className="bg-green-600 rounded-2xl py-8 text-center shadow-[0_0_40px_-10px_rgba(22,163,74,0.5)] border-4 border-green-400 animate-in zoom-in duration-300"
                  >
                    <span className="text-7xl font-black text-white drop-shadow-md tracking-tighter">
                      {order.queue_number}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Background Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-500/10 via-transparent to-transparent pointer-events-none"></div>
        </div>
      </div>

      {/* 3. Footer Ticker (Marquee) */}
      <div className="bg-brand-red text-white py-3 overflow-hidden whitespace-nowrap relative z-20 shadow-2xl">
        <div className="animate-marquee inline-block text-lg font-bold uppercase tracking-wider">
          Please present your receipt to the counter when collecting your order.
          • Thank you for dining with us! • Follow us on social media for
          promos! • Please present your receipt to the counter when collecting
          your order. • Thank you for dining with us! • Follow us on social
          media for promos! •
        </div>
      </div>

      {/* 4. Marquee Animation Styles (Injecting into style tag for simplicity) */}
      <style>{`
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .animate-marquee {
            animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default MonitorPage;
