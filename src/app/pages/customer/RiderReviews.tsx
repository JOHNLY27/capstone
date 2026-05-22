import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Star, MessageSquare, ShieldCheck, User, Calendar } from "lucide-react";

export function RiderReviews() {
  const navigate = useNavigate();
  const { riderId } = useParams();

  const reviews = [
    {
      id: "1",
      customer: "Juan D.",
      rating: 5,
      comment: "Very fast and polite! Handled my groceries with care. Highly recommended for Pabili missions.",
      date: "May 7, 2026",
    },
    {
      id: "2",
      customer: "Maria S.",
      rating: 4,
      comment: "Good service, just a bit of a delay due to traffic, but communicated well throughout the transit.",
      date: "May 5, 2026",
    },
    {
      id: "3",
      customer: "Karlo P.",
      rating: 5,
      comment: "Elite performance. Found the difficult address without any issues. Very professional.",
      date: "May 3, 2026",
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
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
            <h1 className="text-2xl font-black uppercase italic tracking-tight">Rider Intel</h1>
            <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] mt-1">Performance Visibility Report</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Rider Summary Header */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-20 h-20 bg-[#0047AB]/5 rounded-2xl flex items-center justify-center border-2 border-[#D4AF37]/20">
                <User className="w-10 h-10 text-[#0047AB]" />
            </div>
            <div>
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-gray-900 italic uppercase">Mark Santos</h2>
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                    <span className="text-sm font-black text-gray-900">4.9</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">• 124 Successful Missions</span>
                </div>
                <p className="text-[10px] font-black text-[#0047AB] uppercase mt-2 tracking-widest bg-[#0047AB]/5 px-2 py-0.5 rounded-md inline-block">
                    Pabili Specialist
                </p>
            </div>
        </div>

        {/* Review List */}
        <div className="space-y-4">
            <h3 className="text-[10px] font-black text-[#0047AB] uppercase tracking-[0.3em] px-1 mb-4">Tactical Feedback History</h3>
            
            {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 group hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-400" />
                            </div>
                            <span className="font-black text-xs text-gray-900 uppercase tracking-tighter">{review.customer}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span className="text-[8px] font-bold text-gray-400 uppercase">{review.date}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-0.5 mb-3">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? "text-[#D4AF37] fill-[#D4AF37]" : "text-gray-200"}`} />
                        ))}
                    </div>

                    <p className="text-sm text-gray-600 font-medium leading-relaxed italic">
                        "{review.comment}"
                    </p>
                </div>
            ))}
        </div>

        {reviews.length === 0 && (
            <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                <p className="text-gray-400 font-bold">No tactical feedback yet</p>
            </div>
        )}
      </div>
    </div>
  );
}
