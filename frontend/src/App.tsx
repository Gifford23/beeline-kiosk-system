import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // 1. Import Toaster
import LandingPage from "./pages/LandingPage";
import MenuPage from "./pages/MenuPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import KitchenPage from "./pages/KitchenPage";
import MonitorPage from "./pages/MonitorPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <div className="antialiased text-brand-dark font-sans">
      {/* 2. Add Toaster Provider here (Top Center is best for kiosks) */}
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/success" element={<OrderSuccessPage />} />
        <Route path="/monitor" element={<MonitorPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Kitchen Route */}
        <Route
          path="/kitchen"
          element={
            <ProtectedRoute role="kitchen">
              <KitchenPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
