import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Star, Heart, Phone, MoreHorizontal, ShieldCheck } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FavoriteRidersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const favoriteRiders = [
    {
      id: '1',
      name: 'Mark Santos',
      vehicle: 'Honda Click 125i',
      rating: '4.9',
      trips: 12,
      isVerified: true
    },
    {
      id: '2',
      name: 'Anna Cruz',
      vehicle: 'Yamaha Mio i125',
      rating: '5.0',
      trips: 8,
      isVerified: true
    },
    {
      id: '3',
      name: 'John Doe',
      vehicle: 'Suzuki Skydrive',
      rating: '4.8',
      trips: 3,
      isVerified: false
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
          <Text style={styles.headerTitle}>Favorite Riders</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>YOUR TRUSTED RIDERS</Text>
        
        {favoriteRiders.map((rider) => (
          <View key={rider.id} style={styles.riderCard}>
            <View style={styles.riderHeader}>
              <View style={styles.avatar}>
                <Heart size={20} color="#EF4444" fill="#EF4444" />
              </View>
              <View style={styles.riderInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.riderName}>{rider.name}</Text>
                  {rider.isVerified && (
                    <ShieldCheck size={14} color="#10B981" style={{ marginLeft: 4 }} />
                  )}
                </View>
                <Text style={styles.riderVehicle}>{rider.vehicle}</Text>
                <View style={styles.statsRow}>
                  <Star size={12} color="#D4AF37" fill="#D4AF37" />
                  <Text style={styles.ratingText}>{rider.rating}</Text>
                  <Text style={styles.tripsText}>• {rider.trips} trips with you</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.moreButton}>
                <MoreHorizontal size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.bookButton} activeOpacity={0.8}>
                <Text style={styles.bookButtonText}>Book Directly</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.callButton} activeOpacity={0.8}>
                <Phone size={18} color="#0047AB" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

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
    gap: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  riderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 3,
  },
  riderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  riderInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riderName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
  riderVehicle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4AF37',
  },
  tripsText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  moreButton: {
    padding: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  bookButton: {
    flex: 1,
    backgroundColor: '#0047AB',
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  callButton: {
    width: 48,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
});
