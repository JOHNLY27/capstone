import { Link, useNavigate } from "react-router";
import { User, MapPin, Phone, Mail, ChevronRight, LogOut, Bell, Shield, HelpCircle, Heart } from "lucide-react";

export function CustomerProfile() {
  const navigate = useNavigate();
  const menuItems = [
    { icon: User, label: "Edit Profile", path: "/customer/edit-profile" },
    { icon: MapPin, label: "Saved Addresses", path: "/customer/addresses" },
    { icon: Bell, label: "Notifications Settings", path: "/customer/notifications-settings" },
    { icon: Shield, label: "Privacy & Security", path: "/customer/privacy-settings" },
    { icon: Heart, label: "Favorite Riders", path: "/customer/favorite-riders" },
    { icon: HelpCircle, label: "Help & Support", path: "/customer/help" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0047AB] text-white p-6 shadow-xl relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
        
        <h1 className="text-2xl font-black uppercase tracking-tight italic">Profile</h1>
        <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] mt-1 relative z-10">Personal Command Center</p>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#0047AB] to-[#003380] rounded-full flex items-center justify-center border-2 border-[#D4AF37]/30 shadow-xl">
              <User className="w-10 h-10 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Juan Dela Cruz</h2>
              <p className="text-sm text-gray-600">Customer</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 font-medium">juan.delacruz@email.com</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 font-medium">0912 345 6789</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 font-medium">Buhangin, Butuan City</span>
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
                  <Icon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900 font-bold text-sm">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </Link>
            );
          })}
        </div>

        <button 
          onClick={() => navigate("/login")}
          className="w-full bg-red-50 text-red-600 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-red-100 transition-all active:scale-95"
        >
          <LogOut className="w-5 h-5" />
          Logout Command
        </button>
      </div>
    </div>
  );
}
