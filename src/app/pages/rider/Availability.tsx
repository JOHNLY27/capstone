import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ShieldCheck, Clock, Moon, Power, Zap, Coffee } from "lucide-react";

export function RiderAvailability() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"online" | "offline" | "break">("online");

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className={`p-6 shadow-xl relative overflow-hidden transition-colors duration-500 ${
        status === "online" ? "bg-[#050A18]" : status === "break" ? "bg-orange-600" : "bg-gray-800"
      }`}>
        {/* Abstract Background Element */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm text-white"
          >
            <ArrowLeft className="w-6 h-6 text-[#D4AF37]" />
          </button>
          <div className="text-white">
            <h1 className="text-2xl font-black uppercase italic tracking-tight">Duty Status</h1>
            <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] mt-1">Operational Availability</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Main Status Toggle Area */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 text-center">
            <div className={`w-32 h-32 rounded-full mx-auto mb-8 flex items-center justify-center border-8 transition-all duration-500 ${
                status === "online" 
                    ? "bg-green-50 border-green-100 shadow-[0_0_50px_rgba(34,197,94,0.2)]" 
                    : status === "break" 
                        ? "bg-orange-50 border-orange-100 shadow-[0_0_50px_rgba(249,115,22,0.2)]"
                        : "bg-gray-50 border-gray-100"
            }`}>
                {status === "online" && <Zap className="w-16 h-16 text-green-500 animate-pulse" />}
                {status === "break" && <Coffee className="w-16 h-16 text-orange-500" />}
                {status === "offline" && <Power className="w-16 h-16 text-gray-300" />}
            </div>

            <h2 className="text-2xl font-black text-[#050A18] uppercase italic tracking-tight mb-2">
                {status === "online" ? "Ready for Action" : status === "break" ? "On Tactical Break" : "Duty Suspended"}
            </h2>
            <p className="text-sm text-gray-500 font-medium px-4">
                {status === "online" 
                    ? "You are currently visible to customers and ready to receive mission requests." 
                    : status === "break" 
                        ? "Temporary pause. You won't receive new missions but remain in the deployment queue."
                        : "Your unit is hidden from the tactical map. No mission requests will be received."}
            </p>
        </div>

        {/* Status Selection Grid */}
        <div className="grid grid-cols-1 gap-3">
            <button 
                onClick={() => setStatus("online")}
                className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${
                    status === "online" ? "border-green-500 bg-green-50/50" : "border-gray-50 bg-white"
                }`}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${status === "online" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"}`}>
                        <Zap className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                        <p className="font-black text-sm uppercase italic tracking-tight text-gray-900">Go Online</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Duty Mode</p>
                    </div>
                </div>
                {status === "online" && <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                    <div className="w-2.5 h-2.5 border-r-2 border-b-2 border-white rotate-45 -mt-0.5"></div>
                </div>}
            </button>

            <button 
                onClick={() => setStatus("break")}
                className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${
                    status === "break" ? "border-orange-500 bg-orange-50/50" : "border-gray-50 bg-white"
                }`}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${status === "break" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"}`}>
                        <Coffee className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                        <p className="font-black text-sm uppercase italic tracking-tight text-gray-900">Take a Break</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Temporary Pause</p>
                    </div>
                </div>
                {status === "break" && <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <div className="w-2.5 h-2.5 border-r-2 border-b-2 border-white rotate-45 -mt-0.5"></div>
                </div>}
            </button>

            <button 
                onClick={() => setStatus("offline")}
                className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${
                    status === "offline" ? "border-gray-500 bg-gray-50/50" : "border-gray-50 bg-white"
                }`}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${status === "offline" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-400"}`}>
                        <Power className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                        <p className="font-black text-sm uppercase italic tracking-tight text-gray-900">Go Offline</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Suspend Duty</p>
                    </div>
                </div>
                {status === "offline" && <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center shadow-lg shadow-gray-500/30">
                    <div className="w-2.5 h-2.5 border-r-2 border-b-2 border-white rotate-45 -mt-0.5"></div>
                </div>}
            </button>
        </div>

        <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-3">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                <h4 className="text-xs font-black text-[#050A18] uppercase tracking-widest">Duty Guidelines</h4>
            </div>
            <ul className="space-y-2">
                <li className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-2">
                    <div className="w-1 h-1 bg-[#D4AF37] rounded-full"></div>
                    Online status required to receive new missions.
                </li>
                <li className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-2">
                    <div className="w-1 h-1 bg-[#D4AF37] rounded-full"></div>
                    Break mode limits mission flow for up to 30 mins.
                </li>
            </ul>
        </div>
      </div>
    </div>
  );
}
