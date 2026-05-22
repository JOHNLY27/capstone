import { Link, useNavigate } from "react-router";
import { Package, Clock, CheckCircle, ArrowLeft } from "lucide-react";

export function ActiveOrders() {
  const navigate = useNavigate();
  const orders = [
    {
      id: "1",
      service: "Pabili - Jollibee",
      status: "In Transit",
      rider: "Mark Santos",
      time: "15 min",
      statusColor: "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20",
    },
    {
      id: "2",
      service: "Pasugo - Cash In",
      status: "Finding Rider",
      rider: null,
      time: "2 min ago",
      statusColor: "bg-[#0047AB]/10 text-[#0047AB] border border-[#0047AB]/20",
    },
    {
      id: "3",
      service: "Pakuha - Documents",
      status: "Completed",
      rider: "Anna Cruz",
      time: "30 min ago",
      statusColor: "bg-gray-100 text-gray-700",
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
            <h1 className="text-2xl font-black uppercase italic tracking-tight">Active Orders</h1>
            <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] mt-1">Real-time Deployment Status</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/customer/track/${order.id}`}
            className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className="bg-[#0047AB]/5 p-3 rounded-xl border border-[#0047AB]/10">
                  <Package className="w-5 h-5 text-[#0047AB]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{order.service}</h3>
                  {order.rider && (
                    <p className="text-sm text-gray-600 mt-1">Rider: {order.rider}</p>
                  )}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${order.statusColor}`}>
                {order.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{order.time}</span>
            </div>
          </Link>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No active orders</p>
          </div>
        )}
      </div>
    </div>
  );
}
