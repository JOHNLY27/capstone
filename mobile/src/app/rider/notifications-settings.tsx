import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, DollarSign, Map, Zap } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authStore } from '../../utils/auth-store';
import { API_URL } from '../../constants/api';

export default function RiderNotificationsSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [settings, setSettings] = useState({
    newRequests: true,
    earningsAlerts: true,
    heatmaps: false,
    promos: true,
  });

  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    const token = authStore.getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/auth/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await response.json();
      if (response.ok && resData.success) {
        const s = resData.settings || {};
        setSettings({
          newRequests: s.rider_newRequests !== undefined ? s.rider_newRequests : true,
          earningsAlerts: s.rider_earningsAlerts !== undefined ? s.rider_earningsAlerts : true,
          heatmaps: s.rider_heatmaps || false,
          promos: s.rider_promos !== undefined ? s.rider_promos : true,
        });
      }
    } catch (e) {
      console.error('Error fetching settings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const toggleSetting = async (key: keyof typeof settings) => {
    const updatedSettings = {
      ...settings,
      [key]: !settings[key]
    };
    
    setSettings(updatedSettings);

    const token = authStore.getToken();
    if (!token) return;

    try {
      // Fetch full settings, merge, and PUT
      const response = await fetch(`${API_URL}/api/auth/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await response.json();
      const currentFullSettings = response.ok && resData.success ? (resData.settings || {}) : {};

      const fullSettings = {
        ...currentFullSettings,
        rider_newRequests: updatedSettings.newRequests,
        rider_earningsAlerts: updatedSettings.earningsAlerts,
        rider_heatmaps: updatedSettings.heatmaps,
        rider_promos: updatedSettings.promos,
      };

      const saveResponse = await fetch(`${API_URL}/api/auth/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings: fullSettings })
      });
      
      const saveData = await saveResponse.json();
      if (!saveResponse.ok || !saveData.success) {
        setSettings(settings); // Rollback
        Alert.alert('Notice', 'Failed to update preferences on server.');
      }
    } catch (e) {
      setSettings(settings); // Rollback
      Alert.alert('Connection Error', 'Failed to save changes.');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerAlign]}>
        <ActivityIndicator size="large" color="#050A18" />
        <Text style={styles.loadingText}>Syncing alert preferences...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top || 20 }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => router.push('/rider/profile' as any)}
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
        
        {/* Core Alerts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DELIVERY ALERTS</Text>
          
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(5, 10, 24, 0.05)' }]}>
                  <Zap size={20} color="#050A18" />
                </View>
                <View>
                  <Text style={styles.settingLabel}>New Requests</Text>
                  <Text style={styles.settingDesc}>Get notified for new jobs nearby</Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: "#E5E7EB", true: "rgba(5, 10, 24, 0.4)" }}
                thumbColor={settings.newRequests ? "#050A18" : "#FFFFFF"}
                ios_backgroundColor="#E5E7EB"
                onValueChange={() => toggleSetting('newRequests')}
                value={settings.newRequests}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                  <DollarSign size={20} color="#10B981" />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Earnings Updates</Text>
                  <Text style={styles.settingDesc}>Daily and weekly summaries</Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: "#E5E7EB", true: "rgba(16, 185, 129, 0.5)" }}
                thumbColor={settings.earningsAlerts ? "#10B981" : "#FFFFFF"}
                ios_backgroundColor="#E5E7EB"
                onValueChange={() => toggleSetting('earningsAlerts')}
                value={settings.earningsAlerts}
              />
            </View>
          </View>
        </View>

        {/* Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INSIGHTS & OFFERS</Text>
          
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                  <Map size={20} color="#EF4444" />
                </View>
                <View>
                  <Text style={styles.settingLabel}>High Demand Areas</Text>
                  <Text style={styles.settingDesc}>Alerts when zones turn red (surge)</Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: "#E5E7EB", true: "rgba(239, 68, 68, 0.5)" }}
                thumbColor={settings.heatmaps ? "#EF4444" : "#FFFFFF"}
                ios_backgroundColor="#E5E7EB"
                onValueChange={() => toggleSetting('heatmaps')}
                value={settings.heatmaps}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(212, 175, 55, 0.1)' }]}>
                  <Bell size={20} color="#D4AF37" />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Rider Promos & Incentives</Text>
                  <Text style={styles.settingDesc}>News on how to earn more</Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: "#E5E7EB", true: "rgba(212, 175, 55, 0.5)" }}
                thumbColor={settings.promos ? "#D4AF37" : "#FFFFFF"}
                ios_backgroundColor="#E5E7EB"
                onValueChange={() => toggleSetting('promos')}
                value={settings.promos}
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
  centerAlign: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#050A18',
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#050A18',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
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
    flex: 1,
    paddingRight: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
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
