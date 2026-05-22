import { Link } from "react-router";
import { ShoppingBag, Send, Package, Navigation, Bell, MapPin, Bike } from "lucide-react";

export function CustomerDashboard() {
  const services = [
    {
      id: "pabili",
      title: "Pabili",
      description: "Food & Groceries",
      icon: ShoppingBag,
      color: "bg-[#0047AB]",
      path: "/customer/pabili",
    },
    {
      id: "pasugo",
      title: "Pasugo",
      description: "Errands & Parcel",
      icon: Send,
      color: "bg-[#D4AF37]",
      path: "/customer/pasugo",
    },
    {
      id: "pakuha",
      title: "Pakuha",
      description: "Pickup Items",
      icon: Package,
      color: "bg-[#050A18]",
      path: "/customer/pakuha",
    },
    {
      id: "pahatod",
      title: "Pahatod",
      description: "Drop-off / Delivery",
      icon: Navigation,
      color: "bg-slate-700",
      path: "/customer/pahatod",
    },
    {
      id: "ride",
      title: "FMU Ride",
      description: "Passenger / Hatud",
      icon: Bike,
      color: "bg-[#D4AF37]",
      path: "/customer/ride",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="bg-gradient-to-br from-[#0047AB] to-[#003380] text-white p-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm p-1 border border-white/20 shadow-xl overflow-hidden">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-[8px] font-black text-[#D4AF37] text-center leading-tight">LOGO<br/>HERE</div>';
                  }
                }}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-tight italic">Hello, Juan!</h1>
              <p className="text-[#D4AF37] text-xs font-black uppercase tracking-widest mt-1">What's your mission today?</p>
            </div>
          </div>
          <Link
            to="/customer/notifications"
            className="relative bg-white/20 p-2 rounded-full"
          >
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Link>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur rounded-2xl p-4 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-[#D4AF37]" />
          <div className="flex-1">
            <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">Delivery Zone</p>
            <p className="font-bold text-sm tracking-tight">Buhangin, Butuan City</p>
          </div>
        </div>
      </div>

      <div className="p-6 -mt-4">
        <h2 className="font-semibold text-gray-900 mb-4">Services</h2>
        <div className="grid grid-cols-2 gap-4">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.id}
                to={service.path}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95 group"
              >
                <div className={`${service.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{service.title}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter leading-tight">{service.description}</p>
              </Link>
            );
          })}
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Active Orders</h2>
            <Link to="/customer/active-orders" className="text-xs text-[#0047AB] font-black uppercase tracking-widest">
              View All
            </Link>
          </div>
          <Link
            to="/customer/track/1"
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-black text-[#0047AB] italic">Pabili - Jollibee</span>
              <span className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-black uppercase tracking-tighter rounded-full border border-[#D4AF37]/20">
                In Transit
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">Rider: Mark Santos</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Navigation className="w-3 h-3" />
              <span>Arriving in 15 minutes</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
