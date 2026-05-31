import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Package, History, Wallet, User } from 'lucide-react-native';

export default function CustomerTabsLayout() {
  return (
    <Tabs screenOptions={{ 
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
        name="wallet" 
        options={{ 
          title: 'Wallet', 
          tabBarIcon: ({ color }) => <Wallet size={22} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile', 
          tabBarIcon: ({ color }) => <User size={22} color={color} /> 
        }} 
      />
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
      <Tabs.Screen name="support-chat" options={{ href: null, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}
