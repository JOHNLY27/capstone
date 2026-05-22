import { Link, useNavigate } from "react-router";
import { ArrowLeft, MapPin, Plus, Trash2 } from "lucide-react";

export function SavedAddresses() {
  const navigate = useNavigate();
  const addresses = [
    {
      id: "1",
      label: "Home",
      address: "Purok 1, Buhangin, Butuan City, Agusan del Norte",
      isDefault: true,
    },
    {
      id: "2",
      label: "Work",
      address: "Capitol Site, Butuan City, Agusan del Norte",
      isDefault: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0047AB] text-white p-6 shadow-xl relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
          >
            <ArrowLeft className="w-6 h-6 text-[#D4AF37]" />
          </button>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight italic">Saved Addresses</h1>
            <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] mt-1">Deployment Locations</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#0047AB]" />
                <h3 className="font-bold text-gray-900">{addr.label}</h3>
                {addr.isDefault && (
                  <span className="px-2 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-black rounded border border-[#D4AF37]/20 uppercase tracking-tighter">
                    Primary
                  </span>
                )}
              </div>
              <button className="text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-600">{addr.address}</p>
          </div>
        ))}

        <button className="w-full py-5 border-2 border-dashed border-gray-300 rounded-2xl text-gray-400 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:border-[#0047AB] hover:text-[#0047AB] transition-all group active:scale-95">
          <Plus className="w-5 h-5 group-hover:scale-125 transition-transform" />
          Add New Address
        </button>
      </div>
    </div>
  );
}
