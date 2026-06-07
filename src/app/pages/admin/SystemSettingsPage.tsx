import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  Smartphone, 
  QrCode, 
  Coins, 
  Bike, 
  Truck,
  Package,
  ArrowRightLeft,
  Navigation,
  FileCheck
} from 'lucide-react';

interface FareSetting {
  baseFee: number;
  perKmFee: number;
}

interface FaresObject {
  [key: string]: FareSetting;
}

export const SystemSettingsPage: React.FC = () => {
  const [gcashNumber, setGcashNumber] = useState('');
  const [gcashQrCode, setGcashQrCode] = useState('');
  
  // Fare states
  const [pabiliBase, setPabiliBase] = useState(50);
  const [pabiliPerKm, setPabiliPerKm] = useState(10);
  
  const [pahatodBase, setPahatodBase] = useState(50);
  const [pahatodPerKm, setPahatodPerKm] = useState(10);
  
  const [pakuhaBase, setPakuhaBase] = useState(50);
  const [pakuhaPerKm, setPakuhaPerKm] = useState(10);
  
  const [pasugoBase, setPasugoBase] = useState(50);
  const [pasugoPerKm, setPasugoPerKm] = useState(10);
  
  const [motorcycleBase, setMotorcycleBase] = useState(50);
  const [motorcyclePerKm, setMotorcyclePerKm] = useState(10);
  
  const [baobaoBase, setBaobaoBase] = useState(60);
  const [baobaoPerKm, setBaobaoPerKm] = useState(12);
  
  const [wheelsBase, setWheelsBase] = useState(100);
  const [wheelsPerKm, setWheelsPerKm] = useState(20);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/auth/system-settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (response.ok && data.success) {
        const settings = data.data;
        setGcashNumber(settings.gcashNumber || '');
        setGcashQrCode(settings.gcashQrCode || '');
        
        if (settings.fares) {
          const f: FaresObject = settings.fares;
          if (f['PABILI']) {
            setPabiliBase(f['PABILI'].baseFee);
            setPabiliPerKm(f['PABILI'].perKmFee);
          }
          if (f['PAHATOD']) {
            setPahatodBase(f['PAHATOD'].baseFee);
            setPahatodPerKm(f['PAHATOD'].perKmFee);
          }
          if (f['PAKUHA']) {
            setPakuhaBase(f['PAKUHA'].baseFee);
            setPakuhaPerKm(f['PAKUHA'].perKmFee);
          }
          if (f['PASUGO']) {
            setPasugoBase(f['PASUGO'].baseFee);
            setPasugoPerKm(f['PASUGO'].perKmFee);
          }
          if (f['Motorcycle']) {
            setMotorcycleBase(f['Motorcycle'].baseFee);
            setMotorcyclePerKm(f['Motorcycle'].perKmFee);
          }
          if (f['Bao-Bao']) {
            setBaobaoBase(f['Bao-Bao'].baseFee);
            setBaobaoPerKm(f['Bao-Bao'].perKmFee);
          }
          if (f['4-wheels']) {
            setWheelsBase(f['4-wheels'].baseFee);
            setWheelsPerKm(f['4-wheels'].perKmFee);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching system settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const updatedFares = {
      PABILI: { baseFee: Number(pabiliBase), perKmFee: Number(pabiliPerKm) },
      PAHATOD: { baseFee: Number(pahatodBase), perKmFee: Number(pahatodPerKm) },
      PAKUHA: { baseFee: Number(pakuhaBase), perKmFee: Number(pakuhaPerKm) },
      PASUGO: { baseFee: Number(pasugoBase), perKmFee: Number(pasugoPerKm) },
      Motorcycle: { baseFee: Number(motorcycleBase), perKmFee: Number(motorcyclePerKm) },
      'Bao-Bao': { baseFee: Number(baobaoBase), perKmFee: Number(baobaoPerKm) },
      '4-wheels': { baseFee: Number(wheelsBase), perKmFee: Number(wheelsPerKm) }
    };

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          gcashNumber,
          gcashQrCode,
          fares: updatedFares
        })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: 'System configuration updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update configuration.' });
      }
    } catch (err) {
      console.error('Error updating system settings:', err);
      setMessage({ type: 'error', text: 'Network connection error. Server unreachable.' });
    } finally {
      setIsSaving(false);
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

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#111827]/40 p-6 rounded-2xl border border-gray-800/40 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-indigo-400" />
            <span>System Configuration Settings</span>
          </h2>
          <p className="text-gray-400 text-sm mt-1 font-medium">
            Manage rider weekly dues cashout targets and customize base rates or per-km values globally.
          </p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border font-bold text-sm ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/25 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Card 1: GCash Cashout Settings */}
        <div className="bg-[#111827]/40 border border-gray-800/40 rounded-2xl p-6 backdrop-blur-md space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-gray-800/60 pb-3">
            <Smartphone className="w-5 h-5 text-indigo-400" />
            <span>Rider Cashout & GCash Ledger Configurations</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">GCash Account Number</label>
              <input
                type="text"
                value={gcashNumber}
                onChange={(e) => setGcashNumber(e.target.value)}
                placeholder="e.g. 0912-345-6789"
                className="w-full bg-gray-900/50 border border-gray-800/80 rounded-xl py-3 px-4 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">GCash Payment QR Image Link</label>
              <div className="relative">
                <QrCode className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={gcashQrCode}
                  onChange={(e) => setGcashQrCode(e.target.value)}
                  placeholder="https://example.com/qr-code.jpg"
                  className="w-full bg-gray-900/50 border border-gray-800/80 rounded-xl py-3 pl-12 pr-4 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Core Errand Services Fares */}
        <div className="bg-[#111827]/40 border border-gray-800/40 rounded-2xl p-6 backdrop-blur-md space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-gray-800/60 pb-3">
            <Package className="w-5 h-5 text-indigo-400" />
            <span>Delivery & Logistics Fares (Per Km Calculations)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            
            {/* Pabili */}
            <div className="space-y-3 p-4 bg-gray-900/10 border border-gray-800/40 rounded-xl">
              <h4 className="font-extrabold text-sm text-indigo-300 uppercase tracking-wider">Pabili (Shopping)</h4>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Base Fee (₱)</label>
                <input
                  type="number"
                  value={pabiliBase}
                  onChange={(e) => setPabiliBase(Number(e.target.value))}
                  className="w-full bg-gray-950/40 border border-gray-800 rounded-lg py-2 px-3 text-sm text-gray-200 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Per Km Rate (₱)</label>
                <input
                  type="number"
                  value={pabiliPerKm}
                  onChange={(e) => setPabiliPerKm(Number(e.target.value))}
                  className="w-full bg-gray-950/40 border border-gray-800 rounded-lg py-2 px-3 text-sm text-gray-200 font-bold"
                />
              </div>
            </div>

            {/* Pahatod */}
            <div className="space-y-3 p-4 bg-gray-900/10 border border-gray-800/40 rounded-xl">
              <h4 className="font-extrabold text-sm text-indigo-300 uppercase tracking-wider">Pahatod (Courier)</h4>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Base Fee (₱)</label>
                <input
                  type="number"
                  value={pahatodBase}
                  onChange={(e) => setPahatodBase(Number(e.target.value))}
                  className="w-full bg-gray-950/40 border border-gray-800 rounded-lg py-2 px-3 text-sm text-gray-200 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Per Km Rate (₱)</label>
                <input
                  type="number"
                  value={pahatodPerKm}
                  onChange={(e) => setPahatodPerKm(Number(e.target.value))}
                  className="w-full bg-gray-950/40 border border-gray-800 rounded-lg py-2 px-3 text-sm text-gray-200 font-bold"
                />
              </div>
            </div>

            {/* Pakuha */}
            <div className="space-y-3 p-4 bg-gray-900/10 border border-gray-800/40 rounded-xl">
              <h4 className="font-extrabold text-sm text-indigo-300 uppercase tracking-wider">Pakuha (Claims)</h4>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Base Fee (₱)</label>
                <input
                  type="number"
                  value={pakuhaBase}
                  onChange={(e) => setPakuhaBase(Number(e.target.value))}
                  className="w-full bg-gray-950/40 border border-gray-800 rounded-lg py-2 px-3 text-sm text-gray-200 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Per Km Rate (₱)</label>
                <input
                  type="number"
                  value={pakuhaPerKm}
                  onChange={(e) => setPakuhaPerKm(Number(e.target.value))}
                  className="w-full bg-gray-950/40 border border-gray-800 rounded-lg py-2 px-3 text-sm text-gray-200 font-bold"
                />
              </div>
            </div>

            {/* Pasugo */}
            <div className="space-y-3 p-4 bg-gray-900/10 border border-gray-800/40 rounded-xl">
              <h4 className="font-extrabold text-sm text-indigo-300 uppercase tracking-wider">Pasugo (Tasks)</h4>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Base Fee (₱)</label>
                <input
                  type="number"
                  value={pasugoBase}
                  onChange={(e) => setPasugoBase(Number(e.target.value))}
                  className="w-full bg-gray-950/40 border border-gray-800 rounded-lg py-2 px-3 text-sm text-gray-200 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Per Km Rate (₱)</label>
                <input
                  type="number"
                  value={pasugoPerKm}
                  onChange={(e) => setPasugoPerKm(Number(e.target.value))}
                  className="w-full bg-gray-950/40 border border-gray-800 rounded-lg py-2 px-3 text-sm text-gray-200 font-bold"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Card 3: FMU Ride Vehicle Class Fares */}
        <div className="bg-[#111827]/40 border border-gray-800/40 rounded-2xl p-6 backdrop-blur-md space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-gray-800/60 pb-3">
            <Bike className="w-5 h-5 text-indigo-400" />
            <span>FMU Ride Vehicle Fares (Ride-Sharing Calculations)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Motorcycle */}
            <div className="space-y-3 p-4 bg-gray-900/10 border border-gray-800/40 rounded-xl">
              <div className="flex items-center gap-2">
                <Bike className="w-5 h-5 text-indigo-300" />
                <h4 className="font-extrabold text-sm text-indigo-300 uppercase tracking-wider">Motorcycle</h4>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Base Fee (₱)</label>
                <input
                  type="number"
                  value={motorcycleBase}
                  onChange={(e) => setMotorcycleBase(Number(e.target.value))}
                  className="w-full bg-gray-950/40 border border-gray-800 rounded-lg py-2 px-3 text-sm text-gray-200 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Per Km Rate (₱)</label>
                <input
                  type="number"
                  value={motorcyclePerKm}
                  onChange={(e) => setMotorcyclePerKm(Number(e.target.value))}
                  className="w-full bg-gray-950/40 border border-gray-800 rounded-lg py-2 px-3 text-sm text-gray-200 font-bold"
                />
              </div>
            </div>

            {/* Bao-Bao */}
            <div className="space-y-3 p-4 bg-gray-900/10 border border-gray-800/40 rounded-xl">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-indigo-300" />
                <h4 className="font-extrabold text-sm text-indigo-300 uppercase tracking-wider">Bao-Bao (Tricycle)</h4>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Base Fee (₱)</label>
                <input
                  type="number"
                  value={baobaoBase}
                  onChange={(e) => setBaobaoBase(Number(e.target.value))}
                  className="w-full bg-gray-950/40 border border-gray-800 rounded-lg py-2 px-3 text-sm text-gray-200 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Per Km Rate (₱)</label>
                <input
                  type="number"
                  value={baobaoPerKm}
                  onChange={(e) => setBaobaoPerKm(Number(e.target.value))}
                  className="w-full bg-gray-950/40 border border-gray-800 rounded-lg py-2 px-3 text-sm text-gray-200 font-bold"
                />
              </div>
            </div>

            {/* 4-wheels */}
            <div className="space-y-3 p-4 bg-gray-900/10 border border-gray-800/40 rounded-xl">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-300" />
                <h4 className="font-extrabold text-sm text-indigo-300 uppercase tracking-wider">4-Wheels (Car)</h4>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Base Fee (₱)</label>
                <input
                  type="number"
                  value={wheelsBase}
                  onChange={(e) => setWheelsBase(Number(e.target.value))}
                  className="w-full bg-gray-950/40 border border-gray-800 rounded-lg py-2 px-3 text-sm text-gray-200 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Per Km Rate (₱)</label>
                <input
                  type="number"
                  value={wheelsPerKm}
                  onChange={(e) => setWheelsPerKm(Number(e.target.value))}
                  className="w-full bg-gray-950/40 border border-gray-800 rounded-lg py-2 px-3 text-sm text-gray-200 font-bold"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-sm uppercase px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-5 h-5 rounded-full border-2 border-t-transparent border-white animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>Save System Configuration</span>
          </button>
        </div>

      </form>
    </div>
  );
};
