import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Key, EyeOff, ShieldAlert, Trash2, ChevronRight } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
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
          <Text style={styles.headerTitle}>Privacy & Security</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SECURITY</Text>
          
          <View style={styles.card}>
            <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
              <View style={styles.actionInfo}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(0, 71, 171, 0.1)' }]}>
                  <Key size={20} color="#0047AB" />
                </View>
                <View>
                  <Text style={styles.actionLabel}>Change Password</Text>
                  <Text style={styles.actionDesc}>Update your login credentials</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#C7C7CC" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
              <View style={styles.actionInfo}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(212, 175, 55, 0.1)' }]}>
                  <ShieldAlert size={20} color="#D4AF37" />
                </View>
                <View>
                  <Text style={styles.actionLabel}>Two-Factor Auth</Text>
                  <Text style={styles.actionDesc}>Add an extra layer of security</Text>
                </View>
              </View>
              <Text style={styles.statusText}>Off</Text>
              <ChevronRight size={20} color="#C7C7CC" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRIVACY</Text>
          
          <View style={styles.card}>
            <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
              <View style={styles.actionInfo}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(107, 114, 128, 0.1)' }]}>
                  <EyeOff size={20} color="#6B7280" />
                </View>
                <View>
                  <Text style={styles.actionLabel}>Data Sharing</Text>
                  <Text style={styles.actionDesc}>Manage analytics and tracking</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#C7C7CC" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>DANGER ZONE</Text>
          
          <View style={[styles.card, { borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
            <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
              <View style={styles.actionInfo}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                  <Trash2 size={20} color="#EF4444" />
                </View>
                <View>
                  <Text style={[styles.actionLabel, { color: '#EF4444' }]}>Delete Account</Text>
                  <Text style={styles.actionDesc}>Permanently remove your data</Text>
                </View>
              </View>
            </TouchableOpacity>
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  actionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  actionDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statusText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 72,
  },
});
