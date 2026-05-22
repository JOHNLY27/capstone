import { Link, useNavigate } from "react-router";
import { Package, ChevronRight, ArrowLeft } from "lucide-react";

export function OrderHistory() {
  const navigate = useNavigate();
  const history = [
    {
      id: "1",
      service: "Pabili - McDonald's",
      date: "May 6, 2026",
      amount: "₱350",
      status: "Completed",
    },
    {
      id: "2",
      service: "Pahatod - Documents",
      date: "May 5, 2026",
      amount: "₱150",
      status: "Completed",
    },
    {
      id: "3",
      service: "Pasugo - Cash In",
      date: "May 4, 2026",
      amount: "₱100",
      status: "Completed",
    },
    {
      id: "4",
      service: "Pabili - Groceries",
      date: "May 3, 2026",
      amount: "₱520",
      status: "Completed",
    },
    {
      id: "5",
      service: "Pakuha - Package",
      date: "May 2, 2026",
      amount: "₱200",
      status: "Completed",
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
            <h1 className="text-2xl font-black uppercase tracking-tight italic">Order History</h1>
            <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] mt-1">Past Missions & Records</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-3">
        {history.map((order) => (
          <Link
            key={order.id}
            to={`/customer/order-details/${order.id}`}
            className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="bg-[#0047AB]/5 p-3 rounded-xl border border-[#0047AB]/10">
                  <Package className="w-5 h-5 text-[#0047AB]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{order.service}</h3>
                  <p className="text-sm text-gray-600 mt-1">{order.date}</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-2">
                <div>
                  <p className="font-black text-gray-900 tracking-tighter italic text-lg">{order.amount}</p>
                  <p className="text-[10px] font-black text-[#D4AF37] uppercase tracking-tighter">MISSION SUCCESS</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
