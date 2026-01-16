import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ChefHat, LayoutDashboard } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "kitchen">("admin");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple Hardcoded Security for Demo
    if (role === "admin" && password === "admin123") {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", "admin");
      navigate("/admin");
    } else if (role === "kitchen" && password === "chef123") {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userRole", "kitchen");
      navigate("/kitchen");
    } else {
      setError("Invalid Password");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Staff Login</h1>
          <p className="text-gray-500 text-sm">Restricted Access Only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-4 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all
              ${
                role === "admin"
                  ? "bg-white shadow-sm text-brand-dark"
                  : "text-gray-400"
              }`}
            >
              <LayoutDashboard size={16} /> Admin
            </button>
            <button
              type="button"
              onClick={() => setRole("kitchen")}
              className={`flex items-center justify-center gap-2 py-2 rounded-md text-sm font-bold transition-all
              ${
                role === "kitchen"
                  ? "bg-white shadow-sm text-brand-dark"
                  : "text-gray-400"
              }`}
            >
              <ChefHat size={16} /> Kitchen
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all"
                placeholder="Enter access code"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center font-bold">
              {error}
            </p>
          )}

          <button className="w-full bg-brand-dark text-white font-bold py-4 rounded-xl hover:bg-black transition-colors">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
