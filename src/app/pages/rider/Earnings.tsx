import { useState } from "react";
import { DollarSign, TrendingUp, Calendar, Download } from "lucide-react";

export function RiderEarnings() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");

  const earnings = {
    daily: { amount: "₱850", orders: 8, avg: "₱106" },
    weekly: { amount: "₱4,250", orders: 42, avg: "₱101" },
    monthly: { amount: "₱18,500", orders: 185, avg: "₱100" },
  };

  const recentEarnings = [
    { id: "1", service: "Pabili - Jollibee", time: "2:30 PM", amount: "₱100" },
    { id: "2", service: "Pasugo - Cash In", time: "1:15 PM", amount: "₱80" },
    { id: "3", service: "Pahatod - Documents", time: "12:45 PM", amount: "₱120" },
    { id: "4", service: "Pabili - Groceries", time: "11:30 AM", amount: "₱150" },
    { id: "5", service: "Pakuha - Package", time: "10:00 AM", amount: "₱90" },
  ];

  const currentEarnings = earnings[period];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="bg-gradient-to-br from-[#050A18] to-[#0047AB] text-white p-6 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight">Earnings</h1>
            <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-[0.2em] mt-1">Income Tracker</p>
          </div>
          <div className="p-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
            <DollarSign className="w-6 h-6 text-[#D4AF37]" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setPeriod("daily")}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                period === "daily"
                  ? "bg-[#D4AF37] text-[#050A18]"
                  : "bg-white/10 text-white"
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setPeriod("weekly")}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                period === "weekly"
                  ? "bg-[#D4AF37] text-[#050A18]"
                  : "bg-white/10 text-white"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setPeriod("monthly")}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                period === "monthly"
                  ? "bg-[#D4AF37] text-[#050A18]"
                  : "bg-white/10 text-white"
              }`}
            >
              Monthly
            </button>
          </div>

          <div className="text-center">
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Total Balance</p>
            <p className="text-6xl font-black text-white mb-8 drop-shadow-lg">{currentEarnings.amount}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-[10px] text-white/50 font-black uppercase mb-1 tracking-tighter">Completed Orders</p>
                <p className="text-2xl font-black text-[#D4AF37]">{currentEarnings.orders}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-[10px] text-white/50 font-black uppercase mb-1 tracking-tighter">Avg per Trip</p>
                <p className="text-2xl font-black text-[#D4AF37]">{currentEarnings.avg}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 -mt-6">
        <div className="bg-[#050A18] rounded-2xl p-5 shadow-2xl shadow-[#0047AB]/20 border border-[#D4AF37]/30 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#D4AF37]/20 rounded-xl">
                <TrendingUp className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Withdraw Funds</p>
                <p className="text-xs text-[#D4AF37] font-medium mt-0.5">Available: ₱18,500</p>
              </div>
            </div>
            <button className="px-6 py-2.5 bg-[#D4AF37] text-[#050A18] rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#D4AF37]/20 active:scale-95 transition-all">
              Cash Out
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Earnings</h2>
            <button className="text-[10px] text-[#0047AB] font-black uppercase flex items-center gap-1 tracking-widest">
              <Download className="w-4 h-4" />
              Statement
            </button>
          </div>
          <div className="space-y-3">
            {recentEarnings.map((earning) => (
              <div
                key={earning.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#D4AF37]/10 p-3 rounded-2xl">
                    <DollarSign className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{earning.service}</p>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-tighter">
                      <Calendar className="w-3 h-3" />
                      <span>{earning.time}</span>
                    </div>
                  </div>
                </div>
                <p className="font-black text-[#0047AB]">{earning.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
