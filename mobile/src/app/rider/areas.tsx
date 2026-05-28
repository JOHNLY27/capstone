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
import { ArrowLeft, MapPin, Map } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

  const toggleArea = (key: keyof typeof areas) => {
    setAreas(prev => ({ ...prev, [key]: !prev[key] }));
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
          <Map size={48} color="#D4AF37" />
          <Text style={styles.mapText}>Live Map Preview Disabled</Text>
        </View>

        <Text style={styles.sectionTitle}>PREFERRED DELIVERY ZONES</Text>
        <Text style={styles.sectionDesc}>Turn on the areas where you prefer to receive orders.</Text>
        
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MapPin size={20} color={areas.downtown ? "#1E3A8A" : "#9CA3AF"} />
              <View>
                <Text style={[styles.settingLabel, areas.downtown && styles.settingLabelActive]}>Downtown / City Proper</Text>
                <Text style={styles.settingDesc}>High volume of Pabili & Food orders</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#E5E7EB", true: "rgba(30, 58, 138, 0.5)" }}
              thumbColor={areas.downtown ? "#1E3A8A" : "#FFFFFF"}
              ios_backgroundColor="#E5E7EB"
              onValueChange={() => toggleArea('downtown')}
              value={areas.downtown}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MapPin size={20} color={areas.buhangin ? "#1E3A8A" : "#9CA3AF"} />
              <View>
                <Text style={[styles.settingLabel, areas.buhangin && styles.settingLabelActive]}>Buhangin / Baan</Text>
                <Text style={styles.settingDesc}>Mostly Pahatod & Residential</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#E5E7EB", true: "rgba(30, 58, 138, 0.5)" }}
              thumbColor={areas.buhangin ? "#1E3A8A" : "#FFFFFF"}
              ios_backgroundColor="#E5E7EB"
              onValueChange={() => toggleArea('buhangin')}
              value={areas.buhangin}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MapPin size={20} color={areas.libertad ? "#1E3A8A" : "#9CA3AF"} />
              <View>
                <Text style={[styles.settingLabel, areas.libertad && styles.settingLabelActive]}>Libertad / Doongan</Text>
                <Text style={styles.settingDesc}>Mixed Commercial & Residential</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#E5E7EB", true: "rgba(30, 58, 138, 0.5)" }}
              thumbColor={areas.libertad ? "#1E3A8A" : "#FFFFFF"}
              ios_backgroundColor="#E5E7EB"
              onValueChange={() => toggleArea('libertad')}
              value={areas.libertad}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MapPin size={20} color={areas.ampayon ? "#1E3A8A" : "#9CA3AF"} />
              <View>
                <Text style={[styles.settingLabel, areas.ampayon && styles.settingLabelActive]}>Ampayon</Text>
                <Text style={styles.settingDesc}>Long distance deliveries</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#E5E7EB", true: "rgba(30, 58, 138, 0.5)" }}
              thumbColor={areas.ampayon ? "#1E3A8A" : "#FFFFFF"}
              ios_backgroundColor="#E5E7EB"
              onValueChange={() => toggleArea('ampayon')}
              value={areas.ampayon}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MapPin size={20} color={areas.bancasi ? "#1E3A8A" : "#9CA3AF"} />
              <View>
                <Text style={[styles.settingLabel, areas.bancasi && styles.settingLabelActive]}>Bancasi / Airport</Text>
                <Text style={styles.settingDesc}>Airport pick-ups & Drop-offs</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#E5E7EB", true: "rgba(30, 58, 138, 0.5)" }}
              thumbColor={areas.bancasi ? "#1E3A8A" : "#FFFFFF"}
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
  header: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#1E3A8A',
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
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 52,
  },
});
