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
  Image,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Send, Bike, Phone, Image as ImageIcon, User, AlertCircle, MapPin } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authStore } from '../../utils/auth-store';
import { persistentStorage } from '../../utils/persistent-storage';
import { API_URL } from '../../constants/api';
import * as ImagePicker from 'expo-image-picker';
import { getSocket } from '../../utils/socket';

const { width } = Dimensions.get('window');

type ChatMessage = {
  id: string;
  orderId: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
};

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const orderId = params.id as string;

  const currentUser = authStore.getUser();
  const token = authStore.getToken();

  const [order, setOrder] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const fetchChatDetails = async (showLoading = false) => {
    if (!orderId || !token) return;
    if (showLoading) setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const resData = await response.json();

      if (response.ok && resData.success) {
        setOrder(resData.data.order);
        setMessages(resData.data.order.chatMessages || []);
      }
    } catch (err) {
      console.error('Error fetching chat details:', err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChatDetails(true);
  }, [orderId]);

  // Connect to Socket.io and listen for chat messages
  useEffect(() => {
    if (!orderId || !token) return;

    const socket = getSocket();
    socket.emit('join_order_channel', { orderId });
    console.log(`🔌 [ChatScreen] Joined order room order_${orderId}`);

    const handleMessageReceived = (msg: ChatMessage) => {
      console.log('🔌 [ChatScreen] Real-time message received:', msg);
      if (msg.senderId !== currentUser?.id) {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    };

    socket.on('chat_message_received', handleMessageReceived);

    return () => {
      socket.off('chat_message_received', handleMessageReceived);
      console.log('🔌 [ChatScreen] Disconnected chat channel listener');
    };
  }, [orderId, token, currentUser?.id]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages.length]);

  // Automatically mark rider messages as read when viewed
  useEffect(() => {
    if (messages.length > 0 && currentUser) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.senderId !== currentUser.id) {
        persistentStorage.setItem(`@last_seen_rider_msg_id_${orderId}`, lastMsg.id).catch(() => {});
      }
    }
  }, [messages, currentUser, orderId]);

  const sendMessage = async () => {
    if (!inputText.trim() || !orderId || !token || !currentUser) return;

    if (!order?.riderId) {
      Alert.alert("Notice", "Cannot send message. No rider is assigned to this order yet.");
      return;
    }

    const textToSend = inputText.trim();
    setInputText('');
    setIsSending(true);

    // Optimistic message creation
    const receiverId = currentUser.id === order.customerId ? order.riderId : order.customerId;
    const tempId = Date.now().toString();
    const tempMsg: ChatMessage = {
      id: tempId,
      orderId,
      senderId: currentUser.id,
      receiverId,
      message: textToSend,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, tempMsg]);

    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: textToSend }),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        // Replace temp msg with real message from server
        setMessages(prev =>
          prev.map(m => m.id === tempId ? resData.data.chatMessage : m)
        );
      } else {
        // Remove temp message and alert error
        setMessages(prev => prev.filter(m => m.id !== tempId));
        Alert.alert('Error', resData.error || 'Failed to send message.');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      Alert.alert('Error', 'Unable to connect to the server.');
    } finally {
      setIsSending(false);
    }
  };

  const sendImageMessage = async (base64Data: string) => {
    if (!orderId || !token || !currentUser) return;

    setIsSending(true);
    const receiverId = currentUser.id === order.customerId ? order.riderId : order.customerId;
    const dataUri = `data:image/jpeg;base64,${base64Data}`;

    // Optimistic image message
    const tempId = Date.now().toString();
    const tempMsg: ChatMessage = {
      id: tempId,
      orderId,
      senderId: currentUser.id,
      receiverId,
      message: dataUri,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, tempMsg]);

    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: dataUri }),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setMessages(prev =>
          prev.map(m => m.id === tempId ? resData.data.chatMessage : m)
        );
      } else {
        setMessages(prev => prev.filter(m => m.id !== tempId));
        Alert.alert('Error', resData.error || 'Failed to send image.');
      }
    } catch (err) {
      console.error('Error sending image:', err);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      Alert.alert('Error', 'Failed to transmit image to server.');
    } finally {
      setIsSending(false);
    }
  };

  const sendLocationMessage = async (lat: number, lng: number, label: string) => {
    if (!orderId || !token || !currentUser) return;
    setIsSending(true);

    const content = `LOCATION:${lat},${lng},${label}`;
    const receiverId = currentUser.id === order.customerId ? order.riderId : order.customerId;

    // Optimistic location message
    const tempId = Date.now().toString();
    const tempMsg: ChatMessage = {
      id: tempId,
      orderId,
      senderId: currentUser.id,
      receiverId,
      message: content,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, tempMsg]);

    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content }),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setMessages(prev =>
          prev.map(m => m.id === tempId ? resData.data.chatMessage : m)
        );
      } else {
        setMessages(prev => prev.filter(m => m.id !== tempId));
        Alert.alert('Error', resData.error || 'Failed to share location.');
      }
    } catch (err) {
      console.error('Error sharing location:', err);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      Alert.alert('Error', 'Failed to transmit location data.');
    } finally {
      setIsSending(false);
    }
  };

  const shareCurrentLocation = async () => {
    if (!orderId || !token) return;

    if (!order?.riderId) {
      Alert.alert("Notice", "Cannot share location. No rider is assigned to this order yet.");
      return;
    }

    Alert.alert(
      "📍 Share Location",
      "Which location would you like to share?",
      [
        {
          text: "🏠 Order Drop-off Address",
          onPress: () => {
            const lat = order.dropoffCoords?.latitude || 8.9515;
            const lng = order.dropoffCoords?.longitude || 125.5280;
            const addr = order.dropoffAddress || "Delivery Address";
            sendLocationMessage(lat, lng, addr);
          }
        },
        {
          text: "📱 My Current Live Coordinates",
          onPress: () => {
            // Simulate current GPS coordinates within Butuan City boundaries
            const lat = 8.9472 + (Math.random() - 0.5) * 0.006;
            const lng = 125.5429 + (Math.random() - 0.5) * 0.006;
            sendLocationMessage(lat, lng, "Live GPS Location");
          }
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  const handleAttachment = () => {
    if (!order?.riderId) {
      Alert.alert("Notice", "Cannot send attachments. No rider has accepted this order yet.");
      return;
    }

    Alert.alert(
      "Send Attachment",
      "Choose what to share:",
      [
        {
          text: "📸 Take Photo",
          onPress: takePhoto,
        },
        {
          text: "🖼️ Choose from Gallery",
          onPress: pickImage,
        },
        {
          text: "📍 Share Location Pin",
          onPress: shareCurrentLocation,
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Permission to access the media library is required!");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        await sendImageMessage(result.assets[0].base64);
      }
    } catch (err) {
      console.error('Error picking image:', err);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Permission to access the camera is required!");
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        await sendImageMessage(result.assets[0].base64);
      }
    } catch (err) {
      console.error('Error taking photo:', err);
      Alert.alert('Error', 'Failed to take photo.');
    }
  };

  const handlePhoneCall = () => {
    const phone = isCurrentUserCustomer ? order.rider?.phone : order.customer?.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert("Notice", "No contact details available.");
    }
  };

  if (!orderId) {
    return (
      <View style={[styles.container, styles.centerAlign]}>
        <AlertCircle size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorDesc}>Invalid Order reference.</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerAlign]}>
        <ActivityIndicator size="large" color="#0047AB" />
        <Text style={styles.loadingText}>Syncing chat log...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, styles.centerAlign, { padding: 24 }]}>
        <AlertCircle size={48} color="#9CA3AF" />
        <Text style={styles.errorTitle}>Order Not Found</Text>
        <Text style={styles.errorDesc}>The active order detail could not be retrieved.</Text>
        <TouchableOpacity style={styles.errorButton} onPress={() => router.back()}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isCurrentUserCustomer = order.customerId === currentUser?.id;
  const partnerName = isCurrentUserCustomer
    ? (order.rider?.name || 'Finding Rider...')
    : (order.customer?.name || 'Customer');
  const partnerSubtext = isCurrentUserCustomer
    ? (order.rider ? `Online • ${order.rider.vehicleModel || 'Motorcycle'}` : 'Waiting for assignment')
    : 'Online • Customer';

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch (e) {
      return '';
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.senderId === currentUser?.id;
    const isImage = item.message.startsWith('data:image/');
    const isLocation = item.message.startsWith('LOCATION:');

    let lat = 0, lng = 0, address = '';
    if (isLocation) {
      try {
        const parts = item.message.replace('LOCATION:', '').split(',');
        lat = parseFloat(parts[0]);
        lng = parseFloat(parts[1]);
        address = parts.slice(2).join(',');
      } catch (e) {
        console.error('Error parsing shared location:', e);
      }
    }

    return (
      <View style={[
        styles.messageBubbleWrapper,
        isMe ? styles.customerWrapper : styles.riderWrapper
      ]}>
        {!isMe && (
          <View style={styles.riderMsgAvatar}>
            <Bike size={14} color="#D4AF37" />
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isMe ? styles.customerBubble : styles.riderBubble,
          (isImage || isLocation) && { paddingHorizontal: 4, paddingVertical: 4, borderRadius: 14 }
        ]}>
          {isImage ? (
            <Image
              source={{ uri: item.message }}
              style={styles.messageImage}
              resizeMode="cover"
            />
          ) : isLocation ? (
            <View style={styles.locationCard}>
              <View style={styles.locationCardHeader}>
                <MapPin size={16} color="#D4AF37" />
                <Text style={styles.locationCardTitle}>Shared Location</Text>
              </View>
              <Text style={styles.locationCardAddress} numberOfLines={2}>
                {address || "Coordinates Pin"}
              </Text>
              <Text style={styles.locationCardCoords}>
                {lat.toFixed(5)}, {lng.toFixed(5)}
              </Text>

              <TouchableOpacity
                style={styles.locationCardButton}
                activeOpacity={0.8}
                onPress={() => {
                  const url = Platform.OS === 'ios'
                    ? `http://maps.apple.com/?q=${lat},${lng}`
                    : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
                  Linking.openURL(url);
                }}
              >
                <Text style={styles.locationCardButtonText}>🗺️ Navigate in Maps</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={[
              styles.messageText,
              isMe ? styles.customerText : styles.riderText
            ]}>
              {item.message}
            </Text>
          )}
          <View style={styles.messageFooter}>
            <Text style={[
              styles.messageTime,
              isMe ? { color: 'rgba(255,255,255,0.6)' } : { color: '#9CA3AF' },
              isLocation && { color: '#9CA3AF', marginRight: 8, marginBottom: 4 }
            ]}>
              {formatTime(item.createdAt)}
            </Text>
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
            <User size={18} color="#D4AF37" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerName} numberOfLines={1}>{partnerName}</Text>
            <View style={styles.onlineIndicator}>
              {order.riderId || !isCurrentUserCustomer ? (
                <View style={styles.onlineDot} />
              ) : null}
              <Text style={styles.onlineText} numberOfLines={1}>{partnerSubtext}</Text>
            </View>
          </View>
        </View>

        {(isCurrentUserCustomer && order.rider) || (!isCurrentUserCustomer && order.customer) ? (
          <TouchableOpacity
            style={styles.headerAction}
            activeOpacity={0.7}
            onPress={handlePhoneCall}
          >
            <Phone size={18} color="#D4AF37" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Order Context Banner */}
      <View style={styles.orderBanner}>
        <Text style={styles.orderBannerText}>
          📦 Order #{orderId.substring(0, 8)}... • {order.status.replace('_', ' ')}
        </Text>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Bike size={48} color="#9CA3AF" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptyDesc}>Start the conversation! Ask about the order state, share photos, or share location pins.</Text>
            </View>
          }
        />

        {/* Input Bar */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
          <TouchableOpacity
            style={styles.attachButton}
            activeOpacity={0.7}
            onPress={handleAttachment}
            disabled={!order.riderId}
          >
            <ImageIcon size={20} color={order.riderId ? "#6B7280" : "#D1D5DB"} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.attachButton}
            activeOpacity={0.7}
            onPress={shareCurrentLocation}
            disabled={!order.riderId}
          >
            <MapPin size={20} color={order.riderId ? "#0047AB" : "#D1D5DB"} />
          </TouchableOpacity>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder={order.riderId ? "Type a message..." : "Waiting for pilot accept..."}
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
              editable={!!order.riderId && !isSending}
            />
          </View>

          {isSending ? (
            <View style={styles.sendButton}>
              <ActivityIndicator size="small" color="#0047AB" />
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.sendButton,
                inputText.trim() && order.riderId ? styles.sendButtonActive : {}
              ]}
              activeOpacity={0.7}
              onPress={sendMessage}
              disabled={!inputText.trim() || !order.riderId}
            >
              <Send size={18} color={inputText.trim() && order.riderId ? '#FFFFFF' : '#9CA3AF'} />
            </TouchableOpacity>
          )}
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
  centerAlign: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginTop: 16,
  },
  errorDesc: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 32,
  },
  errorButton: {
    marginTop: 20,
    backgroundColor: '#0047AB',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
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
    paddingBottom: 24,
    gap: 8,
    flexGrow: 1,
  },

  // Empty placeholder
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 64,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#374151',
  },
  emptyDesc: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
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
  messageImage: {
    width: 220,
    height: 160,
    borderRadius: 12,
  },
  locationCard: {
    width: 220,
    padding: 12,
    backgroundColor: '#050A18',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
  },
  locationCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  locationCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D4AF37',
  },
  locationCardAddress: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    lineHeight: 16,
    marginBottom: 4,
  },
  locationCardCoords: {
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 8,
  },
  locationCardButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  locationCardButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#050A18',
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
    fontWeight: '500',
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
    minHeight: 24,
    textAlignVertical: 'top',
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
