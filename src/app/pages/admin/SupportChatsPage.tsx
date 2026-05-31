import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Send, User, ShieldCheck, Phone, Mail, 
  Clock, ArrowLeft, Search, Activity, CheckCircle, AlertCircle
} from 'lucide-react';

export default function SupportChatsPage() {
  const [threads, setThreads] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isLoadingThreads, setIsLoadingThreads] = useState(true);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Fetch all active support threads
  const fetchThreads = async (silent = false) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5000/api/support/admin/threads', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await response.json();
      if (response.ok && resData.success) {
        setThreads(resData.threads || []);
      }
    } catch (e) {
      console.error('Error fetching admin threads:', e);
    } finally {
      if (!silent) setIsLoadingThreads(false);
    }
  };

  // Fetch chat details with a specific customer
  const fetchChatDetails = async (customerId: string, silent = false) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!silent) setIsLoadingChat(true);
    try {
      const response = await fetch(`http://localhost:5000/api/support/admin/threads/${customerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await response.json();
      if (response.ok && resData.success) {
        setMessages(resData.messages || []);
        if (resData.customer) {
          setCustomerInfo(resData.customer);
        }
      }
    } catch (e) {
      console.error('Error fetching chat details:', e);
    } finally {
      if (!silent) setIsLoadingChat(false);
    }
  };

  // Polling hook
  useEffect(() => {
    fetchThreads();
    const threadsInterval = setInterval(() => fetchThreads(true), 3000);
    return () => clearInterval(threadsInterval);
  }, []);

  useEffect(() => {
    if (!selectedCustomerId) return;

    fetchChatDetails(selectedCustomerId);
    const chatInterval = setInterval(() => fetchChatDetails(selectedCustomerId, true), 3000);
    
    return () => clearInterval(chatInterval);
  }, [selectedCustomerId]);

  // Scroll to chat bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedCustomerId) return;

    const messageText = inputText.trim();
    setInputText('');
    setIsSending(true);

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/support/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageText,
          customerId: selectedCustomerId
        })
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        // Sync chat state immediately
        fetchChatDetails(selectedCustomerId, true);
        fetchThreads(true);
      } else {
        alert(resData.error || 'Failed to send message.');
      }
    } catch (e) {
      console.error('Error admin sending support message:', e);
      alert('Network error. Unable to deliver response.');
    } finally {
      setIsSending(false);
    }
  };

  // Filter threads based on search
  const filteredThreads = threads.filter(t => 
    t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.customerPhone && t.customerPhone.includes(searchQuery))
  );

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] w-full gap-6 p-6 overflow-hidden">
      
      {/* Left side: Threads ledger list */}
      <div className="w-[380px] h-full flex flex-col bg-[#0b101c]/90 border border-gray-800 rounded-3xl overflow-hidden backdrop-blur-xl">
        <div className="p-5 border-b border-gray-800 bg-[#090d16]">
          <h2 className="text-lg font-black text-white tracking-wide italic uppercase flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#D4AF37]" />
            Support Inbox
          </h2>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">
            Realtime customer dialogue threads
          </p>
          
          {/* Search bar */}
          <div className="relative mt-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="w-full bg-[#121926] border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Threads listings */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {isLoadingThreads && threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Activity className="w-8 h-8 text-[#D4AF37] animate-spin mb-3" />
              <p className="text-xs font-semibold text-gray-400">Loading support inbox...</p>
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="w-10 h-10 text-gray-700 mb-2" />
              <p className="text-sm font-bold text-gray-400">No support requests found</p>
              <p className="text-xs text-gray-500 mt-1 max-w-[200px]">
                Active help requests will automatically populate here.
              </p>
            </div>
          ) : (
            filteredThreads.map((thread) => {
              const isSelected = thread.customerId === selectedCustomerId;
              return (
                <button
                  key={thread.customerId}
                  onClick={() => setSelectedCustomerId(thread.customerId)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 focus:outline-none ${
                    isSelected
                      ? 'bg-[#1a2336] border-[#D4AF37] shadow-lg shadow-[#D4AF37]/5'
                      : 'bg-[#111622]/60 border-gray-800 hover:bg-[#121926] hover:border-gray-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#0047AB]/20 border border-[#0047AB]/30 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-[#0047AB]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-gray-100 truncate block">
                        {thread.customerName}
                      </span>
                      <span className="text-[10px] text-gray-500 font-semibold shrink-0">
                        {formatTime(thread.lastMessageAt)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-semibold block mt-1 truncate">
                      {thread.lastMessage}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right side: Selected thread chat workspace */}
      <div className="flex-1 h-full flex flex-col bg-[#0b101c]/90 border border-gray-800 rounded-3xl overflow-hidden backdrop-blur-xl">
        {selectedCustomerId ? (
          <>
            {/* Active thread header */}
            <div className="p-5 border-b border-gray-800 bg-[#090d16] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-[#0047AB]/10 border border-[#0047AB]/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#0047AB]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white leading-tight">
                    {customerInfo?.name || 'Customer Support'}
                  </h3>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-500" />
                      {customerInfo?.phone || 'No phone'}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-700" />
                    <span className="flex items-center gap-1.5 text-[#10B981]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                      Verified Client
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20">
                <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-[10px] font-extrabold text-[#10B981] uppercase tracking-wider">Live Thread</span>
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#070b14]/50 custom-scrollbar">
              {isLoadingChat ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Activity className="w-8 h-8 text-[#D4AF37] animate-spin mb-3" />
                  <p className="text-sm text-gray-400 font-semibold">Syncing chat log...</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId !== selectedCustomerId; // if sender is admin
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-md border ${
                          isMe
                            ? 'bg-[#0047AB] border-[#0047AB]/20 text-white rounded-br-none'
                            : 'bg-[#121926] border-gray-800 text-gray-200 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm font-medium leading-relaxed break-words">
                          {msg.message}
                        </p>
                        <div className="flex justify-end items-center mt-2 gap-1.5 text-[9px] text-gray-400/80 font-bold uppercase tracking-wider">
                          <Clock className="w-2.5 h-2.5" />
                          {formatTime(msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Response input console */}
            <form 
              onSubmit={handleSendMessage}
              className="p-5 border-t border-gray-800 bg-[#090d16]"
            >
              <div className="flex items-center gap-4 bg-[#121926] border border-gray-800 rounded-2xl pl-5 pr-2.5 py-2.5">
                <input
                  type="text"
                  placeholder="Type an official admin response..."
                  className="flex-1 bg-transparent text-gray-200 placeholder-gray-500 text-sm focus:outline-none"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white flex items-center gap-2 transition-all ${
                    inputText.trim()
                      ? 'bg-[#0047AB] hover:bg-[#0047AB]/90 shadow-lg shadow-[#0047AB]/20'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSending ? (
                    <Activity className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      Reply
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 h-full flex flex-col items-center justify-center text-center p-8 bg-[#070b14]/30">
            <div className="w-16 h-16 rounded-full bg-[#0047AB]/10 border border-[#0047AB]/20 flex items-center justify-center mb-5">
              <MessageSquare className="w-7 h-7 text-[#0047AB]" />
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-wider">
              No Thread Selected
            </h3>
            <p className="text-sm text-gray-400 max-w-[340px] mt-2 leading-relaxed">
              Select a customer active thread from the inbox catalog on the left to start coordinating support replies in real-time.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
