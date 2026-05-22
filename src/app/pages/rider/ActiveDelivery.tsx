import { Link, useParams } from "react-router";
import { ChevronLeft, Phone, MessageCircle, MapPin, Navigation, CheckCircle, Package } from "lucide-react";

export function ActiveDelivery() {
  const { orderId } = useParams();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-[#050A18] text-white p-6">
        <div className="flex items-center gap-4 mb-4">
          <Link to="/rider" className="p-2 -ml-2 rounded-full hover:bg-white/10">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Active Delivery</h1>
            <p className="text-[#D4AF37] text-sm mt-1">Order #{orderId}</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur rounded-lg p-3 flex items-center justify-between border border-white/10">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#D4AF37]" />
            <span className="font-semibold tracking-tight">Pabili - Jollibee</span>
          </div>
          <span className="px-3 py-1 bg-[#D4AF37] text-[#050A18] rounded-full text-sm font-black">₱100</span>
        </div>
      </div>

      <div className="flex-1 relative bg-gray-200">
        <iframe
          title="Rider Navigation Map"
          className="w-full h-full border-0"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63033.4077651036!2d125.5015!3d8.9475!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3301ef876792400b%3A0x67c74534063fcf0a!2sButuan%20City%2C%20Agusan%20Del%20Norte!5e0!3m2!1sen!2sph!4v1715056789012!5m2!1sen!2sph"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

      <div className="bg-white rounded-t-3xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Customer</p>
            <p className="font-semibold text-gray-900 text-lg">Juan Dela Cruz</p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/rider/chat/1"
              className="bg-[#D4AF37]/10 p-3 rounded-full hover:bg-[#D4AF37]/20 transition-colors"
            >
              <MessageCircle className="w-5 h-5 text-[#D4AF37]" />
            </Link>
            <button className="bg-[#D4AF37]/10 p-3 rounded-full hover:bg-[#D4AF37]/20 transition-colors">
              <Phone className="w-5 h-5 text-[#D4AF37]" />
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start gap-2 mb-2">
            <MapPin className="w-4 h-4 text-gray-600 mt-1" />
            <div>
              <p className="text-sm font-medium text-gray-900">Delivery Address</p>
              <p className="text-sm text-gray-600 mt-1">
                Purok 1, Buhangin, Butuan City, Agusan del Norte
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 mb-2">Order Details</p>
          <ul className="space-y-1 text-sm text-blue-700">
            <li>• 1x Chickenjoy with Rice</li>
            <li>• 1x Jolly Spaghetti</li>
            <li>• 2x Iced Tea</li>
          </ul>
        </div>

        <div className="space-y-2">
          <button className="w-full bg-[#050A18] text-[#D4AF37] border border-[#D4AF37]/50 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#0a1229] transition-all">
            <CheckCircle className="w-5 h-5" />
            Mark as Picked Up
          </button>
          <button className="w-full bg-[#0047AB] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#003380] transition-colors shadow-lg shadow-[#0047AB]/20">
            <Navigation className="w-5 h-5" />
            Start Navigation
          </button>
        </div>
      </div>
    </div>
  );
}
