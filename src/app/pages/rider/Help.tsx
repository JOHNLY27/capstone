import { useNavigate } from "react-router";
import { ChevronLeft, MessageCircle, Phone, Mail, HelpCircle, ChevronRight } from "lucide-react";

export function RiderHelp() {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "How do I accept an order?",
      answer: "Available orders appear on your dashboard. Tap 'Accept' to start a delivery.",
    },
    {
      question: "How do I withdraw my earnings?",
      answer: "Go to Earnings and tap 'Withdraw'. Minimum withdrawal is ₱500.",
    },
    {
      question: "What if I can't find the customer?",
      answer: "Use the chat or call button in the Active Delivery page to contact them.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#050A18] text-white p-6">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Rider Help & Support</h1>
        </div>
        <p className="text-[#D4AF37] text-sm uppercase font-bold">Partner support</p>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Contact Rider Support</h2>
          <div className="space-y-3">
            <button 
              onClick={() => alert("Connecting to rider support chat...")}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#D4AF37]/10 text-gray-900 hover:bg-[#D4AF37]/20 transition-colors border border-[#D4AF37]/20"
            >
              <MessageCircle className="w-5 h-5 text-[#D4AF37]" />
              <span className="font-semibold">Chat with Support</span>
            </button>
            <button 
              onClick={() => alert("Calling rider hotline: 1-800-FETCH-RIDER...")}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <Phone className="w-5 h-5" />
              <span className="font-semibold">Call Support</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#D4AF37]" />
            Rider FAQs
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0"
              >
                <button className="w-full flex items-center justify-between text-left">
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
