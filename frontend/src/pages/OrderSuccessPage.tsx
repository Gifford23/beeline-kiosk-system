import React from "react";
import { CheckCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import { motion } from "framer-motion";

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Get the real queue number from the previous page
  // If user goes here directly without ordering, show "---"
  const queueNumber = location.state?.queueNumber || "---";

  return (
    <div className="min-h-screen bg-brand-red flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background Circles */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-yellow-400 opacity-20 rounded-full blur-3xl"></div>

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl z-10"
      >
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>

        <h1 className="text-2xl font-bold text-brand-dark mb-2">
          Order Confirmed!
        </h1>
        <p className="text-gray-500 mb-6">
          Please wait for your number to be called.
        </p>

        <div className="bg-gray-50 rounded-xl p-6 mb-6 border-2 border-dashed border-gray-200">
          <p className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-2">
            Queue Number
          </p>
          <div className="text-5xl font-black text-brand-red tracking-tighter">
            {queueNumber}
          </div>
        </div>

        {/* Status Steps */}
        <div className="flex items-center justify-between text-xs font-bold text-gray-400 mb-8 px-4">
          <div className="text-brand-red flex flex-col items-center gap-1">
            <div className="w-3 h-3 bg-brand-red rounded-full"></div>
            <span>Queued</span>
          </div>
          <div className="w-full h-0.5 bg-gray-200 mx-2"></div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
            <span>Preparing</span>
          </div>
          <div className="w-full h-0.5 bg-gray-200 mx-2"></div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
            <span>Ready</span>
          </div>
        </div>

        <button
          onClick={() => navigate("/menu")}
          className="w-full bg-brand-yellow text-brand-dark font-bold py-3 rounded-xl hover:bg-yellow-400 transition-colors"
        >
          Order Again
        </button>
      </motion.div>
    </div>
  );
};

export default OrderSuccessPage;
