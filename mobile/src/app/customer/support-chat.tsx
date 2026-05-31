import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Send, MessageSquare, ShieldCheck, Clock, Bike, ChevronRight } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authStore } from '../../utils/auth-store';
import { persistentStorage } from '../../utils/persistent-storage';
import { API_URL } from '../../constants/api';

export default function SupportChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const [activeView, setActiveView] = useState<'inbox' | 'admin'>('inbox');
  const [activeRiderChats, setActiveRiderChats] = useState<any[]>([]);
  const [recentRiderChats, setRecentRiderChats] = useState<any[]>([]);

  const fetchMessages = async (silent = false) => {
    const token = authStore.getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/support/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await response.json();

      if (response.ok && resData.success) {
        setMessages(resData.messages || []);
        if (resData.adminInfo) {
          setAdminInfo(resData.adminInfo);
        }
      }
    } catch (e) {
      console.error('Error fetching support messages:', e);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const fetchActiveRiderChats = async () => {
    const token = authStore.getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/orders/customer`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await response.json();

      if (response.ok && resData.success) {
        const allOrders = resData.data.orders || [];
        const active = allOrders.filter((o: any) => 
          (o.status === 'ACCEPTED' || o.status === 'IN_TRANSIT') && o.riderId
        );
        const recent = allOrders.filter((o: any) => 
          (o.status === 'COMPLETED' || o.status === 'CANCELLED') && o.riderId
        );
        setActiveRiderChats(active);
        setRecentRiderChats(recent);
      }
    } catch (e) {
      console.error('Error fetching active rider chats:', e);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchActiveRiderChats();
    
    // Poll every 3 seconds for live administrative replies
    const interval = setInterval(() => fetchMessages(true), 3000);
    // Poll every 8 seconds for active rider chats
    const chatsInterval = setInterval(fetchActiveRiderChats, 8000);

    return () => {
      clearInterval(interval);
      clearInterval(chatsInterval);
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages]);

  // Automatically mark admin messages as read when viewed
  useEffect(() => {
    if (activeView === 'admin' && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      persistentStorage.setItem('@last_seen_admin_msg_id', lastMsg.id).catch(() => {});
    }
  }, [activeView, messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const messageText = inputText.trim();
    setInputText('');
    setIsSending(true);

    // Optimistic UI updates
    const currentUserId = authStore.getUser()?.id || 'temp-id';
    const tempMsg = {
      id: `temp-${Date.now()}`,
      senderId: currentUserId,
      message: messageText,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    const token = authStore.getToken();
    try {
      const response = await fetch(`${API_URL}/api/support/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: messageText })
      });
      const resData = await response.json();

      if (!response.ok || !resData.success) {
        Alert.alert('Notice', 'Failed to dispatch message to Support Admin.');
        // Remove the failed message
        setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      } else {
        // Sync database state immediately
        fetchMessages(true);
      }
    } catch (e) {
      console.error('Send message error:', e);
      Alert.alert('Connection Error', 'Unable to reach backend. Retrying shortly.');
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    } finally {
      setIsSending(false);
    }
  };

  const formatMessageTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerAlign]}>
        <ActivityIndicator size="large" color="#0047AB" />
        <Text style={styles.loadingText}>Syncing Support Admin session...</Text>
      </View>
    );
  }

  const currentUser = authStore.getUser();

  if (activeView === 'inbox') {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top || 20 }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Messages Inbox</Text>
              <Text style={styles.headerSubtitle}>Unified Communication Center</Text>
            </View>
          </View>
        </View>

        <ScrollView 
          style={styles.chatArea}
          contentContainerStyle={styles.inboxContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.inboxSectionTitle}>Official Channels</Text>
          
          <TouchableOpacity 
            style={styles.inboxCard} 
            activeOpacity={0.8}
            onPress={() => setActiveView('admin')}
          >
            <View style={styles.inboxAvatarWrapper}>
              <ShieldCheck size={24} color="#D4AF37" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.inboxHeaderRow}>
                <Text style={styles.inboxName}>{adminInfo?.name || 'FetchMeUp Admin Support'}</Text>
                <View style={styles.supportBadge}>
                  <Text style={styles.supportBadgeText}>SUPPORT</Text>
                </View>
              </View>
              <Text style={styles.inboxLastMsg} numberOfLines={1}>
                {messages.length > 0 ? messages[messages.length - 1].message : "Chat securely with our official administrative help desk."}
              </Text>
            </View>
            <ChevronRight size={18} color="#C7C7CC" />
          </TouchableOpacity>

          <Text style={styles.inboxSectionTitle}>Active Errand Pilots</Text>
          
          {activeRiderChats.length === 0 ? (
            <View style={styles.emptyInboxCard}>
              <MessageSquare size={32} color="#D1D5DB" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyInboxTitle}>No Active Rider Chats</Text>
              <Text style={styles.emptyInboxDesc}>Book a pahatod, pabili, pasugo, or ride errand in Butuan City to message your pilot partner in real-time!</Text>
            </View>
          ) : (
            activeRiderChats.map((order: any) => {
              const riderName = order.rider?.name || 'Assigned Pilot';
              const serviceLabel = order.type === 'PAHATOD' && order.details?.rideService === true ? 'FMU RIDE' : order.type;
              
              return (
                <TouchableOpacity 
                  key={order.id} 
                  style={styles.inboxCard} 
                  activeOpacity={0.8}
                  onPress={() => router.push(`/chat/${order.id}` as any)}
                >
                  <View style={[styles.inboxAvatarWrapper, { backgroundColor: 'rgba(0, 71, 171, 0.05)' }]}>
                    <Bike size={24} color="#0047AB" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.inboxHeaderRow}>
                      <Text style={styles.inboxName}>Rider: {riderName}</Text>
                      <View style={[styles.supportBadge, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.25)' }]}>
                        <Text style={[styles.supportBadgeText, { color: '#10B981' }]}>ACTIVE</Text>
                      </View>
                    </View>
                    <Text style={styles.inboxLastMsg} numberOfLines={1}>
                      {serviceLabel} Errand to: {order.dropoffAddress.split(',')[0]} (Tap to chat)
                    </Text>
                  </View>
                  <ChevronRight size={18} color="#C7C7CC" />
                </TouchableOpacity>
              );
            })
          )}

          <Text style={styles.inboxSectionTitle}>Recent Errand Chats</Text>
          
          {recentRiderChats.length === 0 ? (
            <View style={styles.emptyInboxCard}>
              <MessageSquare size={32} color="#D1D5DB" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyInboxTitle}>No Recent Chats</Text>
              <Text style={styles.emptyInboxDesc}>Your completed or cancelled errand chats will be listed here for review.</Text>
            </View>
          ) : (
            recentRiderChats.map((order: any) => {
              const riderName = order.rider?.name || 'Past Pilot';
              const serviceLabel = order.type === 'PAHATOD' && order.details?.rideService === true ? 'FMU RIDE' : order.type;
              const isCompleted = order.status === 'COMPLETED';
              
              return (
                <TouchableOpacity 
                  key={order.id} 
                  style={styles.inboxCard} 
                  activeOpacity={0.8}
                  onPress={() => router.push(`/chat/${order.id}` as any)}
                >
                  <View style={[styles.inboxAvatarWrapper, { backgroundColor: 'rgba(107, 114, 128, 0.05)' }]}>
                    <Bike size={24} color="#6B7280" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.inboxHeaderRow}>
                      <Text style={styles.inboxName}>Rider: {riderName}</Text>
                      <View style={[
                        styles.supportBadge, 
                        isCompleted 
                          ? { backgroundColor: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.15)' }
                          : { backgroundColor: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.15)' }
                      ]}>
                        <Text style={[
                          styles.supportBadgeText, 
                          isCompleted ? { color: '#10B981' } : { color: '#EF4444' }
                        ]}>
                          {order.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.inboxLastMsg} numberOfLines={1}>
                      {serviceLabel} Errand to: {order.dropoffAddress.split(',')[0]} (Tap to view history)
                    </Text>
                  </View>
                  <ChevronRight size={18} color="#C7C7CC" />
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 90}
    >
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top || 20 }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => setActiveView('inbox')}
          >
            <ArrowLeft size={20} color="#D4AF37" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{adminInfo?.name || 'Live Admin Support'}</Text>
            <View style={styles.badgeRow}>
              <ShieldCheck size={12} color="#D4AF37" />
              <Text style={styles.headerSubtitle}>Official Help Desk</Text>
            </View>
          </View>
          
          <View style={styles.activeDot} />
        </View>
      </View>

      {/* Messages Scroll Area */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <MessageSquare size={36} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>FetchMeUp Official Support</Text>
            <Text style={styles.emptyDesc}>
              Ask a question about active dispatches, COD transactions, courier rates, or general system inquiries. An administrative officer will reply shortly in this secure live thread.
            </Text>
          </View>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser?.id;
            return (
              <View 
                key={msg.id} 
                style={[
                  styles.msgWrapper,
                  isMe ? styles.myMsgWrapper : styles.theirMsgWrapper
                ]}
              >
                <View 
                  style={[
                    styles.bubble,
                    isMe ? styles.myBubble : styles.theirBubble
                  ]}
                >
                  <Text style={[styles.msgText, isMe ? styles.myMsgText : styles.theirMsgText]}>
                    {msg.message}
                  </Text>
                  
                  <View style={styles.timeRow}>
                    <Text style={[styles.timeText, isMe ? styles.myTimeText : styles.theirTimeText]}>
                      {formatMessageTime(msg.createdAt)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Message Input Box */}
      <View style={[styles.inputBox, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.inputInner}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a support message..."
            placeholderTextColor="#9CA3AF"
            multiline={true}
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            activeOpacity={0.8}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Send size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  centerAlign: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#0047AB',
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#0047AB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D4AF37',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#0047AB',
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 20,
    paddingBottom: 30,
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 60,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
    fontWeight: '500',
  },
  msgWrapper: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 4,
  },
  myMsgWrapper: {
    justifyContent: 'flex-end',
  },
  theirMsgWrapper: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  myBubble: {
    backgroundColor: '#0047AB',
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },
  myMsgText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  theirMsgText: {
    color: '#1F2937',
    fontWeight: '500',
  },
  timeRow: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  timeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  myTimeText: {
    color: 'rgba(255,255,255,0.6)',
  },
  theirTimeText: {
    color: '#9CA3AF',
  },
  inputBox: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    minHeight: 24,
    maxHeight: 80,
    paddingVertical: 8,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0047AB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  inboxContent: {
    padding: 24,
    gap: 12,
  },
  inboxSectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 4,
  },
  inboxCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  inboxAvatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inboxHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  inboxName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  supportBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 50,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  supportBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 0.5,
  },
  inboxLastMsg: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyInboxCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 8,
  },
  emptyInboxTitle: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '800',
    marginBottom: 6,
  },
  emptyInboxDesc: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 8,
    fontWeight: '500',
  },
});
