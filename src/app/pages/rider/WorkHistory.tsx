import { Package, CheckCircle, Calendar } from "lucide-react";

export function WorkHistory() {
  const history = [
    {
      id: "1",
      service: "Pabili - Jollibee",
      customer: "Juan Dela Cruz",
      date: "May 7, 2026",
      time: "2:30 PM",
      amount: "₱100",
      status: "Completed",
    },
    {
      id: "2",
      service: "Pasugo - Cash In",
      customer: "Maria Santos",
      date: "May 7, 2026",
      time: "1:15 PM",
      amount: "₱80",
      status: "Completed",
    },
    {
      id: "3",
      service: "Pahatod - Documents",
      customer: "Pedro Cruz",
      date: "May 6, 2026",
      time: "5:45 PM",
      amount: "₱120",
      status: "Completed",
    },
    {
      id: "4",
      service: "Pabili - Groceries",
      customer: "Anna Reyes",
      date: "May 6, 2026",
      time: "3:20 PM",
      amount: "₱150",
      status: "Completed",
    },
    {
      id: "5",
      service: "Pakuha - Package",
      customer: "Jose Garcia",
      date: "May 5, 2026",
      time: "10:00 AM",
      amount: "₱90",
      status: "Completed",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#050A18] text-white p-6">
        <h1 className="text-2xl font-bold uppercase tracking-tight">Work History</h1>
        <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mt-1">Completed Missions</p>
      </div>

      <div className="p-6">
        <div className="bg-gradient-to-r from-[#050A18] to-[#0047AB] text-white rounded-2xl p-6 mb-8 border border-[#D4AF37]/30 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] mb-1">Lifetime Achievement</p>
              <p className="text-4xl font-black italic">185 <span className="text-xs not-italic font-medium text-white/50">trips</span></p>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
              <CheckCircle className="w-8 h-8 text-[#D4AF37]" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="bg-[#050A18] p-3 rounded-xl border border-[#D4AF37]/30">
                    <Package className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.service}</h3>
                    <p className="text-sm text-gray-600 mt-1">Customer: {item.customer}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-[#D4AF37]/10 text-[#050A18] text-sm font-black rounded-full border border-[#D4AF37]/20">
                  {item.amount}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{item.date}</span>
                </div>
                <span>•</span>
                <span>{item.time}</span>
                <span>•</span>
                <span className="text-[#D4AF37] font-black uppercase tracking-tighter">SUCCESS</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
