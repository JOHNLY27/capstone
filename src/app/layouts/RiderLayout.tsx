import { Outlet, Link, useLocation } from "react-router";
import { Home, Navigation, DollarSign, History, User } from "lucide-react";

export function RiderLayout() {
  const location = useLocation();

  const navItems = [
    { path: "/rider", icon: Home, label: "Home" },
    { path: "/rider/delivery/active", icon: Navigation, label: "Delivery" },
    { path: "/rider/earnings", icon: DollarSign, label: "Earnings" },
    { path: "/rider/history", icon: History, label: "History" },
    { path: "/rider/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive ? "text-green-600" : "text-gray-600"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
