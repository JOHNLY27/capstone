import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, Bell, MessageSquare, TrendingUp } from "lucide-react";

export function RiderNotificationsSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    newOrders: true,
    earningsUpdates: true,
    chatMessages: true,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#050A18] text-white p-6">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-[#D4AF37]" />
              <div>
                <p className="font-semibold text-gray-900">New Order Alerts</p>
                <p className="text-xs text-gray-500">Get notified of nearby delivery requests</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.newOrders}
                onChange={() => setSettings({...settings, newOrders: !settings.newOrders})}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-semibold text-gray-900">Earnings Updates</p>
                <p className="text-xs text-gray-500">Daily and weekly earnings reports</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.earningsUpdates}
                onChange={() => setSettings({...settings, earningsUpdates: !settings.earningsUpdates})}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-teal-600" />
              <div>
                <p className="font-semibold text-gray-900">Chat Messages</p>
                <p className="text-xs text-gray-500">Messages from your customers</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.chatMessages}
                onChange={() => setSettings({...settings, chatMessages: !settings.chatMessages})}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
