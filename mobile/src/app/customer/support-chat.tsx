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
import { ArrowLeft, Send, MessageSquare, ShieldCheck, Clock } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authStore } from '../../utils/auth-store';
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

  useEffect(() => {
    fetchMessages();
    
    // Poll every 3 seconds for live administrative replies
    const interval = setInterval(() => fetchMessages(true), 3000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages]);

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
            onPress={() => router.back()}
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
              Ask a question about active dispatches, wallets, cash-outs, or general system inquiries. An administrative officer will reply shortly in this secure live thread.
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
});
