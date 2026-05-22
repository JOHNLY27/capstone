import { useNavigate } from "react-router";
import { Bell, Package, DollarSign, Gift, ArrowLeft } from "lucide-react";

export function CustomerNotifications() {
  const navigate = useNavigate();
  const notifications = [
    {
      id: "1",
      type: "order",
      icon: Package,
      title: "Order Delivered",
      message: "Your Pabili order has been delivered successfully",
      time: "5 min ago",
      unread: true,
    },
    {
      id: "2",
      type: "promo",
      icon: Gift,
      title: "Special Offer",
      message: "Get 20% off on your next Pabili service!",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: "3",
      type: "payment",
      icon: DollarSign,
      title: "Payment Successful",
      message: "₱350 has been charged for your order #12345",
      time: "2 hours ago",
      unread: false,
    },
    {
      id: "4",
      type: "order",
      icon: Package,
      title: "Rider Assigned",
      message: "Mark Santos is now handling your delivery",
      time: "Yesterday",
      unread: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0047AB] text-white p-6 shadow-xl relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors backdrop-blur-sm"
          >
            <ArrowLeft className="w-6 h-6 text-[#D4AF37]" />
          </button>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight italic">Notifications</h1>
            <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] mt-1">Personal Briefing</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {notifications.map((notification) => {
          const Icon = notification.icon;
          return (
            <div
              key={notification.id}
              className={`p-5 flex items-start gap-4 transition-colors ${
                notification.unread ? "bg-[#0047AB]/5" : "bg-white"
              }`}
            >
              <div className={`p-2.5 rounded-xl ${
                notification.unread ? "bg-[#0047AB]/10" : "bg-gray-100"
              }`}>
                <Icon className={`w-5 h-5 ${
                  notification.unread ? "text-[#0047AB]" : "text-gray-400"
                }`} />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                  {notification.unread && (
                    <div className="w-2.5 h-2.5 bg-[#D4AF37] rounded-full shadow-[0_0_8px_rgba(212,175,55,0.5)]"></div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
