import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, ChefHat, ArrowRight, Loader2 } from "lucide-react";
import { loginUser } from "../services/api";
import toast from "react-hot-toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await loginUser({ username, password });

      // --- CRITICAL FIX: SAVE THE TOKEN ---
      // This "Key" allows the Kitchen page to verify who you are.
      // Without this, you get the 401 Error.
      localStorage.setItem("token", data.token);
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("isAuthenticated", "true");

      toast.success(`Welcome back, ${data.username}!`);

      // Redirect based on role
      if (data.role === "admin") {
        navigate("/admin"); // Matches your App.tsx route
      } else {
        navigate("/kitchen");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      // Show error from backend or a default message
      toast.error(error.response?.data?.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-red via-brand-yellow to-brand-red"></div>
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-brand-red/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-brand-yellow/5 blur-[100px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md bg-zinc-800/50 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-zinc-700/50 rounded-2xl mb-6 shadow-inner border border-white/5">
            <ChefHat size={40} className="text-brand-yellow" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">
            Staff Access
          </h1>
          <p className="text-zinc-400 text-sm">
            Enter your credentials to access the system
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User
                  size={20}
                  className="text-zinc-500 group-focus-within:text-brand-yellow transition-colors"
                />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-700 text-white rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow transition-all placeholder:text-zinc-600 font-medium"
                placeholder="Username"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock
                  size={20}
                  className="text-zinc-500 group-focus-within:text-brand-yellow transition-colors"
                />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-700 text-white rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow transition-all placeholder:text-zinc-600 font-medium"
                placeholder="Password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-yellow hover:bg-yellow-400 text-brand-dark font-black py-4 rounded-xl shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                VERIFYING...
              </>
            ) : (
              <>
                LOGIN <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
      </div>

      <p className="mt-8 text-zinc-500 text-xs font-bold uppercase tracking-widest opacity-50">
        BeeLine Kiosk OS • Restricted Access
      </p>
    </div>
  );
};

export default LoginPage;
