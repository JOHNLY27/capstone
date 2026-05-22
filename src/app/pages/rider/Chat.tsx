import { useState } from "react";
import { Link, useParams } from "react-router";
import { ChevronLeft, Send, Image } from "lucide-react";

export function RiderChat() {
  const { customerId } = useParams();
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
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-[#050A18] text-white p-6">
        <div className="flex items-center gap-4">
          <Link to="/rider" className="p-2 -ml-2 rounded-full hover:bg-white/10">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Juan Dela Cruz</h1>
            <p className="text-[#D4AF37] text-sm font-bold uppercase tracking-widest">Customer</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "rider" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] ${
                msg.sender === "rider"
                  ? "bg-[#050A18] text-[#D4AF37] border border-[#D4AF37]/30"
                  : "bg-white text-gray-900 shadow-sm"
              } rounded-2xl px-4 py-3`}
            >
              <p className="text-sm">{msg.text}</p>
              <p
                className={`text-[10px] mt-1 ${
                  msg.sender === "rider" ? "text-[#D4AF37]/70" : "text-gray-500"
                }`}
              >
                {msg.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="bg-white border-t border-gray-200 p-4">
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
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:ring-2 focus:ring-[#D4AF37] focus:outline-none"
          />
          <button
            type="submit"
            className="p-3 bg-[#050A18] text-[#D4AF37] border border-[#D4AF37]/50 rounded-full hover:bg-[#0a1229] transition-all shadow-lg"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
