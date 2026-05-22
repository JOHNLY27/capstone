import { useNavigate } from "react-router";
import { ArrowLeft, Star, Heart, MessageSquare, ShieldCheck, Zap } from "lucide-react";

export function FavoriteRiders() {
  const navigate = useNavigate();
  
  const favoriteRiders = [
    {
      id: "1",
      name: "Mark Santos",
      rating: 4.9,
      deliveries: 124,
      status: "Online",
      specialty: "Pabili Expert",
    },
    {
      id: "2",
      name: "Anna Cruz",
      rating: 4.8,
      deliveries: 89,
      status: "Busy",
      specialty: "Fast Logistics",
    },
    {
      id: "3",
      name: "Juan Reyes",
      rating: 5.0,
      deliveries: 215,
      status: "Online",
      specialty: "Secure Handling",
    }
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
            <h1 className="text-2xl font-black uppercase tracking-tight italic">FMU SQUAD</h1>
            <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] mt-1">Your Trusted Tactical Riders</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {favoriteRiders.map((rider) => (
          <div 
            key={rider.id}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-[#0047AB]/5 rounded-2xl flex items-center justify-center border border-[#0047AB]/10">
                    <ShieldCheck className="w-8 h-8 text-[#0047AB]" />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${rider.status === "Online" ? "bg-green-500" : "bg-orange-500"}`}></div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-gray-900 tracking-tight">{rider.name}</h3>
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                    <span className="text-[10px] font-black text-gray-500">{rider.rating} • {rider.deliveries} Missions</span>
                    <button 
                      onClick={() => navigate(`/customer/rider-reviews/${rider.id}`)}
                      className="ml-2 text-[8px] font-black text-[#0047AB] uppercase tracking-widest hover:underline"
                    >
                      [ View Intel ]
                    </button>
                  </div>
                  <p className="text-[10px] font-black text-[#D4AF37] uppercase mt-2 tracking-tighter bg-[#D4AF37]/10 px-2 py-0.5 rounded-md inline-block">
                    {rider.specialty}
                  </p>
                </div>
              </div>
              <button className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                 <Heart className="w-6 h-6" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button 
                onClick={() => navigate("/customer/chat")}
                className="flex items-center justify-center gap-2 py-3 bg-gray-50 rounded-xl text-gray-600 font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Briefing
              </button>
              <button 
                onClick={() => navigate("/customer/pabili")}
                className="flex items-center justify-center gap-2 py-3 bg-[#0047AB] text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-[#0047AB]/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Zap className="w-4 h-4 text-[#D4AF37]" />
                Rebook Unit
              </button>
            </div>
          </div>
        ))}

        {favoriteRiders.length === 0 && (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-bold">No favorite riders yet</p>
            <p className="text-xs text-gray-400 mt-1">Complete more missions to build your squad!</p>
          </div>
        )}
      </div>
    </div>
  );
}
