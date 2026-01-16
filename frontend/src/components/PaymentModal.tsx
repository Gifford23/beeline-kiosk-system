import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { X, Loader2, CheckCircle, Smartphone } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  method: "gcash" | "maya" | "card" | "counter";
  onPaymentSuccess: () => void;
}

const PaymentModal = ({
  isOpen,
  onClose,
  amount,
  method,
  onPaymentSuccess,
}: PaymentModalProps) => {
  const [status, setStatus] = useState<"waiting" | "processing" | "success">(
    "waiting"
  );

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) setStatus("waiting");
  }, [isOpen]);

  if (!isOpen) return null;

  // Simulate the "Real" Payment Process
  const handleSimulateScan = () => {
    setStatus("processing");

    // Fake a 3-second network request to GCash/Maya
    setTimeout(() => {
      setStatus("success");
      // Wait 1 second to show success checkmark, then finish
      setTimeout(() => {
        onPaymentSuccess();
      }, 1500);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up">
        {/* Header */}
        <div
          className={`p-4 flex justify-between items-center text-white
          ${method === "gcash" ? "bg-blue-600" : ""}
          ${method === "maya" ? "bg-green-600" : ""}
          ${method === "card" ? "bg-gray-800" : ""}
          ${method === "counter" ? "bg-brand-yellow text-brand-dark" : ""}
        `}
        >
          <div className="flex items-center gap-2 font-bold">
            {method === "gcash" && "GCash Payment"}
            {method === "maya" && "Maya Payment"}
            {method === "card" && "Card Terminal"}
            {method === "counter" && "Pay at Counter"}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 flex flex-col items-center text-center">
          {status === "waiting" && (
            <>
              <div className="mb-2 text-gray-500 font-bold text-sm uppercase tracking-wide">
                Total Amount
              </div>
              <div className="text-4xl font-black text-brand-dark mb-8">
                ₱{amount.toFixed(2)}
              </div>

              {/* QR Code Container */}
              <div className="bg-white p-4 rounded-xl border-4 border-gray-100 shadow-inner mb-6 relative">
                {/* Unique QR for this transaction */}
                <QRCode
                  value={`beeline-pay:${method}-${amount}-${Date.now()}`}
                  size={180}
                  fgColor={method === "gcash" ? "#0054a6" : "#000000"}
                />

                {/* Logo Overlay in Center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white p-1 rounded-full shadow-md">
                    <Smartphone
                      className={`w-6 h-6 ${
                        method === "gcash" ? "text-blue-600" : "text-gray-800"
                      }`}
                    />
                  </div>
                </div>
              </div>

              <p className="text-gray-400 text-sm mb-6 max-w-[200px]">
                Please scan this QR code using your {method.toUpperCase()} App
                to pay.
              </p>

              {/* Simulator Button (Since we don't have real money yet) */}
              <button
                onClick={handleSimulateScan}
                className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors text-sm"
              >
                (Simulator: Click to Simulate Scan)
              </button>
            </>
          )}

          {status === "processing" && (
            <div className="py-10 flex flex-col items-center">
              <Loader2 className="w-16 h-16 text-brand-red animate-spin mb-4" />
              <h3 className="text-xl font-bold text-gray-700">
                Processing Payment...
              </h3>
              <p className="text-gray-400 text-sm">
                Please wait while we verify transaction.
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="py-10 flex flex-col items-center animate-bounce-short">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-black text-green-600">
                Payment Successful!
              </h3>
              <p className="text-gray-400 text-sm">Redirecting to receipt...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
