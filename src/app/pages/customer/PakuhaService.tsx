import { Link, useNavigate } from "react-router";
import { ArrowLeft, MapPin } from "lucide-react";

export function PakuhaService() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/customer/active-orders");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0047AB] text-white p-6 shadow-xl">
        <div className="flex items-center gap-4 mb-4 relative z-10">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
          >
            <ArrowLeft className="w-6 h-6 text-[#D4AF37]" />
          </button>
          <div>
            <h1 className="text-2xl font-black uppercase italic tracking-tight">Pakuha Service</h1>
            <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] mt-1">Strategic Retrieval Mission</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-[#0047AB] uppercase tracking-widest mb-2">
              Retrieval Point (Pickup)
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Where should the item be picked up?"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0047AB] focus:border-transparent bg-white shadow-sm font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#0047AB] uppercase tracking-widest mb-2">
              Drop-off Destination
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37]" />
              <input
                type="text"
                placeholder="Where is the item going?"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0047AB] focus:border-transparent bg-white shadow-sm font-medium"
                required
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-2 italic px-1">Nearest available riders to the retrieval point will be deployed.</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Contact Person at Pickup
          </label>
          <input
            type="text"
            placeholder="Name of person"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Contact Phone Number
          </label>
          <input
            type="tel"
            placeholder="09XX XXX XXXX"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Item Description
          </label>
          <textarea
            placeholder="What items are you picking up?"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Additional Instructions
          </label>
          <textarea
            placeholder="Any special requests or instructions..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#0047AB] text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#0047AB]/30 active:scale-95 transition-all"
        >
          Confirm Retrieval
        </button>
      </form>
    </div>
  );
}
