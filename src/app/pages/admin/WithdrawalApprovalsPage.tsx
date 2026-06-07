import React, { useState, useEffect } from 'react';
import {
  Check,
  X,
  Clock,
  ThumbsUp,
  DollarSign,
  Smartphone,
  AlertCircle,
  QrCode,
  Save,
  Image as ImageIcon
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

  // GCash Dynamic Settings states
  const [gcashNumber, setGcashNumber] = useState('0912-345-6789');
  const [gcashQrCode, setGcashQrCode] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

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

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/auth/system-settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setGcashNumber(data.data.gcashNumber || '0912-345-6789');
        setGcashQrCode(data.data.gcashQrCode || '');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
    fetchSettings();
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File is too large. Please select an image under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setGcashQrCode(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gcashNumber.trim()) {
      alert('GCash Mobile Number is required.');
      return;
    }

    setIsSavingSettings(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          gcashNumber: gcashNumber.trim(),
          gcashQrCode
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        alert('GCash platform credentials updated successfully!');
      } else {
        alert(data.error || 'Failed to update credentials.');
      }
    } catch (err) {
      console.error('Error saving configurations:', err);
      alert('Unable to connect to system API.');
    } finally {
      setIsSavingSettings(false);
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
          <span>Rider Weekly Fee Settlements</span>
        </h2>
        <p className="text-gray-400 text-sm mt-1 font-medium">
          Verify and audit incoming GCash manual payment reference numbers submitted by riders for their ₱50.00 weekly administrative dues.
        </p>
      </div>

      {/* Grid Layout: Config panel and Table list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Official Payment Config - Left Column (1/3) */}
        <div className="lg:col-span-1 bg-[#111827]/40 border border-gray-800/40 rounded-2xl p-6 backdrop-blur-md space-y-6">
          <div className="flex items-center gap-3 mb-2 border-b border-gray-800/50 pb-4">
            <QrCode className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-gray-200">
              Official GCash Settings
            </h3>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-5">
            {/* Phone Number Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">
                GCash Remittance No.
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
                <input
                  type="text"
                  value={gcashNumber}
                  onChange={(e) => setGcashNumber(e.target.value)}
                  placeholder="e.g. 0912-345-6789"
                  className="w-full bg-[#0E131F]/80 border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-white tracking-wide focus:outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>
            </div>

            {/* QR Code Upload Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">
                Official QR Code Image
              </label>

              <div className="flex flex-col items-center justify-center p-4 bg-[#0E131F]/50 border border-gray-850 rounded-xl min-h-[220px]">
                {gcashQrCode ? (
                  <div className="relative group">
                    <img
                      src={gcashQrCode}
                      alt="Official GCash QR"
                      className="w-44 h-44 object-contain rounded-lg border border-gray-850 bg-white p-1"
                    />
                    <button
                      type="button"
                      onClick={() => setGcashQrCode('')}
                      className="absolute -top-2 -right-2 bg-red-500/90 hover:bg-red-500 text-white rounded-full p-1.5 shadow-md active:scale-90 transition-all opacity-0 group-hover:opacity-100"
                      title="Remove QR Image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <QrCode className="w-12 h-12 text-gray-700 mx-auto" />
                    <p className="text-xs text-gray-400 font-semibold">No QR Uploaded</p>
                    <p className="text-[10px] text-gray-500 leading-relaxed max-w-[180px] mx-auto">
                      Upload your official GCash scan-to-pay QR image to show on the Rider's App.
                    </p>
                  </div>
                )}
              </div>

              {/* Styled File Input Button */}
              <div className="mt-2">
                <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-800/40 hover:bg-gray-800 text-gray-300 rounded-xl border border-gray-700/50 font-bold text-xs transition-colors cursor-pointer text-center">
                  <ImageIcon className="w-4 h-4 text-indigo-400" />
                  <span>{gcashQrCode ? 'Change QR Image' : 'Select QR Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={isSavingSettings}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:from-indigo-600/50 disabled:to-blue-600/50 text-white font-bold text-sm rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 mt-4 border border-indigo-500/20"
            >
              {isSavingSettings ? (
                <div className="w-5 h-5 rounded-full border-2 border-t-transparent border-white animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Update GCash Details</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Pending Settlements - Right Column (2/3) */}
        <div className="lg:col-span-2 bg-[#111827]/40 border border-gray-800/40 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-800/50 pb-4">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-gray-200">
              Pending Dues Settlements ({pendingWithdrawals.length})
            </h3>
          </div>

          {pendingWithdrawals.length === 0 ? (
            <div className="h-96 flex flex-col items-center justify-center text-center p-8 bg-gray-900/10 border border-dashed border-gray-800 rounded-xl">
              <ThumbsUp className="w-12 h-12 text-indigo-400/80 mb-3 animate-bounce" />
              <p className="text-gray-200 font-extrabold text-base">All clear!</p>
              <p className="text-gray-500 text-xs mt-1">There are no pending weekly platform dues settlement requests awaiting audit.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800/60 text-gray-400 text-[10px] font-bold tracking-widest uppercase">
                    <th className="py-4 px-4">Rider Details</th>
                    <th className="py-4 px-4">Settlement Details</th>
                    <th className="py-4 px-4">GCash Reference Code</th>
                    <th className="py-4 px-4">Amount Submitted</th>
                    <th className="py-4 px-4">Submission Date</th>
                    <th className="py-4 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {pendingWithdrawals.map((withdraw) => {
                    const isWeeklyFee = withdraw.description.toLowerCase().includes('weekly') || withdraw.description.toLowerCase().includes('platform');
                    const label = isWeeklyFee ? 'Weekly Platform Dues' : 'Rider Settlement';

                    return (
                      <tr key={withdraw.id} className="text-sm text-gray-300 hover:bg-gray-800/15 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400">
                              {withdraw.user?.name ? withdraw.user.name[0].toUpperCase() : 'R'}
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
                              <p className="font-bold text-gray-200">{label}</p>
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
                              <span>Approve Payment</span>
                            </button>

                            <button
                              disabled={actioningId !== null}
                              onClick={() => handleVerify(withdraw.id, 'REJECTED', withdraw.user?.name, withdraw.amount)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg border border-red-500/30 font-semibold text-xs transition-all duration-300 active:scale-95 disabled:opacity-50"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject Reference</span>
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
    </div>
  );
};
