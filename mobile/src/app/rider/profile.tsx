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
import { User, MapPin, Phone, Mail, ChevronRight, LogOut, Bell, Shield, HelpCircle, FileText, Star } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RiderProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const menuItems = [
    { icon: User, label: "Edit Profile", path: "/rider/edit-profile" },
    { icon: FileText, label: "Documents", path: "/rider/documents" },
    { icon: Star, label: "Performance & Reviews", path: "/rider/performance" },
    { icon: MapPin, label: "Service Areas", path: "/rider/areas" },
    { icon: Bell, label: "Notifications Settings", path: "/rider/notifications-settings" },
    { icon: Shield, label: "Privacy & Security", path: "/rider/privacy-settings" },
    { icon: HelpCircle, label: "Help & Support", path: "/rider/help" },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Top Banner Header */}
      <View style={[styles.header, { paddingTop: insets.top || 20 }]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>Rider Partner Commander</Text>
        </View>
      </View>

      {/* Scrollable details view */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.body}>
          {/* Rider Profile Card */}
          <View style={styles.userCard}>
            <View style={styles.userRow}>
              <View style={styles.avatarWrapper}>
                <User size={36} color="#D4AF37" />
              </View>
              <View>
                <Text style={styles.userName}>Mark Santos</Text>
                <Text style={styles.userRole}>Erran Rider Partner</Text>
                
                {/* Stats Badges */}
                <View style={styles.badgeRow}>
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>⭐ 4.9</Text>
                  </View>
                  <View style={styles.tripsBadge}>
                    <Text style={styles.tripsText}>185 deliveries</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Info details */}
            <View style={styles.userInfoList}>
              <View style={styles.infoRow}>
                <Mail size={16} color="#9CA3AF" />
                <Text style={styles.infoText}>mark.santos@email.com</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Phone size={16} color="#9CA3AF" />
                <Text style={styles.infoText}>0912 345 6789</Text>
              </View>

              <View style={styles.infoRow}>
                <MapPin size={16} color="#9CA3AF" />
                <Text style={styles.infoText}>Buhangin, Butuan City, Agusan del Norte</Text>
              </View>
            </View>
          </View>

          {/* Settings Menu List */}
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
            <Text style={styles.logoutText}>LOGOUT PARTNER</Text>
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
    backgroundColor: '#050A18',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    paddingBottom: 24,
    shadowColor: '#050A18',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
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
    backgroundColor: '#050A18',
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
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  ratingBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D4AF37',
  },
  tripsBadge: {
    backgroundColor: 'rgba(0, 71, 171, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
  },
  tripsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0047AB',
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
    flex: 1,
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
