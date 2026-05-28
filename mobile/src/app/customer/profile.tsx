import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { User, MapPin, Phone, Mail, ChevronRight, LogOut, Bell, Shield, HelpCircle, Heart } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CustomerProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const menuItems = [
    { icon: User, label: "Edit Profile", path: "/customer/edit-profile" },
    { icon: MapPin, label: "Saved Addresses", path: "/customer/addresses" },
    { icon: Bell, label: "Notifications Settings", path: "/customer/notifications-settings" },
    { icon: Shield, label: "Privacy & Security", path: "/customer/privacy-settings" },
    { icon: Heart, label: "Favorite Riders", path: "/customer/favorite-riders" },
    { icon: HelpCircle, label: "Help & Support", path: "/customer/help" },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Premium Header */}
      <View style={[styles.header, { paddingTop: insets.top || 20 }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>Personal Command Center</Text>
        </View>
      </View>

      {/* Profile Body */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.body}>
          {/* User Card */}
          <View style={styles.userCard}>
            <View style={styles.userRow}>
              <View style={styles.avatarWrapper}>
                <User size={36} color="#D4AF37" />
              </View>
              <View>
                <Text style={styles.userName}>Juan Dela Cruz</Text>
                <Text style={styles.userRole}>Customer Commander</Text>
              </View>
            </View>

            <View style={styles.userInfoList}>
              <View style={styles.infoRow}>
                <Mail size={16} color="#9CA3AF" />
                <Text style={styles.infoText}>juan.delacruz@email.com</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Phone size={16} color="#9CA3AF" />
                <Text style={styles.infoText}>0912 345 6789</Text>
              </View>

              <View style={styles.infoRow}>
                <MapPin size={16} color="#9CA3AF" />
                <Text style={styles.infoText}>Buhangin, Butuan City</Text>
              </View>
            </View>
          </View>

          {/* Menu Options */}
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.menuItem,
                    index === menuItems.length - 1 && styles.lastMenuItem
                  ]}
                  activeOpacity={0.7}
                  onPress={() => router.push(item.path as any)}
                >
                  <View style={styles.menuItemLeft}>
                    <IconComponent size={20} color="#6B7280" />
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>
                  <ChevronRight size={18} color="#C7C7CC" />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Logout Action */}
          <TouchableOpacity 
            style={styles.logoutButton}
            activeOpacity={0.8}
            onPress={() => router.replace('/login')}
          >
            <LogOut size={16} color="#EF4444" />
            <Text style={styles.logoutText}>LOGOUT COMMAND</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#0047AB',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    paddingBottom: 24,
    shadowColor: '#0047AB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  headerContent: {
    width: '100%',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    fontStyle: 'italic',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D4AF37',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  body: {
    padding: 24,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 20,
    marginBottom: 20,
  },
  avatarWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0047AB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  userRole: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
    marginTop: 2,
  },
  userInfoList: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 16,
    paddingVertical: 16,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
});
