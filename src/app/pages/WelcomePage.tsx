import { Link } from "react-router";
import { Bike, ShoppingBag, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function WelcomePage() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#050A18] overflow-hidden font-sans">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-[#0047AB]/20 blur-[120px] rounded-full"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] bg-[#D4AF37]/10 blur-[120px] rounded-full"
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center p-1 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl rounded-3xl border border-white/20 shadow-[0_0_50px_rgba(212,175,55,0.15)] group overflow-hidden"
          >
            <img 
              src="/logo.png" 
              alt="Fetch Me Up Butuan Logo" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="w-full h-full flex flex-col items-center justify-center text-[#D4AF37]"><div class="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-2"></div><span class="text-[10px] font-black tracking-widest uppercase">Logo</span></div>';
                }
              }}
            />
          </motion.div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2 drop-shadow-2xl uppercase">
            FETCH <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0047AB] via-[#D4AF37] to-[#FFD700]">ME UP</span>
          </h1>
          <p className="text-sm font-bold text-[#D4AF37] tracking-[0.3em] uppercase opacity-80">
            Butuan City
          </p>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Link
              to="/login"
              className="group relative flex items-center justify-center w-full bg-gradient-to-r from-[#0047AB] to-[#003380] text-white py-5 rounded-2xl font-bold shadow-[0_0_30px_rgba(0,71,171,0.3)] hover:shadow-[0_0_50px_rgba(0,71,171,0.5)] transition-all overflow-hidden border border-white/10"
            >
              <span className="relative z-10 flex items-center gap-2 uppercase tracking-wider">
                Access Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </motion.div>

          <div className="relative flex items-center gap-4 py-4">
            <div className="flex-1 h-[1px] bg-white/5"></div>
            <p className="text-[#D4AF37]/40 text-[10px] font-bold uppercase tracking-[0.3em]">Join the Fleet</p>
            <div className="flex-1 h-[1px] bg-white/5"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Link
                to="/signup/customer"
                className="flex flex-col items-center justify-center gap-3 w-full bg-white/5 backdrop-blur-md text-white py-6 rounded-2xl font-semibold border border-white/10 hover:bg-white/10 hover:border-[#D4AF37]/30 transition-all active:scale-95 group"
              >
                <div className="p-3 bg-[#0047AB]/20 rounded-xl group-hover:bg-[#0047AB]/40 transition-colors">
                  <ShoppingBag className="w-6 h-6 text-[#0047AB]" />
                </div>
                <span className="text-sm">Customer</span>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Link
                to="/signup/rider"
                className="flex flex-col items-center justify-center gap-3 w-full bg-white/5 backdrop-blur-md text-white py-6 rounded-2xl font-semibold border border-white/10 hover:bg-white/10 hover:border-[#D4AF37]/30 transition-all active:scale-95 group"
              >
                <div className="p-3 bg-[#D4AF37]/20 rounded-xl group-hover:bg-[#D4AF37]/40 transition-colors">
                  <Bike className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <span className="text-sm">Rider</span>
              </Link>
            </motion.div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="mt-16 text-center"
        >
          <p className="text-white/20 text-[9px] uppercase tracking-[0.4em] font-bold">
            Safe • Fast • Reliable • Established 2025
          </p>
        </motion.div>
      </div>
    </div>
  );
}
