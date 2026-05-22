import { Bell, DollarSign, Package, AlertCircle } from "lucide-react";

export function RiderNotifications() {
  const notifications = [
    {
      id: "1",
      type: "earning",
      icon: DollarSign,
      title: "Payment Received",
      message: "₱100 has been added to your wallet",
      time: "5 min ago",
      unread: true,
    },
    {
      id: "2",
      type: "order",
      icon: Package,
      title: "New Order Nearby",
      message: "Pabili order 0.5km away - ₱120",
      time: "15 min ago",
      unread: true,
    },
    {
      id: "3",
      type: "earning",
      icon: DollarSign,
      title: "Daily Goal Achieved",
      message: "Congrats! You've earned ₱850 today",
      time: "1 hour ago",
      unread: false,
    },
    {
      id: "4",
      type: "alert",
      icon: AlertCircle,
      title: "Document Expiring Soon",
      message: "Your driver's license expires in 30 days",
      time: "Yesterday",
      unread: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#050A18] text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight">Notifications</h1>
            <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mt-1">Stay updated</p>
          </div>
          <Bell className="w-6 h-6 text-[#D4AF37]" />
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {notifications.map((notification) => {
          const Icon = notification.icon;
          return (
            <div
              key={notification.id}
              className={`p-4 flex items-start gap-3 transition-colors ${
                notification.unread ? "bg-[#D4AF37]/5 border-l-4 border-l-[#D4AF37]" : "bg-white"
              }`}
            >
              <div
                className={`p-2 rounded-full ${
                  notification.unread ? "bg-green-100" : "bg-gray-100"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    notification.unread ? "text-[#D4AF37]" : "text-gray-400"
                  }`}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                  {notification.unread && (
                    <div className="w-2 h-2 bg-[#D4AF37] rounded-full"></div>
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
