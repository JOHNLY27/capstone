import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Clock, 
  Package, 
  TrendingUp, 
  Activity,
  ArrowRight
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

      {/* Table Section */}
      <div className="bg-[#111827]/40 border border-gray-800/40 rounded-2xl p-6 backdrop-blur-md">
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
    </div>
  );
};
