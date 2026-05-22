import { Link, useParams, useNavigate } from "react-router";
import { ArrowLeft, Phone, MessageCircle, MapPin, Clock, User, Navigation2 } from "lucide-react";

export function TrackOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <div className="bg-[#0047AB] text-white p-6 shadow-xl relative z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
          >
            <ArrowLeft className="w-6 h-6 text-[#D4AF37]" />
          </button>
          <div>
            <h1 className="text-xl font-black uppercase italic tracking-tight">Track Order #{orderId}</h1>
            <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] mt-1">Status: In Progress</p>
          </div>
        </div>
      </div>

      <div className="flex-1 relative bg-gray-200 overflow-hidden">
        {/* Simulation of Live Tracking */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-[#0047AB]/10 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#050A18]">Live Tracking Active</p>
          </div>
        </div>

        <div className="absolute top-4 right-4 z-10">
          <div className="bg-[#0047AB] p-3 rounded-2xl shadow-xl border border-white/20">
            <Navigation2 className="w-5 h-5 text-[#D4AF37] animate-pulse" />
          </div>
        </div>

        <iframe
          title="Butuan City Map"
          className="w-full h-full border-0"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63033.4077651036!2d125.5015!3d8.9475!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3301ef876792400b%3A0x67c74534063fcf0a!2sButuan%20City%2C%20Agusan%20Del%20Norte!5e0!3m2!1sen!2sph!4v1715056789012!5m2!1sen!2sph"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
        
        {/* Animated Rider Indicator Shadow */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="relative">
                <div className="absolute -inset-8 bg-[#0047AB]/20 rounded-full blur-2xl animate-pulse"></div>
                <MapPin className="w-10 h-10 text-[#0047AB] drop-shadow-2xl relative z-10" />
            </div>
        </div>
      </div>

      <div className="bg-white rounded-t-3xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#0047AB]/10 p-3 rounded-2xl border border-[#0047AB]/20">
              <User className="w-6 h-6 text-[#0047AB]" />
            </div>
            <div>
              <p className="font-black text-gray-900 tracking-tight">Mark Santos</p>
              <p className="text-[10px] text-[#D4AF37] font-black uppercase">Official Rider</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => alert("Calling Mark Santos: 0912 345 6789")}
              className="bg-[#0047AB]/10 p-3 rounded-full hover:bg-[#0047AB]/20 transition-colors border border-[#0047AB]/20"
            >
              <Phone className="w-5 h-5 text-[#0047AB]" />
            </button>
            <Link 
              to="/customer/chat"
              className="bg-[#0047AB]/10 p-3 rounded-full hover:bg-[#0047AB]/20 transition-colors border border-[#0047AB]/20"
            >
              <MessageCircle className="w-5 h-5 text-[#0047AB]" />
            </Link>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/30 rounded-2xl p-5 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-gray-900">
              <div className="bg-white p-2 rounded-xl shadow-sm">
                <Clock className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Estimated Arrival</p>
                <p className="text-2xl font-black italic text-[#0047AB]">15 Minutes</p>
              </div>
            </div>
            <div className="text-right">
                <p className="text-[8px] font-black uppercase text-[#D4AF37]">Distance</p>
                <p className="font-black text-[#050A18]">2.4 KM</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2.5 h-2.5 bg-[#D4AF37] rounded-full mt-2 ring-4 ring-[#D4AF37]/20"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Order Picked Up</p>
              <p className="text-xs text-gray-500">2:30 PM</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2.5 h-2.5 bg-[#D4AF37] rounded-full mt-2 ring-4 ring-[#D4AF37]/20"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Rider Assigned</p>
              <p className="text-xs text-gray-500">2:15 PM</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2.5 h-2.5 bg-[#D4AF37] rounded-full mt-2 ring-4 ring-[#D4AF37]/20"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Order Confirmed</p>
              <p className="text-xs text-gray-500">2:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
