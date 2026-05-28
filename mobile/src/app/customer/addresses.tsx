import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Plus, Home, Briefcase, MoreHorizontal } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddressesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const savedAddresses = [
    {
      id: '1',
      label: 'Home',
      address: 'Buhangin, Butuan City, Agusan del Norte',
      details: 'Near the blue gate',
      isDefault: true,
      icon: Home
    },
    {
      id: '2',
      label: 'Work',
      address: 'City Hall, Butuan City, Agusan del Norte',
      details: 'Leave at the front desk',
      isDefault: false,
      icon: Briefcase
    },
    {
      id: '3',
      label: 'Parents House',
      address: 'Villa Kananga, Butuan City',
      details: '',
      isDefault: false,
      icon: MapPin
    }
  ];

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
          <Text style={styles.headerTitle}>Saved Addresses</Text>
          <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>YOUR LOCATIONS</Text>
        
        {savedAddresses.map((addr) => {
          const Icon = addr.icon;
          return (
            <View key={addr.id} style={[styles.addressCard, addr.isDefault && styles.defaultCard]}>
              <View style={styles.iconContainer}>
                <Icon size={24} color={addr.isDefault ? "#0047AB" : "#6B7280"} />
              </View>
              <View style={styles.addressInfo}>
                <View style={styles.labelRow}>
                  <Text style={styles.addressLabel}>{addr.label}</Text>
                  {addr.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.addressText}>{addr.address}</Text>
                {addr.details ? (
                  <Text style={styles.detailsText}>Note: {addr.details}</Text>
                ) : null}
              </View>
              <TouchableOpacity style={styles.moreButton}>
                <MoreHorizontal size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          );
        })}
        
        <TouchableOpacity style={styles.addNewCard} activeOpacity={0.8}>
          <View style={styles.addNewIcon}>
            <Plus size={24} color="#0047AB" />
          </View>
          <Text style={styles.addNewText}>Add New Address</Text>
        </TouchableOpacity>

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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#D4AF37',
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
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  defaultCard: {
    borderColor: 'rgba(0, 71, 171, 0.2)',
    borderWidth: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  addressInfo: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
  defaultBadge: {
    backgroundColor: 'rgba(0, 71, 171, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0047AB',
  },
  addressText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  moreButton: {
    padding: 4,
  },
  addNewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 71, 171, 0.05)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(0, 71, 171, 0.1)',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addNewIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  addNewText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0047AB',
  },
});
