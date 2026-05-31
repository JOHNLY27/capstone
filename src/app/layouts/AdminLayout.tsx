import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  LogOut, 
  Shield, 
  Menu, 
  X,
  Bell,
  DollarSign,
  MessageSquare
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingWithdrawalsCount, setPendingWithdrawalsCount] = useState(0);

  const fetchPendingCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setPendingCount(data.data.stats.pendingApprovals);
        setPendingWithdrawalsCount(data.data.stats.pendingWithdrawals || 0);
      }
    } catch (err) {
      console.error('Error fetching pending approvals count in layout:', err);
    }
  };

  useEffect(() => {
    // Check if user is logged in as ADMIN
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    if (!token || role !== 'ADMIN') {
      navigate('/login');
      return;
    }

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const navItems = [
    {
      label: 'Dashboard',
      path: '/admin',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: 'Rider Approvals',
      path: '/admin/approvals',
      icon: <UserCheck className="w-5 h-5" />,
      badge: pendingCount > 0 ? pendingCount : undefined
    },
    {
      label: 'Withdrawals',
      path: '/admin/withdrawals',
      icon: <DollarSign className="w-5 h-5" />,
      badge: pendingWithdrawalsCount > 0 ? pendingWithdrawalsCount : undefined
    },
    {
      label: 'Users Directory',
      path: '/admin/users',
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: 'Support Chats',
      path: '/admin/support',
      icon: <MessageSquare className="w-5 h-5" />,
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Background radial glowing gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px]" />
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#111827]/80 backdrop-blur-xl border-r border-gray-800/60 p-6 z-10">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 py-4 mb-8 border-b border-gray-800/40">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent italic tracking-wider">
              FETCH ME UP
            </h1>
            <span className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase">Admin Terminal</span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-600/15 scale-[1.02]' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/40 hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`transition-transform duration-300 ${isActive ? 'rotate-0' : 'group-hover:rotate-12'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="pt-6 border-t border-gray-800/40">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden" onClick={() => setIsMobileOpen(false)}>
          <aside 
            className="w-64 h-full bg-[#111827] p-6 flex flex-col justify-between border-r border-gray-800"
            onClick={e => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-indigo-400" />
                  <span className="font-bold text-sm tracking-wider">FETCH ME UP ADMIN</span>
                </div>
                <button onClick={() => setIsMobileOpen(false)}>
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                        isActive 
                          ? 'bg-indigo-600 text-white' 
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 z-10">
        {/* Top Navbar */}
        <header className="h-16 border-b border-gray-800/40 bg-[#111827]/40 backdrop-blur-md px-6 flex items-center justify-between md:justify-end gap-4">
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden p-2 rounded-lg bg-gray-800 text-gray-300"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-gray-800/50 text-gray-400 hover:text-white transition-all">
              <Bell className="w-5 h-5" />
              {pendingCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
              )}
            </button>
            <div className="flex items-center gap-3 border-l border-gray-800/60 pl-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-extrabold text-sm text-white border border-indigo-400/20">
                A
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-gray-200">System Admin</p>
                <p className="text-[10px] text-gray-400 font-semibold">admin@fetchmeup.com</p>
              </div>
            </div>
          </div>
        </header>

        {/* Child Router Outlets */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
