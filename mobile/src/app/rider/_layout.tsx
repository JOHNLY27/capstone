import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Navigation, DollarSign, History, User } from 'lucide-react-native';

export default function RiderTabsLayout() {
  return (
    <Tabs backBehavior="history" screenOptions={{ 
      headerShown: false, 
      tabBarActiveTintColor: '#D4AF37',
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
        name="delivery" 
        options={{ 
          title: 'Delivery', 
          tabBarIcon: ({ color }) => <Navigation size={22} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="earnings" 
        options={{ 
          title: 'Earnings', 
          tabBarIcon: ({ color }) => <DollarSign size={22} color={color} /> 
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
        name="profile" 
        options={{ 
          title: 'Profile', 
          tabBarIcon: ({ color }) => <User size={22} color={color} /> 
        }} 
      />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="edit-profile" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="documents" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="performance" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="areas" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="notifications-settings" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="privacy-settings" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="help" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="support-chat" options={{ href: null, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}
