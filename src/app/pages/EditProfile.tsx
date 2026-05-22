import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { ChevronLeft, Camera, User, Mail, Phone, MapPin } from "lucide-react";

export function EditProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const isRider = location.pathname.includes("/rider/");
  
  const [name, setName] = useState(isRider ? "Mark Santos" : "Juan Dela Cruz");

  const theme = {
    bg: isRider ? "bg-[#050A18]" : "bg-[#0047AB]",
    gradient: isRider ? "from-[#050A18] to-[#0047AB]" : "from-[#0047AB] to-[#003380]",
    button: isRider ? "bg-[#050A18] text-[#D4AF37] border border-[#D4AF37]/50 hover:bg-[#0a1229]" : "bg-[#0047AB] hover:bg-[#003380]",
    icon: isRider ? "text-[#D4AF37]" : "text-[#0047AB]",
    ring: isRider ? "focus:ring-[#D4AF37]" : "focus:ring-[#0047AB]",
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Profile updated successfully!");
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`${theme.bg} text-white p-6`}>
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Edit Profile</h1>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className={`w-24 h-24 bg-gradient-to-br ${theme.gradient} rounded-full flex items-center justify-center`}>
              <User className="w-12 h-12 text-white" />
            </div>
            <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg border border-gray-100">
              <Camera className={`w-4 h-4 ${theme.icon}`} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 ${theme.ring} focus:border-transparent`}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                defaultValue={isRider ? "mark.santos@email.com" : "juan.delacruz@email.com"}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                disabled
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                defaultValue="0912 345 6789"
                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 ${theme.ring} focus:border-transparent`}
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full ${theme.button} text-white py-4 rounded-lg font-semibold shadow-lg transition-colors mt-8`}
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
