import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Clock, 
  Package, 
  TrendingUp, 
  Activity,
  ArrowRight,
  Coins,
  Bike,
  ShoppingCart,
  Send,
  Car,
  Save
} from 'lucide-react';
import { Link } from 'react-router';

interface DashboardStats {
  totalCustomers: number;
  totalRiders: number;
  pendingApprovals: number;
  totalOrders: number;
  totalVolume: number;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fares Settings states
  const [fares, setFares] = useState<any>({
    PABILI: { baseFee: '50.00', perKmFee: '10.00' },
    PAHATOD: { baseFee: '50.00', perKmFee: '10.00' },
    PAKUHA: { baseFee: '50.00', perKmFee: '10.00' },
    PASUGO: { baseFee: '50.00', perKmFee: '10.00' },
    Motorcycle: { baseFee: '50.00', perKmFee: '10.00' },
    "Bao-Bao": { baseFee: '60.00', perKmFee: '12.00' },
    "4-wheels": { baseFee: '100.00', perKmFee: '20.00' }
  });
  const [isSavingFares, setIsSavingFares] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch stats
      const statsResponse = await fetch('http://localhost:5000/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsResponse.json();

      if (statsResponse.ok && statsData.success) {
        setStats(statsData.data.stats);
      }

      // Fetch recent orders (using the same customer/rider orders endpoint or all available)
      const ordersResponse = await fetch('http://localhost:5000/api/orders/available', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const ordersData = await ordersResponse.json();
      if (ordersResponse.ok && ordersData.success) {
        setRecentOrders(ordersData.data.orders.slice(0, 5));
      }

      // Fetch fares settings
      const faresResponse = await fetch('http://localhost:5000/api/auth/system-settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const faresData = await faresResponse.json();
      if (faresResponse.ok && faresData.success && faresData.data.fares) {
        const loadedFares: any = {};
        Object.keys(faresData.data.fares).forEach((key) => {
          loadedFares[key] = {
            baseFee: String(faresData.data.fares[key].baseFee ?? faresData.data.fares[key].base ?? '50.00'),
            perKmFee: String(faresData.data.fares[key].perKmFee ?? faresData.data.fares[key].perKm ?? '10.00')
          };
        });
        setFares((prev: any) => ({
          ...prev,
          ...loadedFares
        }));
      }
    } catch (err) {
      console.error('Error fetching dashboard statistics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleFareChange = (service: string, field: 'baseFee' | 'perKmFee', value: string) => {
    setFares((prev: any) => ({
      ...prev,
      [service]: {
        ...prev[service],
        [field]: value
      }
    }));
  };

  const handleSaveFares = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingFares(true);
    try {
      const token = localStorage.getItem('token');
      
      const parsedFares = Object.keys(fares).reduce((acc: any, key: string) => {
        acc[key] = {
          baseFee: Number(fares[key].baseFee) || 0,
          perKmFee: Number(fares[key].perKmFee) || 0
        };
        return acc;
      }, {});

      const response = await fetch('http://localhost:5000/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fares: parsedFares
        })
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        alert('Service fare rates configuration updated successfully!');
      } else {
        alert(data.error || 'Failed to update fare rates.');
      }
    } catch (err) {
      console.error('Error saving fare configurations:', err);
      alert('Unable to connect to system API.');
    } finally {
      setIsSavingFares(false);
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

  const statCards = [
    {
      title: 'Total Customers',
      value: stats?.totalCustomers ?? 0,
      icon: <Users className="w-6 h-6 text-blue-400" />,
      gradient: 'from-blue-500/10 to-indigo-500/5',
      glow: 'group-hover:shadow-blue-500/10',
      border: 'border-blue-500/20 hover:border-blue-500/40'
    },
    {
      title: 'Active Riders',
      value: stats?.totalRiders ?? 0,
      icon: <UserCheck className="w-6 h-6 text-yellow-400" />,
      gradient: 'from-yellow-500/10 to-amber-500/5',
      glow: 'group-hover:shadow-yellow-500/10',
      border: 'border-yellow-500/20 hover:border-yellow-500/40'
    },
    {
      title: 'Pending Approvals',
      value: stats?.pendingApprovals ?? 0,
      icon: <Clock className="w-6 h-6 text-red-400" />,
      gradient: 'from-red-500/10 to-rose-500/5',
      glow: 'group-hover:shadow-red-500/10',
      border: 'border-red-500/20 hover:border-red-500/40',
      badge: (stats?.pendingApprovals ?? 0) > 0 ? 'Review Needed' : undefined
    },
    {
      title: 'Total Errands',
      value: stats?.totalOrders ?? 0,
      icon: <Package className="w-6 h-6 text-purple-400" />,
      gradient: 'from-purple-500/10 to-fuchsia-500/5',
      glow: 'group-hover:shadow-purple-500/10',
      border: 'border-purple-500/20 hover:border-purple-500/40'
    },
    {
      title: 'Transaction Volume',
      value: `₱${(stats?.totalVolume ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
      gradient: 'from-emerald-500/10 to-teal-500/5',
      glow: 'group-hover:shadow-emerald-500/10',
      border: 'border-emerald-500/20 hover:border-emerald-500/40'
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111827]/40 p-6 rounded-2xl border border-gray-800/40 backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Operational Dashboard
          </h2>
          <p className="text-gray-400 text-sm mt-1 font-medium">
            Monitor registration metrics, order volumes, and rider verifications.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
          <Activity className="w-4 h-4 animate-pulse" />
          <span>Real-time Connection</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`group bg-gradient-to-br ${card.gradient} bg-[#111827]/40 backdrop-blur-md border ${card.border} p-6 rounded-2xl flex flex-col justify-between h-36 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl ${card.glow}`}
          >
            <div className="flex items-start justify-between">
              <span className="text-gray-400 text-xs font-bold tracking-wide uppercase">{card.title}</span>
              <div className="p-2 rounded-xl bg-gray-800/40 border border-gray-700/20 shadow-inner group-hover:scale-110 transition-transform duration-300">
                {card.icon}
              </div>
            </div>
            <div className="flex items-end justify-between mt-4">
              <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{card.value}</span>
              {card.badge && (
                <span className="bg-red-500/25 border border-red-500/30 text-red-400 text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider animate-bounce">
                  {card.badge}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Table Section (2/3 width) */}
        <div className="lg:col-span-2 bg-[#111827]/40 border border-gray-800/40 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-200">Active Errand Feeds</h3>
              <p className="text-xs text-gray-400 mt-0.5">Most recent pending requests in Butuan City.</p>
            </div>
            <Link
              to="/admin/users"
              className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold text-xs uppercase tracking-wider group transition-colors"
            >
              <span>View All Users</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-8 bg-gray-900/10 border border-dashed border-gray-800 rounded-xl">
              <Package className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-gray-300 font-bold">No active pending errands</p>
              <p className="text-gray-500 text-xs mt-1">When customers place orders, they will appear here in real time.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800/60 text-gray-400 text-[10px] font-bold tracking-widest uppercase">
                    <th className="py-4 px-4">Service Type</th>
                    <th className="py-4 px-4">Customer</th>
                    <th className="py-4 px-4">Pickup Address</th>
                    <th className="py-4 px-4">Dropoff Address</th>
                    <th className="py-4 px-4">Delivery Fee</th>
                    <th className="py-4 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="text-sm text-gray-300 hover:bg-gray-800/15 transition-colors">
                      <td className="py-4 px-4 font-bold text-indigo-400">{order.type}</td>
                      <td className="py-4 px-4 font-semibold text-white">{order.customer?.name}</td>
                      <td className="py-4 px-4 text-xs max-w-xs truncate">{order.pickupAddress}</td>
                      <td className="py-4 px-4 text-xs max-w-xs truncate">{order.dropoffAddress}</td>
                      <td className="py-4 px-4 font-extrabold text-emerald-400">₱{Number(order.deliveryFee).toFixed(2)}</td>
                      <td className="py-4 px-4">
                        <span className="bg-yellow-500/15 border border-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Service Fare Rates Configuration Card (1/3 width) */}
        <div className="lg:col-span-1 bg-[#111827]/40 border border-gray-800/40 rounded-2xl p-6 backdrop-blur-md space-y-6">
          <div className="flex items-center gap-3 mb-2 border-b border-gray-800/50 pb-4">
            <Coins className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-gray-200">
              Service Fare Configuration
            </h3>
          </div>

          <form onSubmit={handleSaveFares} className="space-y-5">
            
            {/* Pabili */}
            <div className="space-y-3 p-4 bg-[#0E131F]/40 border border-gray-800/60 rounded-xl">
              <div className="flex items-center gap-2 text-indigo-400">
                <ShoppingCart className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">🛒 Pabili Service</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-gray-555 uppercase tracking-widest block">Base Fee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">₱</span>
                    <input
                      type="text"
                      value={fares.PABILI.baseFee}
                      onChange={(e) => handleFareChange('PABILI', 'baseFee', e.target.value)}
                      className="w-full bg-[#0B0F19]/80 border border-gray-850 rounded-lg pl-7 pr-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-gray-555 uppercase tracking-widest block">Per Km Fee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">₱</span>
                    <input
                      type="text"
                      value={fares.PABILI.perKmFee}
                      onChange={(e) => handleFareChange('PABILI', 'perKmFee', e.target.value)}
                      className="w-full bg-[#0B0F19]/80 border border-gray-850 rounded-lg pl-7 pr-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pahatod */}
            <div className="space-y-3 p-4 bg-[#0E131F]/40 border border-gray-800/60 rounded-xl">
              <div className="flex items-center gap-2 text-indigo-400">
                <Bike className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">📦 Pahatod (Parcel)</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-gray-555 uppercase tracking-widest block">Base Fee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">₱</span>
                    <input
                      type="text"
                      value={fares.PAHATOD.baseFee}
                      onChange={(e) => handleFareChange('PAHATOD', 'baseFee', e.target.value)}
                      className="w-full bg-[#0B0F19]/80 border border-gray-850 rounded-lg pl-7 pr-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-gray-555 uppercase tracking-widest block">Per Km Fee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">₱</span>
                    <input
                      type="text"
                      value={fares.PAHATOD.perKmFee}
                      onChange={(e) => handleFareChange('PAHATOD', 'perKmFee', e.target.value)}
                      className="w-full bg-[#0B0F19]/80 border border-gray-850 rounded-lg pl-7 pr-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pakuha */}
            <div className="space-y-3 p-4 bg-[#0E131F]/40 border border-gray-800/60 rounded-xl">
              <div className="flex items-center gap-2 text-indigo-400">
                <Package className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">📥 Pakuha Service</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-gray-555 uppercase tracking-widest block">Base Fee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">₱</span>
                    <input
                      type="text"
                      value={fares.PAKUHA.baseFee}
                      onChange={(e) => handleFareChange('PAKUHA', 'baseFee', e.target.value)}
                      className="w-full bg-[#0B0F19]/80 border border-gray-850 rounded-lg pl-7 pr-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-gray-555 uppercase tracking-widest block">Per Km Fee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">₱</span>
                    <input
                      type="text"
                      value={fares.PAKUHA.perKmFee}
                      onChange={(e) => handleFareChange('PAKUHA', 'perKmFee', e.target.value)}
                      className="w-full bg-[#0B0F19]/80 border border-gray-850 rounded-lg pl-7 pr-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pasugo */}
            <div className="space-y-3 p-4 bg-[#0E131F]/40 border border-gray-800/60 rounded-xl">
              <div className="flex items-center gap-2 text-indigo-400">
                <Send className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">✉️ Pasugo Service</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-gray-555 uppercase tracking-widest block">Base Fee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">₱</span>
                    <input
                      type="text"
                      value={fares.PASUGO.baseFee}
                      onChange={(e) => handleFareChange('PASUGO', 'baseFee', e.target.value)}
                      className="w-full bg-[#0B0F19]/80 border border-gray-850 rounded-lg pl-7 pr-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-gray-555 uppercase tracking-widest block">Per Km Fee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">₱</span>
                    <input
                      type="text"
                      value={fares.PASUGO.perKmFee}
                      onChange={(e) => handleFareChange('PASUGO', 'perKmFee', e.target.value)}
                      className="w-full bg-[#0B0F19]/80 border border-gray-850 rounded-lg pl-7 pr-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* FMU Ride - Motorcycle */}
            <div className="space-y-3 p-4 bg-[#0E131F]/40 border border-gray-800/60 rounded-xl">
              <div className="flex items-center gap-2 text-indigo-400">
                <Bike className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">🏍️ FMU Ride (Motorcycle)</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-gray-555 uppercase tracking-widest block">Base Fee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">₱</span>
                    <input
                      type="text"
                      value={fares.Motorcycle?.baseFee || '50.00'}
                      onChange={(e) => handleFareChange('Motorcycle', 'baseFee', e.target.value)}
                      className="w-full bg-[#0B0F19]/80 border border-gray-850 rounded-lg pl-7 pr-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-gray-555 uppercase tracking-widest block">Per Km Fee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">₱</span>
                    <input
                      type="text"
                      value={fares.Motorcycle?.perKmFee || '10.00'}
                      onChange={(e) => handleFareChange('Motorcycle', 'perKmFee', e.target.value)}
                      className="w-full bg-[#0B0F19]/80 border border-gray-850 rounded-lg pl-7 pr-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* FMU Ride - Bao-Bao */}
            <div className="space-y-3 p-4 bg-[#0E131F]/40 border border-gray-800/60 rounded-xl">
              <div className="flex items-center gap-2 text-indigo-400">
                <Car className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">🛺 FMU Ride (Bao-Bao)</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-gray-555 uppercase tracking-widest block">Base Fee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">₱</span>
                    <input
                      type="text"
                      value={fares['Bao-Bao']?.baseFee || '60.00'}
                      onChange={(e) => handleFareChange('Bao-Bao', 'baseFee', e.target.value)}
                      className="w-full bg-[#0B0F19]/80 border border-gray-850 rounded-lg pl-7 pr-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-gray-555 uppercase tracking-widest block">Per Km Fee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">₱</span>
                    <input
                      type="text"
                      value={fares['Bao-Bao']?.perKmFee || '12.00'}
                      onChange={(e) => handleFareChange('Bao-Bao', 'perKmFee', e.target.value)}
                      className="w-full bg-[#0B0F19]/80 border border-gray-850 rounded-lg pl-7 pr-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* FMU Ride - 4-wheels */}
            <div className="space-y-3 p-4 bg-[#0E131F]/40 border border-gray-800/60 rounded-xl">
              <div className="flex items-center gap-2 text-indigo-400">
                <Car className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">🚗 FMU Ride (4-wheels)</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-gray-555 uppercase tracking-widest block">Base Fee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">₱</span>
                    <input
                      type="text"
                      value={fares['4-wheels']?.baseFee || '100.00'}
                      onChange={(e) => handleFareChange('4-wheels', 'baseFee', e.target.value)}
                      className="w-full bg-[#0B0F19]/80 border border-gray-850 rounded-lg pl-7 pr-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-extrabold text-gray-555 uppercase tracking-widest block">Per Km Fee</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">₱</span>
                    <input
                      type="text"
                      value={fares['4-wheels']?.perKmFee || '20.00'}
                      onChange={(e) => handleFareChange('4-wheels', 'perKmFee', e.target.value)}
                      className="w-full bg-[#0B0F19]/80 border border-gray-850 rounded-lg pl-7 pr-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={isSavingFares}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:from-indigo-600/50 disabled:to-blue-600/50 text-white font-bold text-sm rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 mt-4 border border-indigo-500/20"
            >
              {isSavingFares ? (
                <div className="w-5 h-5 rounded-full border-2 border-t-transparent border-white animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Update Fare Rates</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
