import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
  Switch
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Smartphone, Mail, MessageSquare, Package } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NotificationsSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [settings, setSettings] = useState({
    pushNotifications: true,
    smsAlerts: false,
    emailPromos: true,
    orderUpdates: true,
    chatMessages: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top || 20 }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => router.push('/customer/profile' as any)}
          >
            <ArrowLeft size={20} color="#D4AF37" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Main Toggles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DELIVERY METHODS</Text>
          
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={styles.iconBox}>
                  <Bell size={20} color="#0047AB" />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Push Notifications</Text>
                  <Text style={styles.settingDesc}>Receive alerts on your device</Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: "#E5E7EB", true: "rgba(0, 71, 171, 0.5)" }}
                thumbColor={settings.pushNotifications ? "#0047AB" : "#FFFFFF"}
                ios_backgroundColor="#E5E7EB"
                onValueChange={() => toggleSetting('pushNotifications')}
                value={settings.pushNotifications}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={styles.iconBox}>
                  <Smartphone size={20} color="#0047AB" />
                </View>
                <View>
                  <Text style={styles.settingLabel}>SMS Alerts</Text>
                  <Text style={styles.settingDesc}>Get text messages for updates</Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: "#E5E7EB", true: "rgba(0, 71, 171, 0.5)" }}
                thumbColor={settings.smsAlerts ? "#0047AB" : "#FFFFFF"}
                ios_backgroundColor="#E5E7EB"
                onValueChange={() => toggleSetting('smsAlerts')}
                value={settings.smsAlerts}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={styles.iconBox}>
                  <Mail size={20} color="#0047AB" />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Email Promos</Text>
                  <Text style={styles.settingDesc}>Exclusive deals and news</Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: "#E5E7EB", true: "rgba(0, 71, 171, 0.5)" }}
                thumbColor={settings.emailPromos ? "#0047AB" : "#FFFFFF"}
                ios_backgroundColor="#E5E7EB"
                onValueChange={() => toggleSetting('emailPromos')}
                value={settings.emailPromos}
              />
            </View>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICATION TYPES</Text>
          
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                  <Package size={20} color="#10B981" />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Order Updates</Text>
                  <Text style={styles.settingDesc}>Status changes for active orders</Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: "#E5E7EB", true: "rgba(16, 185, 129, 0.5)" }}
                thumbColor={settings.orderUpdates ? "#10B981" : "#FFFFFF"}
                ios_backgroundColor="#E5E7EB"
                onValueChange={() => toggleSetting('orderUpdates')}
                value={settings.orderUpdates}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(212, 175, 55, 0.1)' }]}>
                  <MessageSquare size={20} color="#D4AF37" />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Chat Messages</Text>
                  <Text style={styles.settingDesc}>New messages from riders</Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: "#E5E7EB", true: "rgba(212, 175, 55, 0.5)" }}
                thumbColor={settings.chatMessages ? "#D4AF37" : "#FFFFFF"}
                ios_backgroundColor="#E5E7EB"
                onValueChange={() => toggleSetting('chatMessages')}
                value={settings.chatMessages}
              />
            </View>
          </View>
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
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#0047AB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 71, 171, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  settingDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 72,
  },
});
