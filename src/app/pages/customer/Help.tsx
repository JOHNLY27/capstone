import { useNavigate } from "react-router";
import { HelpCircle, MessageCircle, Phone, Mail, ChevronRight, ArrowLeft } from "lucide-react";

export function CustomerHelp() {
  const navigate = useNavigate();
  const faqs = [
    {
      question: "How do I track my order?",
      answer: "Go to Active Orders and tap on your order to see real-time tracking.",
    },
    {
      question: "How do I cancel an order?",
      answer: "You can cancel an order within 2 minutes of placing it.",
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept cash, GCash, PayMaya, and credit/debit cards.",
    },
    {
      question: "How do I contact my rider?",
      answer: "Tap the phone or message icon in the order tracking page.",
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
            <h1 className="text-2xl font-black uppercase italic tracking-tight">Help & Support</h1>
            <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em] mt-1">24/7 Operations Command</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Contact Us</h2>
          <div className="space-y-3">
            <button 
              onClick={() => alert("Connecting to support chat...")}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#0047AB]/5 text-[#0047AB] hover:bg-[#0047AB]/10 transition-colors border border-[#0047AB]/10"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-bold uppercase tracking-widest text-[10px]">Chat with Support</span>
            </button>
            <button 
              onClick={() => alert("Calling support hotline: 1-800-FETCHME...")}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#D4AF37]/5 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors border border-[#D4AF37]/10"
            >
              <Phone className="w-5 h-5" />
              <span className="font-bold uppercase tracking-widest text-[10px]">Call Support</span>
            </button>
            <button 
              onClick={() => alert("Opening your email client...")}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-gray-50 text-gray-900 hover:bg-gray-100 transition-colors border border-gray-100"
            >
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="font-bold uppercase tracking-widest text-[10px]">Email Support</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Frequently Asked Questions
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
