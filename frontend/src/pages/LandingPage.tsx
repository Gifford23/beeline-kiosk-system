import React from "react";
import { Utensils, ShoppingBag, ChevronRight, ChefHat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleStart = (type: string) => {
    // 1. Save Preference for the Menu Page to use
    localStorage.setItem("orderType", type);
    console.log("Selected:", type);
    navigate("/menu");
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden font-sans">
      {/* --- BACKGROUND DECORATION --- */}
      {/* A subtle pattern makes it look premium, not like a wireframe */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 transform rotate-12">
          <Utensils size={120} />
        </div>
        <div className="absolute bottom-20 right-10 transform -rotate-12">
          <ShoppingBag size={120} />
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-50">
          <div className="w-[800px] h-[800px] bg-brand-red rounded-full blur-3xl opacity-10"></div>
        </div>
      </div>

      {/* --- HERO HEADER --- */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="pt-20 pb-10 text-center relative z-10"
      >
        <div className="inline-flex items-center justify-center p-4 bg-white rounded-full shadow-xl mb-6 animate-bounce-slow">
          <ChefHat className="w-12 h-12 text-brand-red" />
        </div>
        <h1 className="text-6xl font-black text-brand-dark tracking-tighter mb-4">
          Welcome to <span className="text-brand-red">BeeLine</span>
        </h1>
        <p className="text-xl text-gray-500 font-medium uppercase tracking-widest">
          Where will you be eating today?
        </p>
      </motion.div>

      {/* --- MAIN SELECTION CARDS --- */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex items-center justify-center p-8 z-20"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl h-[50vh]">
          {/* DINE IN CARD */}
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleStart("dine-in")}
            className="relative bg-white rounded-[2.5rem] shadow-xl p-8 flex flex-col items-center justify-center gap-6 border-2 border-transparent hover:border-brand-red transition-all group overflow-hidden"
          >
            {/* Hover Background Fill */}
            <div className="absolute inset-0 bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative z-10 w-40 h-40 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-brand-red group-hover:shadow-lg group-hover:shadow-red-500/30 transition-all duration-300">
              <Utensils className="w-20 h-20 text-brand-red group-hover:text-white transition-colors" />
            </div>

            <div className="relative z-10 text-center">
              <h2 className="text-4xl font-black text-gray-800 mb-2 group-hover:text-brand-red transition-colors">
                Dine In
              </h2>
              <p className="text-gray-400 font-bold group-hover:text-gray-600">
                Enjoy your meal here
              </p>
            </div>

            {/* CTA Arrow */}
            <div className="absolute bottom-8 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 text-brand-red font-bold flex items-center gap-1">
              Tap to start <ChevronRight size={20} />
            </div>
          </motion.button>

          {/* TAKE OUT CARD */}
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleStart("take-out")}
            className="relative bg-white rounded-[2.5rem] shadow-xl p-8 flex flex-col items-center justify-center gap-6 border-2 border-transparent hover:border-brand-yellow transition-all group overflow-hidden"
          >
            {/* Hover Background Fill */}
            <div className="absolute inset-0 bg-yellow-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative z-10 w-40 h-40 bg-yellow-100 rounded-full flex items-center justify-center group-hover:bg-brand-yellow group-hover:shadow-lg group-hover:shadow-yellow-500/30 transition-all duration-300">
              <ShoppingBag className="w-20 h-20 text-brand-yellow group-hover:text-brand-dark transition-colors" />
            </div>

            <div className="relative z-10 text-center">
              <h2 className="text-4xl font-black text-gray-800 mb-2 group-hover:text-brand-dark transition-colors">
                Take Out
              </h2>
              <p className="text-gray-400 font-bold group-hover:text-gray-600">
                Bagged to go
              </p>
            </div>

            {/* CTA Arrow */}
            <div className="absolute bottom-8 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 text-brand-dark font-bold flex items-center gap-1">
              Tap to start <ChevronRight size={20} />
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* --- FOOTER --- */}
      <div className="text-center pb-8 z-10">
        <p className="text-gray-400 text-sm font-bold uppercase tracking-widest opacity-60">
          Touch anywhere to interact
        </p>
        <p className="text-gray-300 text-xs mt-2">
          Powered by BeeLine Kiosk OS v2.0
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
