import { Link } from "react-router";
import { ChevronLeft, MapPin, CheckCircle2 } from "lucide-react";

export function ServiceAreas() {
  const areas = [
    { name: "Poblacion", active: true },
    { name: "Buhangin", active: true },
    { name: "Libertad", active: true },
    { name: "Villa Kananga", active: true },
    { name: "Ampayon", active: false },
    { name: "Tiniwisan", active: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#050A18] text-white p-6">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/rider/profile" className="p-2 -ml-2 rounded-full hover:bg-white/10">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold">Service Areas</h1>
        </div>
        <p className="text-[#D4AF37] text-sm uppercase font-bold tracking-wider">Butuan City Zones</p>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-6 h-6 text-[#D4AF37]" />
            <h2 className="font-semibold text-gray-900 text-lg">Your Active Zones</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            You are currently receiving requests from these areas in Butuan City.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {areas.map((area) => (
              <div
                key={area.name}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  area.active
                    ? "border-[#D4AF37]/50 bg-[#D4AF37]/5 text-[#D4AF37]"
                    : "border-gray-200 bg-white text-gray-400"
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-tighter">{area.name}</span>
                {area.active && <CheckCircle2 className="w-4 h-4" />}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Move closer to the city center (Poblacion) to receive more orders during peak hours.
          </p>
        </div>
      </div>
    </div>
  );
}
