import React, { useState, useEffect } from "react";
import {
  Trash2,
  Plus,
  LayoutDashboard,
  LogOut,
  TrendingUp,
  DollarSign,
  Smartphone,
  Eye,
  EyeOff,
  Clock,
  CheckCircle,
  AlertCircle,
  Receipt,
  Utensils,
  Calendar, // New Icon
  Filter, // New Icon
} from "lucide-react";
import QRCode from "react-qr-code";
import {
  fetchMenu,
  addMenuItem,
  deleteMenuItem,
  toggleItemStatus,
  fetchStats,
  fetchTransactions,
} from "../services/api";
import { useNavigate } from "react-router-dom";

const AdminPage = () => {
  const navigate = useNavigate();

  // --- View State ---
  const [activeTab, setActiveTab] = useState<"dashboard" | "menu">("dashboard");
  const [timeFilter, setTimeFilter] = useState("today"); // 1. New Filter State

  // --- Data State ---
  const [items, setItems] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    revenue: 0,
    totalOrders: 0,
    completedOrders: 0,
    activeOrders: 0,
  });

  // --- UI State ---
  const [showQRGenerator, setShowQRGenerator] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    category: "Chicken",
    description: "",
    image_url: "",
  });

  // --- Data Loading ---
  const loadData = async () => {
    try {
      // 2. Pass timeFilter to fetchStats
      const [menuData, statsData, historyData] = await Promise.all([
        fetchMenu(),
        fetchStats(timeFilter),
        fetchTransactions(),
      ]);

      setItems(menuData);
      setStats(statsData);
      setTransactions(historyData);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    }
  };

  // 3. Reload when timeFilter changes
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [timeFilter]); // Dependency added here

  // ... (Keep handleLogout, handleToggleStatus, handleDelete, handleAdd functions exactly as they were) ...
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const handleToggleStatus = async (id: number) => {
    await toggleItemStatus(id);
    loadData();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteMenuItem(id);
        loadData();
      } catch (error) {
        alert("Cannot delete item. Mark it as 'Unavailable' instead.");
      }
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addMenuItem(newItem);
    setNewItem({
      name: "",
      price: "",
      category: "Chicken",
      description: "",
      image_url: "",
    });
    loadData();
    alert("Item Added!");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-brand-dark">
      {/* Global Navbar */}
      <nav className="bg-brand-dark text-white px-6 py-4 shadow-xl sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-brand-red p-2 rounded-xl shadow-lg shadow-red-900/50">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Manager Portal</h1>
            <p className="text-xs text-gray-400 font-medium">
              Enterprise Dashboard
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-all border border-gray-700"
        >
          <LogOut size={16} /> Logout
        </button>
      </nav>

      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Tab Navigation & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 border-b border-gray-200 pb-1 gap-4">
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-t-xl transition-all
                    ${
                      activeTab === "dashboard"
                        ? "bg-white text-brand-red border-b-4 border-brand-red shadow-sm"
                        : "text-gray-500 hover:text-brand-dark hover:bg-gray-100"
                    }`}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button
              onClick={() => setActiveTab("menu")}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-t-xl transition-all
                    ${
                      activeTab === "menu"
                        ? "bg-white text-brand-red border-b-4 border-brand-red shadow-sm"
                        : "text-gray-500 hover:text-brand-dark hover:bg-gray-100"
                    }`}
            >
              <Utensils size={18} /> Menu Management
            </button>
          </div>

          {/* 4. Date Filter Dropdown (Only visible on Dashboard) */}
          {activeTab === "dashboard" && (
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200">
              <Filter size={16} className="text-gray-400" />
              <span className="text-xs font-bold text-gray-500 uppercase">
                Filter:
              </span>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="bg-transparent text-sm font-bold text-brand-dark outline-none cursor-pointer"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Time</option>
              </select>
            </div>
          )}
        </div>

        {/* Content Area */}
        {activeTab === "dashboard" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="Active Orders"
                value={stats.activeOrders}
                icon={<Clock className="text-brand-red" size={24} />}
                borderColor="border-brand-red"
                filter={timeFilter}
              />
              <StatCard
                title={`Total Revenue (${timeFilter})`} // Update title dynamically
                value={`₱${Number(stats.revenue).toLocaleString()}`}
                icon={<DollarSign className="text-green-600" size={24} />}
                borderColor="border-green-500"
                filter={timeFilter}
              />
              <StatCard
                title={`Completed (${timeFilter})`}
                value={stats.completedOrders}
                icon={<TrendingUp className="text-blue-500" size={24} />}
                borderColor="border-blue-500"
                filter={timeFilter}
              />
            </div>

            {/* Transaction Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Receipt className="text-gray-400" size={20} />
                  <h3 className="font-bold text-lg text-gray-800">
                    Recent Transactions
                  </h3>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-white px-3 py-1.5 rounded-md border border-gray-100 shadow-sm">
                    Live Feed
                  </span>
                </div>
              </div>

              {/* Table logic remains the same... */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-400">
                    <tr>
                      <th className="px-6 py-4">Queue</th>
                      <th className="px-6 py-4">Time</th>
                      <th className="px-6 py-4">Items</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-black text-brand-dark">
                          {order.queue_number}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-700">
                            {new Date(order.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className="max-w-[250px] truncate text-gray-500"
                            title={order.items
                              .map((i: any) => `${i.quantity}x ${i.name}`)
                              .join(", ")}
                          >
                            {order.items
                              .map((i: any) => `${i.quantity}x ${i.name}`)
                              .join(", ")}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-brand-red">
                          ₱{order.total_amount}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={order.status} />
                        </td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-8 text-center text-gray-400"
                        >
                          No transactions yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* === MENU MANAGEMENT TAB (Same as before) === */}
        {activeTab === "menu" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Left Column: Inventory List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Utensils className="text-brand-dark" size={24} /> Current
                  Inventory
                </h2>
                <span className="text-sm text-gray-500 font-medium">
                  {items.length} Items Listed
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onToggle={() => handleToggleStatus(item.id)}
                    onDelete={() => handleDelete(item.id)}
                  />
                ))}
              </div>
            </div>

            {/* Right Column: Tools */}
            <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
              {/* QR Tools */}
              <button
                onClick={() => setShowQRGenerator(!showQRGenerator)}
                className="w-full bg-brand-yellow text-brand-dark px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-yellow-200 hover:bg-yellow-400 transition-all active:scale-95"
              >
                <Smartphone size={20} />
                {showQRGenerator ? "Hide QR Codes" : "Generate Table QRs"}
              </button>

              {showQRGenerator && (
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 animate-in fade-in slide-in-from-top-4">
                  <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <Smartphone className="text-brand-red" size={18} />{" "}
                    Printable Codes
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        className="flex flex-col items-center bg-gray-50 p-2 rounded-lg border border-dashed border-gray-300"
                      >
                        <div className="bg-white p-1 mb-1">
                          <QRCode
                            value={`https://app.com?table=${n}`}
                            size={60}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">
                          Table {n}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Item Form */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h2 className="text-lg font-bold mb-6 text-gray-800 flex items-center gap-2">
                  <Plus className="bg-brand-dark text-white rounded-md p-1" />{" "}
                  Add New Item
                </h2>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">
                      Product Name
                    </label>
                    <input
                      placeholder="e.g. Spicy Chickenjoy"
                      required
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-brand-red outline-none transition-all"
                      value={newItem.name}
                      onChange={(e) =>
                        setNewItem({ ...newItem, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1">
                        Price
                      </label>
                      <input
                        placeholder="0.00"
                        type="number"
                        required
                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-brand-red outline-none transition-all"
                        value={newItem.price}
                        onChange={(e) =>
                          setNewItem({ ...newItem, price: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase ml-1">
                        Category
                      </label>
                      <select
                        className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-brand-red outline-none transition-all"
                        value={newItem.category}
                        onChange={(e) =>
                          setNewItem({ ...newItem, category: e.target.value })
                        }
                      >
                        <option value="Chicken">Chicken</option>
                        <option value="Burgers">Burgers</option>
                        <option value="Spaghetti">Spaghetti</option>
                        <option value="Drinks">Drinks</option>
                        <option value="Fries">Fries</option>
                        <option value="Sides">Sides</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">
                      Description
                    </label>
                    <textarea
                      placeholder="Describe the taste..."
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-brand-red outline-none transition-all h-24 resize-none"
                      value={newItem.description}
                      onChange={(e) =>
                        setNewItem({ ...newItem, description: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">
                      Image Link
                    </label>
                    <input
                      placeholder="https://..."
                      className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-brand-red outline-none transition-all"
                      value={newItem.image_url}
                      onChange={(e) =>
                        setNewItem({ ...newItem, image_url: e.target.value })
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-brand-dark text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
                  >
                    <Plus size={20} /> Publish to Menu
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Sub-Components ---

const StatCard = ({ title, value, icon, borderColor }: any) => (
  <div
    className={`bg-white p-6 rounded-2xl shadow-sm border-l-4 ${borderColor} flex items-center justify-between transition-hover hover:shadow-md`}
  >
    <div>
      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
        {title}
      </p>
      <h2 className="text-3xl font-black text-brand-dark">{value}</h2>
    </div>
    <div className="bg-gray-50 p-3 rounded-xl">{icon}</div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    completed: "bg-green-100 text-green-700",
    ready: "bg-blue-100 text-blue-700",
    preparing: "bg-yellow-100 text-yellow-700",
    queued: "bg-gray-100 text-gray-600",
  };

  const icons: any = {
    completed: <CheckCircle size={12} />,
    ready: <AlertCircle size={12} />,
    preparing: <Clock size={12} />,
    queued: <Clock size={12} />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
        styles[status] || styles.queued
      }`}
    >
      {icons[status]}
      {status}
    </span>
  );
};

const MenuItemCard = ({ item, onToggle, onDelete }: any) => (
  <div
    className={`p-4 rounded-xl shadow-sm border flex items-center gap-4 transition-all bg-white
    ${item.is_available ? "border-gray-100" : "border-gray-200 bg-gray-50"}`}
  >
    <div className="relative w-20 h-20 flex-shrink-0">
      <img
        src={item.image_url}
        className={`w-full h-full rounded-lg object-cover bg-gray-100 ${
          !item.is_available && "grayscale opacity-50"
        }`}
        alt={item.name}
      />
      {!item.is_available && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
            Sold Out
          </span>
        </div>
      )}
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-sm text-brand-dark truncate pr-2">
          {item.name}
        </h3>
        <span className="text-brand-red font-bold text-sm">₱{item.price}</span>
      </div>
      <p className="text-gray-400 text-xs mb-2">{item.category}</p>

      <div className="flex gap-2">
        <button
          onClick={onToggle}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors
          ${
            item.is_available
              ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
              : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
        >
          {item.is_available ? (
            <>
              <EyeOff size={12} /> Disable
            </>
          ) : (
            <>
              <Eye size={12} /> Enable
            </>
          )}
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  </div>
);

export default AdminPage;
