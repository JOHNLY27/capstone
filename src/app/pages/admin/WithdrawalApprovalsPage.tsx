import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  Clock, 
  ThumbsUp, 
  DollarSign, 
  Smartphone, 
  User, 
  AlertCircle
} from 'lucide-react';

interface WithdrawalTransaction {
  id: string;
  userId: string;
  amount: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  referenceCode: string;
  description: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
  };
}

export const WithdrawalApprovalsPage: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchWithdrawals = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/admin/withdrawals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setWithdrawals(data.data.withdrawals || []);
      }
    } catch (err) {
      console.error('Error fetching withdrawals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleVerify = async (id: string, status: 'APPROVED' | 'REJECTED', name: string, amount: string) => {
    const actionText = status === 'APPROVED' ? 'APPROVE and confirm release of' : 'REJECT and REFUND';
    const confirmation = window.confirm(
      `Are you sure you want to ${actionText} ₱${parseFloat(amount).toFixed(2)} requested by ${name}?`
    );
    if (!confirmation) return;

    setActioningId(id);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/admin/withdrawals/${id}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update withdrawal status.');
      }

      await fetchWithdrawals();
      alert(`Withdrawal request of ₱${parseFloat(amount).toFixed(2)} by ${name} has been ${status === 'APPROVED' ? 'Approved & Cleared' : 'Rejected & Refunded'}.`);
    } catch (err: any) {
      console.error('Withdrawal settlement error:', err);
      alert(err.message || 'Error occurred while processing withdrawal.');
    } finally {
      setActioningId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-indigo-500 animate-spin" />
          <div className="absolute inset-0 m-auto w-6 h-6 rounded-full bg-indigo-500/20 blur-sm" />
        </div>
      </div>
    );
  }

  const pendingWithdrawals = withdrawals.filter(w => w.status === 'PENDING');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#111827]/40 p-6 rounded-2xl border border-gray-800/40 backdrop-blur-md">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-indigo-400" />
          <span>Withdrawal Settlements</span>
        </h2>
        <p className="text-gray-400 text-sm mt-1 font-medium">
          Confirm or decline incoming rider cash-out requests. Declining will automatically refund their digital wallet instantly.
        </p>
      </div>

      {/* Pending Withdrawals */}
      <div className="bg-[#111827]/40 border border-gray-800/40 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-gray-200">
            Pending Settlements ({pendingWithdrawals.length})
          </h3>
        </div>

        {pendingWithdrawals.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-8 bg-gray-900/10 border border-dashed border-gray-800 rounded-xl">
            <ThumbsUp className="w-12 h-12 text-indigo-400/80 mb-3 animate-bounce" />
            <p className="text-gray-200 font-extrabold text-base">All cleared up!</p>
            <p className="text-gray-500 text-xs mt-1">There are no pending wallet withdrawal requests awaiting approval.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800/60 text-gray-400 text-[10px] font-bold tracking-widest uppercase">
                  <th className="py-4 px-4">User Details</th>
                  <th className="py-4 px-4">Withdrawal Details</th>
                  <th className="py-4 px-4">Reference Code</th>
                  <th className="py-4 px-4">Amount Requested</th>
                  <th className="py-4 px-4">Requested Date</th>
                  <th className="py-4 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {pendingWithdrawals.map((withdraw) => {
                  const channel = withdraw.description.toLowerCase().includes('maya') ? 'Maya' : 'GCash';
                  return (
                    <tr key={withdraw.id} className="text-sm text-gray-300 hover:bg-gray-800/15 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400">
                            {withdraw.user?.name ? withdraw.user.name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-white text-base">{withdraw.user?.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-500/35 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wide">
                                {withdraw.user?.role}
                              </span>
                              <span className="text-xs text-gray-400">{withdraw.user?.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-bold text-gray-200">{channel} payout</p>
                            <p className="text-xs text-gray-400 font-semibold">{withdraw.user?.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-indigo-400">
                        {withdraw.referenceCode}
                      </td>
                      <td className="py-4 px-4 font-black text-emerald-400 text-base">
                        ₱{parseFloat(withdraw.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-4 text-gray-400 font-medium">
                        {new Date(withdraw.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            disabled={actioningId !== null}
                            onClick={() => handleVerify(withdraw.id, 'APPROVED', withdraw.user?.name, withdraw.amount)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-lg border border-emerald-500/30 font-semibold text-xs transition-all duration-300 active:scale-95 disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Confirm Release</span>
                          </button>
                          
                          <button
                            disabled={actioningId !== null}
                            onClick={() => handleVerify(withdraw.id, 'REJECTED', withdraw.user?.name, withdraw.amount)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg border border-red-500/30 font-semibold text-xs transition-all duration-300 active:scale-95 disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject & Refund</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
