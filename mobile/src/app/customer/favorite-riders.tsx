import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Star, Heart, Phone, ShieldCheck, HeartOff, Bike } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authStore } from '../../utils/auth-store';
import { API_URL } from '../../constants/api';

export default function FavoriteRidersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFavoriteRiders = async () => {
    const token = authStore.getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setFavorites(resData.favorites || []);
      } else {
        Alert.alert('Error', resData.error || 'Failed to fetch favorites.');
      }
    } catch (err) {
      console.error('Error fetching favorite riders:', err);
      Alert.alert('Error', 'Unable to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavoriteRiders();
  }, []);

  const handlePhoneCall = (phone: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('Notice', 'No contact details available for this pilot.');
    }
  };

  const removeFavorite = (riderId: string, name: string) => {
    Alert.alert(
      "Remove Favorite",
      `Are you sure you want to remove ${name} from your favorite riders?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const token = authStore.getToken();
            if (!token) return;

            try {
              const response = await fetch(`${API_URL}/api/favorites/toggle`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ riderId }),
              });

              const resData = await response.json();
              if (response.ok && resData.success) {
                setFavorites(prev => prev.filter(item => item.riderId !== riderId));
                Alert.alert('Success', 'Rider removed from favorites.');
              } else {
                Alert.alert('Error', resData.error || 'Failed to remove rider.');
              }
            } catch (err) {
              console.error('Unfavorite error:', err);
              Alert.alert('Error', 'Failed to complete transaction.');
            }
          }
        }
      ]
    );
  };

  const handleDirectBooking = (riderId: string, name: string) => {
    Alert.alert(
      "🎯 Direct Booking Request",
      `Choose a service to request ${name} directly. Only they will receive this order:`,
      [
        {
          text: "📦 Pahatod (Courier Drop-Off)",
          onPress: () => router.push(`/customer/pahatod?targetRiderId=${riderId}&targetRiderName=${encodeURIComponent(name)}` as any)
        },
        {
          text: "🛒 Pabili (Shopping)",
          onPress: () => router.push(`/customer/pabili?targetRiderId=${riderId}&targetRiderName=${encodeURIComponent(name)}` as any)
        },
        {
          text: "🛵 FMU Ride (Transport)",
          onPress: () => router.push(`/customer/ride?targetRiderId=${riderId}&targetRiderName=${encodeURIComponent(name)}` as any)
        },
        {
          text: "📦 Pakuha (Package Pickup)",
          onPress: () => router.push(`/customer/pakuha?targetRiderId=${riderId}&targetRiderName=${encodeURIComponent(name)}` as any)
        },
        {
          text: "⚡ Pasugo (Errand)",
          onPress: () => router.push(`/customer/pasugo?targetRiderId=${riderId}&targetRiderName=${encodeURIComponent(name)}` as any)
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerAlign]}>
        <ActivityIndicator size="large" color="#0047AB" />
        <Text style={styles.loadingText}>Loading trusted pilots...</Text>
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
        
        {favorites.length === 0 ? (
          <View style={styles.emptyCard}>
            <Heart size={44} color="#D1D5DB" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>No Favorites Saved</Text>
            <Text style={styles.emptyDesc}>
              Tap the Heart icon on any active tracking screen to save your trusted riders here!
            </Text>
          </View>
        ) : (
          favorites.map((item) => {
            const rider = item.rider;
            const vehicle = rider.riderDocuments?.[0]?.vehicleModel || 'Motorcycle';
            
            return (
              <View key={item.id} style={styles.riderCard}>
                <View style={styles.riderHeader}>
                  <View style={styles.avatar}>
                    <Bike size={24} color="#EF4444" />
                  </View>
                  <View style={styles.riderInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.riderName}>{rider.name}</Text>
                      {rider.isVerified && (
                        <ShieldCheck size={16} color="#10B981" style={{ marginLeft: 4 }} />
                      )}
                    </View>
                    <Text style={styles.riderVehicle}>{vehicle}</Text>
                    <View style={styles.statsRow}>
                      <Star size={12} color="#D4AF37" fill="#D4AF37" />
                      <Text style={styles.ratingText}>{parseFloat(rider.rating || '5').toFixed(1)}</Text>
                      <Text style={styles.tripsText}>• {rider.ratingsCount || '10'} trips completed</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.removeIconBtn}
                    onPress={() => removeFavorite(rider.id, rider.name)}
                  >
                    <HeartOff size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.bookButton} 
                    activeOpacity={0.8}
                    onPress={() => handleDirectBooking(rider.id, rider.name)}
                  >
                    <Text style={styles.bookButtonText}>Book Directly</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.callButton} 
                    activeOpacity={0.8}
                    onPress={() => handlePhoneCall(rider.phone)}
                  >
                    <Phone size={18} color="#0047AB" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

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
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '800',
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
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
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
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
  removeIconBtn: {
    padding: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.1)',
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
