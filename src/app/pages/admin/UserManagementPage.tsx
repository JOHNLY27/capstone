import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MapPin, 
  Coins, 
  Mail, 
  Phone,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface UserDirectoryEntry {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'RIDER' | 'ADMIN';
  walletBalance: string;
  isVerified: boolean;
  createdAt: string;
}

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserDirectoryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'CUSTOMER' | 'RIDER' | 'ADMIN'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setUsers(data.data.users);
      }
    } catch (err) {
      console.error('Error fetching users list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchUsers();
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

  // Filtered users matching search query and role filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery);

    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#111827]/40 p-6 rounded-2xl border border-gray-800/40 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Users Directory Database
          </h2>
          <p className="text-gray-400 text-sm mt-1 font-medium">
            Search, filter, and inspect accounts, balances, and verification states across the platform.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700/40 text-gray-200 text-xs font-bold uppercase transition-colors"
        >
          Refresh Directory
        </button>
      </div>

      {/* Search and Filters panel */}
      <div className="bg-[#111827]/40 border border-gray-800/40 rounded-2xl p-6 backdrop-blur-md flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-800/80 rounded-xl py-3 pl-12 pr-4 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
        </div>

        {/* Role Filters Tabs */}
        <div className="flex bg-gray-950/40 p-1.5 rounded-xl border border-gray-800/40 w-full md:w-auto overflow-x-auto gap-2">
          {(['ALL', 'CUSTOMER', 'RIDER', 'ADMIN'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all tracking-wider ${
                roleFilter === role
                  ? 'bg-[#1F2937] text-white shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/25'
              }`}
            >
              {role === 'ALL' ? 'Show All' : `${role}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Users Database Grid Table */}
      <div className="bg-[#111827]/40 border border-gray-800/40 rounded-2xl p-6 backdrop-blur-md">
        {filteredUsers.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-8 bg-gray-900/10 border border-dashed border-gray-800 rounded-xl">
            <Users className="w-12 h-12 text-gray-600 mb-3" />
            <p className="text-gray-300 font-bold">No accounts found</p>
            <p className="text-gray-500 text-xs mt-1">Try expanding your search query or switching your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800/60 text-gray-400 text-[10px] font-bold tracking-widest uppercase">
                  <th className="py-4 px-4">User Details</th>
                  <th className="py-4 px-4">Phone / Contact</th>
                  <th className="py-4 px-4">Account Role</th>
                  <th className="py-4 px-4">Wallet Balance</th>
                  <th className="py-4 px-4">Verification</th>
                  <th className="py-4 px-4">Registration Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="text-sm text-gray-300 hover:bg-gray-800/15 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-bold text-white text-base">{user.name}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-gray-500" />
                        <span>{user.email}</span>
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-xs font-mono font-bold text-gray-300 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-500" />
                        <span>{user.phone}</span>
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      {user.role === 'CUSTOMER' && (
                        <span className="bg-blue-500/10 border border-blue-500/25 text-blue-400 text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg">
                          Customer
                        </span>
                      )}
                      {user.role === 'RIDER' && (
                        <span className="bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg">
                          Rider
                        </span>
                      )}
                      {user.role === 'ADMIN' && (
                        <span className="bg-purple-500/10 border border-purple-500/25 text-purple-400 text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg">
                          Administrator
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-extrabold text-emerald-400 text-sm flex items-center gap-1">
                        <Coins className="w-4 h-4 text-emerald-500/60" />
                        <span>₱{Number(user.walletBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      {user.role === 'RIDER' ? (
                        user.isVerified ? (
                          <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                            <CheckCircle className="w-4 h-4" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-yellow-400 text-xs font-bold animate-pulse">
                            <AlertCircle className="w-4 h-4" />
                            <span>Verification Pending</span>
                          </span>
                        )
                      ) : (
                        <span className="text-gray-500 text-xs font-semibold">Auto-Activated</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-400 font-medium">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
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
