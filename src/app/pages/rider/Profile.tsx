import { Link, useNavigate } from "react-router";
import { User, MapPin, Phone, Mail, ChevronRight, LogOut, Bell, Shield, HelpCircle, FileText, Star } from "lucide-react";

export function RiderProfile() {
  const navigate = useNavigate();
  const menuItems = [
    { icon: User, label: "Edit Profile", path: "/rider/edit-profile" },
    { icon: FileText, label: "Documents", path: "/rider/documents" },
    { icon: Star, label: "Performance & Reviews", path: "/rider/performance" },
    { icon: MapPin, label: "Service Areas", path: "/rider/areas" },
    { icon: Bell, label: "Notifications Settings", path: "/rider/notifications-settings" },
    { icon: Shield, label: "Privacy & Security", path: "/rider/privacy-settings" },
    { icon: HelpCircle, label: "Help & Support", path: "/rider/help" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#050A18] text-white p-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-[#D4AF37] text-sm mt-1 uppercase font-bold tracking-wider">Rider Partner</p>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#050A18] to-[#0047AB] rounded-full flex items-center justify-center border-2 border-[#D4AF37]/30 shadow-xl">
              <User className="w-10 h-10 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Mark Santos</h2>
              <p className="text-sm text-gray-600">Rider</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="px-2 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-bold rounded border border-[#D4AF37]/20">
                  ⭐ 4.9
                </div>
                <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                  185 deliveries
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">mark.santos@email.com</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">0912 345 6789</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Buhangin, Butuan City, Agusan del Norte</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={index}
                to={item.path}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900 font-medium">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            );
          })}
        </div>

        <button 
          onClick={() => navigate("/")}
          className="w-full bg-red-50 text-red-600 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
