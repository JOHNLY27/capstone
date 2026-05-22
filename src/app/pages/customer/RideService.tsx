import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, MapPin, Bike, Clock, ShieldCheck, Phone, Users, ChevronDown } from "lucide-react";

export function RideService() {
  const navigate = useNavigate();
  const [passengerCount, setPassengerCount] = useState("1 PAX (Single Unit)");
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const options = [
    { value: "1", label: "1 PAX (Single Unit)", sub: "Standard Response" },
    { value: "2", label: "2 PAX (Alpha-Bravo)", sub: "Requires 2 Units" },
    { value: "3", label: "3 PAX (Triple Fleet)", sub: "Requires 3 Units" },
    { value: "4", label: "4 PAX (Tactical Squad)", sub: "Requires 4 Units" },
    { value: "5", label: "5+ PAX (Special Ops)", sub: "Coordinated Logistics" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/customer/active-orders");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0047AB] text-white p-6 shadow-xl relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>

        <div className="flex items-center gap-4 relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
          >
            <ArrowLeft className="w-6 h-6 text-[#D4AF37]" />
          </button>
          <div>
            <h1 className="text-2xl font-black uppercase italic tracking-tight">FMU Ride</h1>
            <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] mt-1">Passenger Transport Unit</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="bg-[#0047AB]/5 border border-[#0047AB]/10 rounded-2xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#0047AB] mt-0.5" />
          <div>
            <p className="text-xs font-bold text-gray-900 uppercase tracking-tight">Safety Protocol Active</p>
            <p className="text-[10px] text-gray-500 font-medium">All FMU riders are verified and follow strict passenger safety guidelines.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-[#0047AB] uppercase tracking-widest mb-2">
              Pickup Point
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Where are you now?"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0047AB] focus:border-transparent bg-white shadow-sm font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#0047AB] uppercase tracking-widest mb-2">
              Destination
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37]" />
              <input
                type="text"
                placeholder="Where are you heading?"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0047AB] focus:border-transparent bg-white shadow-sm font-medium"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-[#0047AB] uppercase tracking-widest mb-2">
            Number of Passengers
          </label>
          <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0047AB] focus:border-transparent bg-white shadow-sm font-medium appearance-none">
            <option>1 Passenger</option>
            <option>2 Passengers (Requires 2 Units)</option>
            <option>3 Passengers (Requires 3 Units)</option>
            <option>4 Passengers (Requires 4 Units)</option>
            <option>5+ Group Mission (Special Logistics)</option>
          </select>
          <p className="text-[10px] text-gray-400 mt-2 italic px-1">Note: Group rides will deploy multiple FMU units to your location.</p>
        </div>

        <div>
          <label className="block text-[10px] font-black text-[#0047AB] uppercase tracking-widest mb-2">
            Rider Preference
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" className="p-3 border-2 border-[#D4AF37] bg-[#D4AF37]/5 rounded-xl text-center">
              <p className="text-[10px] font-black uppercase text-[#D4AF37]">Nearest</p>
              <p className="text-[8px] text-gray-400 font-bold uppercase">Fastest Response</p>
            </button>
            <button type="button" className="p-3 border-2 border-gray-100 bg-white rounded-xl text-center opacity-50 grayscale">
              <p className="text-[10px] font-black uppercase text-gray-400">FMU Squad</p>
              <p className="text-[8px] text-gray-400 font-bold uppercase">Trusted Units</p>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-[#0047AB] uppercase tracking-widest mb-2">
            Travel Notes
          </label>
          <textarea
            placeholder="E.g., I'm wearing a red hat, please bring extra helmet..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0047AB] focus:border-transparent bg-white shadow-sm font-medium"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#0047AB] text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#0047AB]/30 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Bike className="w-5 h-5 text-[#D4AF37]" />
          Request Ride Unit
        </button>
      </form>

      {/* Custom Bottom Sheet Selection */}
      {isPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsPickerOpen(false)}
          ></div>
          <div className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-6 pb-2">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
              <h3 className="text-xl font-black text-[#050A18] uppercase italic tracking-tight mb-1">Select Formation</h3>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-6">Specify the number of passengers for this mission</p>
            </div>
            
            <div className="px-6 pb-8 space-y-3 max-h-[60vh] overflow-y-auto">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setPassengerCount(opt.label);
                    setIsPickerOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all group ${
                    passengerCount === opt.label 
                      ? "border-[#0047AB] bg-[#0047AB]/5" 
                      : "border-gray-50 bg-gray-50/50 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        passengerCount === opt.label ? "bg-[#0047AB] text-white" : "bg-white text-gray-400 border border-gray-100"
                    }`}>
                        <Users className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className={`font-black text-sm uppercase italic tracking-tight ${passengerCount === opt.label ? "text-[#0047AB]" : "text-gray-900"}`}>
                        {opt.label}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{opt.sub}</p>
                    </div>
                  </div>
                  {passengerCount === opt.label && (
                    <div className="w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center shadow-lg shadow-[#D4AF37]/30">
                        <div className="w-2.5 h-2.5 border-r-2 border-b-2 border-white rotate-45 -mt-0.5"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
