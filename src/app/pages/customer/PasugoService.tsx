import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, DollarSign, Package, Send, MapPin } from "lucide-react";

export function PasugoService() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState("cashin");

  const types = [
    { id: "cashin", label: "Cash In", icon: DollarSign },
    { id: "parcel", label: "Parcel", icon: Package },
    { id: "errands", label: "Errands", icon: Send },
  ];

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
            <h1 className="text-2xl font-black uppercase italic tracking-tight">Pasugo Service</h1>
            <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] mt-1">Tactical Errand Deployment</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Service Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {types.map((type) => {
              const Icon = type.icon;
              return (
                 <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedType(type.id)}
                  className={`p-3 rounded-2xl border-2 transition-all ${
                    selectedType === type.id
                      ? "border-[#D4AF37] bg-[#D4AF37]/5"
                      : "border-gray-100 bg-white"
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-1 ${
                    selectedType === type.id ? "text-[#D4AF37]" : "text-gray-300"
                  }`} />
                  <p className={`text-[10px] font-black uppercase tracking-widest ${
                    selectedType === type.id ? "text-[#D4AF37]" : "text-gray-400"
                  }`}>
                    {type.label}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Recipient Name
          </label>
          <input
            type="text"
            placeholder="Enter recipient name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Recipient Phone Number
          </label>
          <input
            type="tel"
            placeholder="09XX XXX XXXX"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
            required
          />
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
                placeholder="Where should the rider start?"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0047AB] focus:border-transparent bg-white shadow-sm font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#0047AB] uppercase tracking-widest mb-2">
              Drop-off Point
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37]" />
              <input
                type="text"
                placeholder="Where is the final destination?"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0047AB] focus:border-transparent bg-white shadow-sm font-medium"
                required
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-2 italic px-1">Riders near the pickup point will receive this mission alert.</p>
          </div>
        </div>

        {selectedType === "cashin" && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Amount to Send
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
              <input
                type="number"
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
                required
              />
            </div>
          </div>
        )}

        {selectedType === "parcel" && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Parcel Description
            </label>
            <textarea
              placeholder="Describe the parcel contents"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0047AB] focus:border-transparent"
              required
            />
          </div>
        )}

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
          Dispatch Mission
        </button>
      </form>
    </div>
  );
}
