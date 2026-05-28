import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Send, Bike, Phone, MoreVertical, Image as ImageIcon } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type Message = {
  id: string;
  text: string;
  sender: 'customer' | 'rider';
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
};

// Mock rider info per order
const RIDER_INFO: Record<string, { name: string; vehicle: string }> = {
  '1': { name: 'Mark Santos', vehicle: 'Honda Click 125i' },
  '2': { name: 'Finding Rider...', vehicle: '' },
  '3': { name: 'Anna Cruz', vehicle: 'Yamaha Mio i125' },
};

// Initial mock messages
const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    text: 'Hi! I\'ve accepted your order. Heading to the store now 🏪',
    sender: 'rider',
    timestamp: '2:31 PM',
  },
  {
    id: '2',
    text: 'Great, thank you! Please make sure to get extra gravy for the chickenjoy',
    sender: 'customer',
    timestamp: '2:32 PM',
    status: 'read',
  },
  {
    id: '3',
    text: 'Sure thing! I\'ll add extra gravy. Anything else you need?',
    sender: 'rider',
    timestamp: '2:33 PM',
  },
  {
    id: '4',
    text: 'That\'s all, thanks! 😊',
    sender: 'customer',
    timestamp: '2:33 PM',
    status: 'read',
  },
  {
    id: '5',
    text: 'I\'m at Jollibee now, ordering your food. Will update you once I have everything!',
    sender: 'rider',
    timestamp: '2:40 PM',
  },
  {
    id: '6',
    text: 'Got everything! On my way to you now. ETA ~12 minutes 🛵',
    sender: 'rider',
    timestamp: '2:48 PM',
  },
];

// Auto-replies for demo
const AUTO_REPLIES = [
  'Got it! I\'ll take note of that 👍',
  'Alright, no worries! Almost there 🛵',
  'Sure thing! I\'ll be there soon.',
  'On my way! Traffic is light today 😊',
  'No problem at all! See you in a few minutes.',
];

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const orderId = (params.id as string) || '1';
  const rider = RIDER_INFO[orderId] || RIDER_INFO['1'];
  
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'customer',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      status: 'sent',
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate rider auto-reply after 1.5s
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
        sender: 'rider',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      };
      setMessages(prev => [...prev, reply]);
    }, 1500);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isCustomer = item.sender === 'customer';

    return (
      <View style={[
        styles.messageBubbleWrapper,
        isCustomer ? styles.customerWrapper : styles.riderWrapper
      ]}>
        {!isCustomer && (
          <View style={styles.riderMsgAvatar}>
            <Bike size={14} color="#D4AF37" />
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isCustomer ? styles.customerBubble : styles.riderBubble
        ]}>
          <Text style={[
            styles.messageText,
            isCustomer ? styles.customerText : styles.riderText
          ]}>
            {item.text}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={[
              styles.messageTime,
              isCustomer && { color: 'rgba(255,255,255,0.6)' }
            ]}>
              {item.timestamp}
            </Text>
            {item.status && isCustomer && (
              <Text style={styles.messageStatus}>
                {item.status === 'read' ? '✓✓' : item.status === 'delivered' ? '✓✓' : '✓'}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Chat Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity 
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color="#D4AF37" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <View style={styles.headerAvatar}>
            <Bike size={18} color="#D4AF37" />
          </View>
          <View>
            <Text style={styles.headerName}>{rider.name}</Text>
            <View style={styles.onlineIndicator}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online • {rider.vehicle}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.headerAction} activeOpacity={0.7}>
          <Phone size={18} color="#D4AF37" />
        </TouchableOpacity>
      </View>

      {/* Order Context Banner */}
      <View style={styles.orderBanner}>
        <Text style={styles.orderBannerText}>
          📦 Order #{orderId} • In Transit
        </Text>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Input Bar */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
          <TouchableOpacity style={styles.attachButton} activeOpacity={0.7}>
            <ImageIcon size={20} color="#6B7280" />
          </TouchableOpacity>
          
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
              onSubmitEditing={sendMessage}
            />
          </View>

          <TouchableOpacity 
            style={[
              styles.sendButton,
              inputText.trim() ? styles.sendButtonActive : {}
            ]} 
            activeOpacity={0.7}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Send size={18} color={inputText.trim() ? '#FFFFFF' : '#9CA3AF'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#050A18',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(212,175,55,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
  },
  headerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  onlineText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  headerAction: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Order banner
  orderBanner: {
    backgroundColor: 'rgba(0,71,171,0.06)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,71,171,0.08)',
  },
  orderBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0047AB',
    textAlign: 'center',
  },

  // Chat area
  chatArea: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
    gap: 8,
  },

  // Message bubbles
  messageBubbleWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 4,
  },
  customerWrapper: {
    justifyContent: 'flex-end',
  },
  riderWrapper: {
    justifyContent: 'flex-start',
  },
  riderMsgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#050A18',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  messageBubble: {
    maxWidth: width * 0.72,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  customerBubble: {
    backgroundColor: '#0047AB',
    borderBottomRightRadius: 4,
    marginLeft: 'auto',
    shadowColor: '#0047AB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  riderBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  customerText: {
    color: '#FFFFFF',
  },
  riderText: {
    color: '#1F2937',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  messageStatus: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 10,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    minHeight: 40,
    maxHeight: 100,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 15,
    color: '#1F2937',
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#0047AB',
    shadowColor: '#0047AB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
});
