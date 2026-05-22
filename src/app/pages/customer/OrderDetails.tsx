import { Link, useParams } from "react-router";
import { ChevronLeft, MapPin, Package, Calendar, Clock, DollarSign, User, Star } from "lucide-react";

export function OrderDetails() {
  const { orderId } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-[#0047AB] text-white p-6 shadow-xl">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/customer/history" className="p-2 -ml-2 rounded-full hover:bg-white/10">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-black uppercase italic tracking-tight">Order Details</h1>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Order #{orderId || "12345"}</p>
          <span className="bg-[#D4AF37] text-[#050A18] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Completed</span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Service & Price */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#0047AB]/5 p-3 rounded-xl border border-[#0047AB]/10">
              <Package className="w-6 h-6 text-[#0047AB]" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Pabili - McDonald's</h2>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <Calendar className="w-3 h-3" />
                <span>May 6, 2026</span>
                <span className="mx-1">•</span>
                <Clock className="w-3 h-3" />
                <span>2:30 PM</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-gray-900 tracking-tighter italic">₱350</p>
            <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest mt-1">Paid via GCash</p>
          </div>
        </div>

        {/* Rider Info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Your Rider</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Mark Santos</p>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs text-gray-600 font-medium">4.9</span>
                </div>
              </div>
            </div>
            <Link 
              to="/customer/chat"
              className="text-[#0047AB] text-xs font-black uppercase tracking-widest hover:underline"
            >
              Chat Again
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">2x McChicken Meal</span>
              <span className="text-gray-900 font-medium">₱280</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="text-gray-900 font-medium">₱70</span>
            </div>
            <div className="pt-2 border-t border-gray-100 mt-2 flex justify-between">
              <span className="font-bold text-gray-900 uppercase text-xs tracking-widest">Total Amount</span>
              <span className="font-black text-[#0047AB] italic text-xl">₱350</span>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-1" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Delivery Address</p>
              <p className="text-sm text-gray-600 mt-1">
                Purok 1, Buhangin, Butuan City, Agusan del Norte
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button className="w-full bg-[#0047AB] text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#0047AB]/30 active:scale-95 transition-all">
          Reorder Mission
        </button>
      </div>
    </div>
  );
}
