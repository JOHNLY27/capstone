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
import { ArrowLeft, MapPin, Map } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authStore } from '../../utils/auth-store';
import { API_URL } from '../../constants/api';

export default function RiderAreasScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [areas, setAreas] = useState({
    downtown: true,
    buhangin: true,
    libertad: false,
    ampayon: false,
    bancasi: false,
  });

  const [isLoading, setIsLoading] = useState(true);

  const fetchServiceAreas = async () => {
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
        setAreas({
          downtown: s.area_downtown !== undefined ? s.area_downtown : true,
          buhangin: s.area_buhangin !== undefined ? s.area_buhangin : true,
          libertad: s.area_libertad || false,
          ampayon: s.area_ampayon || false,
          bancasi: s.area_bancasi || false,
        });
      }
    } catch (e) {
      console.error('Error fetching preferred areas:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceAreas();
  }, []);

  const toggleArea = async (key: keyof typeof areas) => {
    const updatedAreas = {
      ...areas,
      [key]: !areas[key]
    };
    
    setAreas(updatedAreas);

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
        area_downtown: updatedAreas.downtown,
        area_buhangin: updatedAreas.buhangin,
        area_libertad: updatedAreas.libertad,
        area_ampayon: updatedAreas.ampayon,
        area_bancasi: updatedAreas.bancasi,
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
        setAreas(areas); // Rollback
        Alert.alert('Notice', 'Failed to update preferences on server.');
      }
    } catch (e) {
      setAreas(areas); // Rollback
      Alert.alert('Connection Error', 'Failed to save changes.');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerAlign]}>
        <ActivityIndicator size="large" color="#050A18" />
        <Text style={styles.loadingText}>Syncing service regions...</Text>
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
          <Text style={styles.headerTitle}>Service Areas</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mapPlaceholder}>
          <Map size={36} color="#D4AF37" />
          <Text style={styles.mapText}>Butuan City Delivery Zones</Text>
        </View>

        <Text style={styles.sectionTitle}>PREFERRED DELIVERY ZONES</Text>
        <Text style={styles.sectionDesc}>Turn on the areas where you prefer to receive orders.</Text>
        
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MapPin size={20} color={areas.downtown ? "#050A18" : "#9CA3AF"} />
              <View>
                <Text style={[styles.settingLabel, areas.downtown && styles.settingLabelActive]}>Downtown / City Proper</Text>
                <Text style={styles.settingDesc}>High volume of Pabili & Food orders</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#E5E7EB", true: "rgba(5, 10, 24, 0.4)" }}
              thumbColor={areas.downtown ? "#050A18" : "#FFFFFF"}
              ios_backgroundColor="#E5E7EB"
              onValueChange={() => toggleArea('downtown')}
              value={areas.downtown}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MapPin size={20} color={areas.buhangin ? "#050A18" : "#9CA3AF"} />
              <View>
                <Text style={[styles.settingLabel, areas.buhangin && styles.settingLabelActive]}>Buhangin / Baan</Text>
                <Text style={styles.settingDesc}>Mostly Pahatod & Residential</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#E5E7EB", true: "rgba(5, 10, 24, 0.4)" }}
              thumbColor={areas.buhangin ? "#050A18" : "#FFFFFF"}
              ios_backgroundColor="#E5E7EB"
              onValueChange={() => toggleArea('buhangin')}
              value={areas.buhangin}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MapPin size={20} color={areas.libertad ? "#050A18" : "#9CA3AF"} />
              <View>
                <Text style={[styles.settingLabel, areas.libertad && styles.settingLabelActive]}>Libertad / Doongan</Text>
                <Text style={styles.settingDesc}>Mixed Commercial & Residential</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#E5E7EB", true: "rgba(5, 10, 24, 0.4)" }}
              thumbColor={areas.libertad ? "#050A18" : "#FFFFFF"}
              ios_backgroundColor="#E5E7EB"
              onValueChange={() => toggleArea('libertad')}
              value={areas.libertad}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MapPin size={20} color={areas.ampayon ? "#050A18" : "#9CA3AF"} />
              <View>
                <Text style={[styles.settingLabel, areas.ampayon && styles.settingLabelActive]}>Ampayon</Text>
                <Text style={styles.settingDesc}>Long distance deliveries</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#E5E7EB", true: "rgba(5, 10, 24, 0.4)" }}
              thumbColor={areas.ampayon ? "#050A18" : "#FFFFFF"}
              ios_backgroundColor="#E5E7EB"
              onValueChange={() => toggleArea('ampayon')}
              value={areas.ampayon}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MapPin size={20} color={areas.bancasi ? "#050A18" : "#9CA3AF"} />
              <View>
                <Text style={[styles.settingLabel, areas.bancasi && styles.settingLabelActive]}>Bancasi / Airport</Text>
                <Text style={styles.settingDesc}>Airport pick-ups & Drop-offs</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#E5E7EB", true: "rgba(5, 10, 24, 0.4)" }}
              thumbColor={areas.bancasi ? "#050A18" : "#FFFFFF"}
              ios_backgroundColor="#E5E7EB"
              onValueChange={() => toggleArea('bancasi')}
              value={areas.bancasi}
            />
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
    gap: 16,
  },
  mapPlaceholder: {
    height: 160,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  mapText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#D4AF37',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    marginTop: -12,
    fontWeight: '500',
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
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  settingLabelActive: {
    fontWeight: '700',
    color: '#1F2937',
  },
  settingDesc: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 52,
  },
});
