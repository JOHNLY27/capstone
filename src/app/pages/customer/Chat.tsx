import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronLeft, Send, Image, Phone } from "lucide-react";

export function CustomerChat() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const messages = [
    { id: "1", sender: "customer", text: "Hello! Where are you now?", time: "2:30 PM" },
    { id: "2", sender: "rider", text: "Hi! I'm 5 minutes away", time: "2:31 PM" },
    { id: "3", sender: "customer", text: "Okay, thank you!", time: "2:31 PM" },
    { id: "4", sender: "rider", text: "I'm outside your building now", time: "2:35 PM" },
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      <div className="bg-[#0047AB] text-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-black italic uppercase tracking-tight">Mark Santos</h1>
              <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.2em]">Official Rider Partner</p>
            </div>
          </div>
          <button 
            onClick={() => alert("Calling Mark Santos: 0912 345 6789")}
            className="p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full hover:bg-white/20 transition-all"
          >
            <Phone className="w-5 h-5 text-[#D4AF37]" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "customer" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] ${
                msg.sender === "customer"
                  ? "bg-[#0047AB] text-white shadow-xl shadow-[#0047AB]/20"
                  : "bg-white text-gray-900 shadow-sm border border-gray-100"
              } rounded-2xl px-4 py-3`}
            >
              <p className="text-sm font-medium">{msg.text}</p>
              <p
                className={`text-[10px] mt-1 font-bold uppercase tracking-tighter ${
                  msg.sender === "customer" ? "text-white/60" : "text-gray-400"
                }`}
              >
                {msg.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="bg-white border-t border-gray-200 p-4 pb-8">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
          >
            <Image className="w-5 h-5 text-gray-600" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#0047AB] focus:outline-none font-medium"
          />
          <button
            type="submit"
            className="p-4 bg-[#0047AB] text-white rounded-2xl hover:bg-[#003380] transition-all shadow-xl shadow-[#0047AB]/30 active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
