import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Star, MessageSquare, Send, User, ShieldCheck } from "lucide-react";

export function RateRider() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Thank you for rating Order #${orderId}!`);
    navigate("/customer");
  };

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
            <h1 className="text-2xl font-black uppercase italic tracking-tight">Mission Debrief</h1>
            <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] mt-1 text-white/70">Rate Your Tactical Rider</p>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-lg mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center relative overflow-hidden">
            {/* Watermark Logo Placeholder */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#0047AB]/5 rounded-full blur-3xl"></div>

            <div className="relative z-10">
                <div className="w-24 h-24 bg-gradient-to-br from-[#0047AB] to-[#003380] rounded-2xl mx-auto mb-6 flex items-center justify-center border-4 border-[#D4AF37]/20 shadow-xl">
                    <User className="w-12 h-12 text-[#D4AF37]" />
                </div>
                
                <h2 className="text-xl font-black text-[#050A18] mb-1">Mark Santos</h2>
                <div className="flex items-center justify-center gap-1 mb-6">
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verified FMU Elite Unit</p>
                </div>

                <div className="mb-8">
                    <p className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-tighter">How was the mission execution?</p>
                    <div className="flex items-center justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="transition-all active:scale-125"
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                                onClick={() => setRating(star)}
                            >
                                <Star 
                                    className={`w-10 h-10 ${
                                        (hover || rating) >= star 
                                            ? "text-[#D4AF37] fill-[#D4AF37]" 
                                            : "text-gray-200"
                                    } transition-colors`} 
                                />
                            </button>
                        ))}
                    </div>
                    {rating > 0 && (
                        <p className="text-[10px] font-black text-[#D4AF37] uppercase mt-4 tracking-[0.2em] animate-in fade-in slide-in-from-top-1">
                            {rating === 5 ? "Exceptional Performance" : rating >= 4 ? "Mission Successful" : "Standard Ops"}
                        </p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="text-left">
                        <label className="block text-[10px] font-black text-[#0047AB] uppercase tracking-widest mb-3 px-1">
                            Mission Feedback (Optional)
                        </label>
                        <div className="relative">
                            <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-gray-300" />
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Any comments on the rider's speed, communication, or handling?"
                                rows={4}
                                className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#0047AB] focus:border-transparent bg-gray-50/50 font-medium text-sm transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={rating === 0}
                        className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-xl ${
                            rating > 0 
                                ? "bg-[#0047AB] text-white shadow-[#0047AB]/30 active:scale-95" 
                                : "bg-gray-100 text-gray-400 shadow-none cursor-not-allowed"
                        }`}
                    >
                        <Send className={`w-5 h-5 ${rating > 0 ? "text-[#D4AF37]" : ""}`} />
                        Submit Debriefing
                    </button>
                </form>
            </div>
        </div>

        <p className="text-center text-[10px] text-gray-400 mt-8 uppercase font-bold tracking-widest leading-relaxed">
            Your feedback helps us maintain the <br/>
            <span className="text-[#D4AF37]">highest tactical standards</span> in Butuan City.
        </p>
      </div>
    </div>
  );
}
