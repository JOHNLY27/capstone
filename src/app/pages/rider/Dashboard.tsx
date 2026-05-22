import { Link } from "react-router";
import { useState } from "react";
import { MapPin, DollarSign, Clock, Bell, TrendingUp, Navigation, Package, ShoppingCart, Send, Info, User, Phone, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

export function RiderDashboard() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const nearbyRequests = [
    {
      id: "1",
      type: "Pabili",
      service: "Pabili - Jollibee",
      customer: "Juan Dela Cruz",
      distance: "0.5 km",
      payment: "₱100",
      time: "Just now",
      details: {
        items: ["2x Chickenjoy with Rice", "1x Jolly Spaghetti", "2x Peach Mango Pie", "2x Large Coke"],
        pickupAddress: "Jollibee Drive-Thru, Gaisano Mall",
        deliveryAddress: "Purok 4, Villa Kananga, Butuan City",
        notes: "Please ask for extra gravy and ensure the food is hot. Cash on delivery.",
        contact: "09123456789"
      }
    },
    {
      id: "2",
      type: "Pasugo",
      service: "Pasugo - Cash In",
      customer: "Maria Santos",
      distance: "1.2 km",
      payment: "₱80",
      time: "2 min ago",
      details: {
        action: "GCash Cash-In / Load",
        amount: "₱1,000",
        pickupAddress: "7-Eleven Libertad (Near Mercury Drug)",
        deliveryAddress: "Montalban St., Butuan City (Green Gate)",
        notes: "The shop is just beside the entrance. Please call when you arrive.",
        contact: "09987654321"
      }
    },
    {
      id: "3",
      type: "Pahatod",
      service: "Pahatod - Documents",
      customer: "Pedro Cruz",
      distance: "2.0 km",
      payment: "₱120",
      time: "5 min ago",
      details: {
        item: "Large Brown Envelope (Sensitive Documents)",
        pickupAddress: "Agusan del Norte Provincial Capitol (Lobby)",
        deliveryAddress: "City Hall Annex, Butuan City",
        notes: "Look for Mr. Tan at the records office. Please handle with care - do not fold.",
        contact: "09334455667"
      }
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-[#050A18] to-[#0047AB] text-white p-6 pb-8">
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
              <h1 className="text-2xl font-bold italic uppercase tracking-tighter">Hello, Mark!</h1>
              <p className="text-[#D4AF37] text-xs font-black uppercase tracking-widest mt-1">Commander Online</p>
            </div>
          </div>
          <Link
            to="/rider/notifications"
            className="relative bg-white/20 p-2 rounded-full"
          >
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-[#D4AF37]" />
              <p className="text-xs text-[#D4AF37]">Today's Earnings</p>
            </div>
            <p className="text-2xl font-bold">₱850</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
              <p className="text-xs text-[#D4AF37]">Completed</p>
            </div>
            <p className="text-2xl font-bold">8</p>
          </div>
        </div>
      </div>

      <div className="p-6 -mt-4">
        <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[#D4AF37] rounded-full animate-pulse"></div>
              <div>
                <p className="font-semibold text-gray-900">You're Online</p>
                <p className="text-sm text-gray-600">Ready to accept orders</p>
              </div>
            </div>
            <Link 
              to="/rider/availability"
              className="px-4 py-2 bg-[#050A18] text-[#D4AF37] rounded-lg font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-all text-center"
            >
              Manage Status
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Nearby Requests</h2>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-3">
            {nearbyRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-[#0047AB]/30 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
                onClick={() => setSelectedRequest(request)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-3">
                    <div className={`p-2 rounded-lg ${
                      request.type === 'Pabili' ? 'bg-orange-100 text-orange-600' :
                      request.type === 'Pasugo' ? 'bg-blue-100 text-blue-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {request.type === 'Pabili' ? <ShoppingCart className="w-5 h-5" /> :
                       request.type === 'Pasugo' ? <Send className="w-5 h-5" /> :
                       <Package className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{request.service}</h3>
                      <p className="text-sm text-gray-500">Customer: {request.customer}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-sm font-black rounded-full">
                    {request.payment}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{request.distance}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{request.time}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/rider/delivery/${request.id}`;
                    }}
                    className="px-6 py-2 bg-[#0047AB] text-white rounded-lg font-bold text-sm hover:bg-[#003380] transition-colors shadow-lg shadow-[#0047AB]/20"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Request Details Modal */}
        <Dialog open={!!selectedRequest} onOpenChange={(open: boolean) => !open && setSelectedRequest(null)}>
          <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none bg-gray-50">
            {selectedRequest && (
              <>
                  <DialogHeader className="p-6 bg-[#050A18] text-white">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-[#D4AF37] text-[#050A18] hover:bg-[#D4AF37]/90 border-none font-black px-3 py-1">
                        {selectedRequest.type.toUpperCase()}
                      </Badge>
                      <span className="text-2xl font-black text-[#D4AF37]">{selectedRequest.payment}</span>
                    </div>
                    <DialogTitle className="text-xl font-bold italic tracking-tight mb-1 text-left">
                      {selectedRequest.service}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400 text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Posted {selectedRequest.time} • Review details below
                    </DialogDescription>
                  </DialogHeader>

                <div className="p-6 space-y-6">
                  {/* Customer Info */}
                  <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-[#0047AB]">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Customer</p>
                        <p className="font-bold text-gray-900">{selectedRequest.customer}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-gray-100">
                        <MessageSquare className="w-5 h-5" />
                      </button>
                      <button className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-gray-100">
                        <Phone className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="p-2 bg-orange-50 text-orange-600 rounded-lg h-fit">
                        <Info className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900 mb-2">Request Details</p>
                        {selectedRequest.type === 'Pabili' && (
                          <ul className="bg-white rounded-lg p-3 space-y-2 text-sm text-gray-600 border border-gray-100">
                            {selectedRequest.details.items.map((item: string, i: number) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-[#D4AF37] font-bold">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                        {selectedRequest.type === 'Pasugo' && (
                          <div className="bg-white rounded-lg p-3 text-sm text-gray-600 border border-gray-100">
                            <p><span className="font-bold text-gray-900">Action:</span> {selectedRequest.details.action}</p>
                            <p><span className="font-bold text-gray-900">Amount:</span> {selectedRequest.details.amount}</p>
                          </div>
                        )}
                        {selectedRequest.type === 'Pahatod' && (
                          <div className="bg-white rounded-lg p-3 text-sm text-gray-600 border border-gray-100">
                            <p><span className="font-bold text-gray-900">Item:</span> {selectedRequest.details.item}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg h-fit">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900 mb-1">Addresses</p>
                        <div className="space-y-2">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">Pickup</p>
                            <p className="text-sm text-gray-600">{selectedRequest.details.pickupAddress || 'Current Location'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">Drop-off</p>
                            <p className="text-sm text-gray-600">{selectedRequest.details.deliveryAddress}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                      <p className="text-[10px] text-yellow-800 uppercase font-black mb-1">Customer Notes</p>
                      <p className="text-sm text-yellow-900 italic">"{selectedRequest.details.notes}"</p>
                    </div>
                  </div>
                </div>

                <DialogFooter className="p-6 bg-white border-t">
                  <div className="flex w-full gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1 border-gray-200 text-gray-500 font-bold"
                      onClick={() => setSelectedRequest(null)}
                    >
                      Close
                    </Button>
                    <Link
                      to={`/rider/delivery/${selectedRequest.id}`}
                      className="flex-[2] bg-[#0047AB] text-white rounded-lg font-bold text-sm hover:bg-[#003380] transition-colors shadow-lg shadow-[#0047AB]/20 flex items-center justify-center"
                    >
                      Accept Job
                    </Link>
                  </div>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        <Link
          to="/rider/earnings"
          className="bg-gradient-to-r from-[#050A18] to-[#0047AB] text-white rounded-xl p-4 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-[#D4AF37] text-sm mb-1">Weekly Earnings</p>
            <p className="text-2xl font-bold">₱4,250</p>
          </div>
          <Navigation className="w-8 h-8 text-[#D4AF37]" />
        </Link>
      </div>
    </div>
  );
}
