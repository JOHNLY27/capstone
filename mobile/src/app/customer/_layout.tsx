import React, { useState, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Home, Package, History, Wallet, User, MessageSquare } from 'lucide-react-native';
import { authStore } from '../../utils/auth-store';
import { persistentStorage } from '../../utils/persistent-storage';
import { API_URL } from '../../constants/api';
import { settingsStore } from '../../utils/settings-store';

export default function CustomerTabsLayout() {
  const [badgeCount, setBadgeCount] = useState<number>(0);

  useEffect(() => {
    settingsStore.loadSettings();
    const checkUnreadChats = async () => {
      const token = authStore.getToken();
      const user = authStore.getUser();
      if (!token || !user) {
        setBadgeCount(0);
        return;
      }

      try {
        // 1. Fetch active rider chats and calculate unread messages
        const ordersRes = await fetch(`${API_URL}/api/orders/customer`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const ordersData = await ordersRes.json();
        let unreadRider = 0;
        if (ordersRes.ok && ordersData.success) {
          const orders = ordersData.data.orders || [];
          const activeOrders = orders.filter((o: any) => 
            ['ACCEPTED', 'IN_TRANSIT'].includes(o.status) && o.riderId
          );
          
          for (const order of activeOrders) {
            const chatMsgs = order.chatMessages || [];
            if (chatMsgs.length > 0) {
              const lastMsg = chatMsgs[0]; // take: 1 yields last message as index 0
              if (lastMsg.senderId !== user.id) {
                const lastSeenId = await persistentStorage.getItem(`@last_seen_rider_msg_id_${order.id}`);
                if (lastSeenId !== lastMsg.id) {
                  unreadRider++;
                }
              }
            }
          }
        }

        // 2. Fetch admin support messages
        const supportRes = await fetch(`${API_URL}/api/support/messages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const supportData = await supportRes.json();
        let unreadAdmin = 0;
        if (supportRes.ok && supportData.success) {
          const msgs = supportData.messages || [];
          if (msgs.length > 0) {
            const lastMsg = msgs[msgs.length - 1];
            if (lastMsg.senderId !== user.id) {
              const lastSeenId = await persistentStorage.getItem('@last_seen_admin_msg_id');
              if (lastSeenId !== lastMsg.id) {
                unreadAdmin = 1;
              }
            }
          }
        }

        setBadgeCount(unreadRider + unreadAdmin);
      } catch (e) {
        console.error('Error calculating chat badges:', e);
      }
    };

    checkUnreadChats();
    const interval = setInterval(checkUnreadChats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Tabs backBehavior="history" screenOptions={{ 
      headerShown: false, 
      tabBarActiveTintColor: '#0047AB',
      tabBarInactiveTintColor: '#6B7280',
      tabBarLabelStyle: {
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 2,
      },
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        height: 64,
        paddingBottom: 10,
        paddingTop: 8,
      }
    }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home', 
          tabBarIcon: ({ color }) => <Home size={22} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="orders" 
        options={{ 
          title: 'Orders', 
          tabBarIcon: ({ color }) => <Package size={22} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="history" 
        options={{ 
          title: 'History', 
          tabBarIcon: ({ color }) => <History size={22} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="support-chat" 
        options={{ 
          title: 'Live Chat', 
          tabBarIcon: ({ color }) => <MessageSquare size={22} color={color} />,
          tabBarBadge: badgeCount > 0 ? badgeCount : undefined
        }} 
      />
      <Tabs.Screen name="wallet" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="profile" options={{ 
        title: 'Profile', 
        tabBarIcon: ({ color }) => <User size={22} color={color} /> 
      }} />
      <Tabs.Screen name="pabili" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="pasugo" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="pakuha" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="pahatod" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="ride" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="edit-profile" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="addresses" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="notifications-settings" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="privacy-settings" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="favorite-riders" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="help" options={{ href: null, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}
