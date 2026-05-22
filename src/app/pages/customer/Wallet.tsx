import { useNavigate } from "react-router";
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, CreditCard, ArrowLeft } from "lucide-react";

export function CustomerWallet() {
  const navigate = useNavigate();
  const transactions = [
    { id: "1", type: "debit", amount: "₱350", description: "Pabili - Jollibee", date: "May 7, 2026" },
    { id: "2", type: "credit", amount: "₱500", description: "Top Up", date: "May 6, 2026" },
    { id: "3", type: "debit", amount: "₱150", description: "Pahatod Service", date: "May 5, 2026" },
    { id: "4", type: "debit", amount: "₱200", description: "Pakuha Service", date: "May 4, 2026" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="bg-gradient-to-br from-[#0047AB] to-[#003380] text-white p-6 pb-12 shadow-2xl">
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
            >
              <ArrowLeft className="w-6 h-6 text-[#D4AF37]" />
            </button>
            <h1 className="text-2xl font-black uppercase tracking-tight italic">Digital Wallet</h1>
          </div>
          <Wallet className="w-6 h-6 text-[#D4AF37]" />
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-inner">
          <div className="mb-8">
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Available Balance</p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-white tracking-tighter italic">₱1,250</span>
              <span className="text-xl font-bold text-[#D4AF37] opacity-80">.00</span>
            </div>
          </div>
          <button className="w-full bg-[#D4AF37] text-[#050A18] py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-[0_0_30px_rgba(212,175,55,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />
            <span>Top Up Credits</span>
          </button>
        </div>
      </div>

      <div className="p-6 mt-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="w-4 h-4 text-red-500" />
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Spent</p>
            </div>
            <p className="text-xl font-black text-gray-900 tracking-tight">₱1,200</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownLeft className="w-4 h-4 text-[#0047AB]" />
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Added</p>
            </div>
            <p className="text-xl font-black text-gray-900 tracking-tight">₱2,000</p>
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 mb-4">Recent Transactions</h2>
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    transaction.type === "credit" ? "bg-green-100" : "bg-red-100"
                  }`}>
                    {transaction.type === "credit" ? (
                      <ArrowDownLeft className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-xs text-gray-500">{transaction.date}</p>
                  </div>
                </div>
                <p className={`font-semibold ${
                  transaction.type === "credit" ? "text-green-600" : "text-gray-900"
                }`}>
                  {transaction.type === "credit" ? "+" : "-"}{transaction.amount}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <button 
            onClick={() => navigate("/customer/payment-methods")}
            className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <CreditCard className="w-5 h-5" />
            Manage Payment Methods
          </button>
        </div>
      </div>
    </div>
  );
}
