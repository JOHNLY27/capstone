import { useNavigate } from "react-router";
import { ChevronLeft, CreditCard, Plus, Trash2, Smartphone } from "lucide-react";

export function PaymentMethods() {
  const navigate = useNavigate();

  const methods = [
    {
      id: "1",
      type: "card",
      label: "Visa ending in 4242",
      expiry: "12/28",
      isDefault: true,
    },
    {
      id: "2",
      type: "ewallet",
      label: "GCash",
      info: "0912 **** 6789",
      isDefault: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white p-6">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Payment Methods</h1>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {methods.map((method) => (
          <div
            key={method.id}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-lg">
                  {method.type === "card" ? (
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  ) : (
                    <Smartphone className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{method.label}</h3>
                  {method.expiry && (
                    <p className="text-xs text-gray-500">Expires {method.expiry}</p>
                  )}
                  {method.info && (
                    <p className="text-xs text-gray-500">{method.info}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {method.isDefault && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase">
                    Default
                  </span>
                )}
                <button className="text-gray-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="grid grid-cols-1 gap-3 mt-6">
          <button 
            onClick={() => alert("Add Credit/Debit Card flow...")}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium flex items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-600 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add New Card
          </button>
          <button 
            onClick={() => alert("Link E-Wallet flow...")}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium flex items-center justify-center gap-2 hover:border-blue-500 hover:text-blue-600 transition-all"
          >
            <Plus className="w-5 h-5" />
            Link GCash / Maya
          </button>
        </div>
      </div>
    </div>
  );
}
