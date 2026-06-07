import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Package, MapPin, DollarSign, Wallet, Navigation } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authStore } from '../../utils/auth-store';
import { API_URL } from '../../constants/api';
import { 
  getCurrentLocation, 
  reverseGeocode, 
  geocodeAddress, 
  calculateDistance,
  getRoadRouteDistance
} from '../../utils/location';
import { settingsStore } from '../../utils/settings-store';
import LocationPickerModal from '../../components/LocationPickerModal';

export default function PakuhaServiceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const targetRiderId = params.targetRiderId as string;
  const targetRiderName = params.targetRiderName as string;

  const insets = useSafeAreaInsets();
  const [item, setItem] = useState('');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupCoords, setPickupCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState<'WALLET' | 'COD'>('COD');
  const [isLoading, setIsLoading] = useState(false);

  const [activePicker, setActivePicker] = useState<'pickup' | 'dropoff' | null>(null);

  const handleConfirmLocation = async (address: string, coords: { latitude: number; longitude: number }) => {
    if (activePicker === 'pickup') {
      setPickup(address);
      setPickupCoords(coords);
      if (dropoffCoords) {
        setIsCalculating(true);
        try {
          const dist = await getRoadRouteDistance(coords.latitude, coords.longitude, dropoffCoords.latitude, dropoffCoords.longitude);
          setCalculatedDistance(dist);
        } catch (e) {
          console.error(e);
        } finally {
          setIsCalculating(false);
        }
      }
    } else {
      setDropoff(address);
      setDropoffCoords(coords);
      if (pickupCoords) {
        setIsCalculating(true);
        try {
          const dist = await getRoadRouteDistance(pickupCoords.latitude, pickupCoords.longitude, coords.latitude, coords.longitude);
          setCalculatedDistance(dist);
        } catch (e) {
          console.error(e);
        } finally {
          setIsCalculating(false);
        }
      }
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const location = await getCurrentLocation();
      if (location) {
        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setPickupCoords(coords);
        const address = await reverseGeocode(coords.latitude, coords.longitude);
        setPickup(address);
      } else {
        Alert.alert('Permission Error', 'Unable to get your current position. Please enable location permissions.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred while fetching your location.');
    } finally {
      setIsLocating(false);
    }
  };

  // Debounced geocoding and distance calculation
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!pickup.trim() || !dropoff.trim()) {
        setCalculatedDistance(null);
        return;
      }
      setIsCalculating(true);
      try {
        const resolvedPickup = await geocodeAddress(pickup);
        const resolvedDropoff = await geocodeAddress(dropoff);

        const defaultPickup = { latitude: 8.9475, longitude: 125.5406 };
        const defaultDropoff = { latitude: 8.9555, longitude: 125.5310 };

        const finalPickup = resolvedPickup || defaultPickup;
        const finalDropoff = resolvedDropoff || defaultDropoff;

        setPickupCoords(finalPickup);
        setDropoffCoords(finalDropoff);

        const dist = await getRoadRouteDistance(
          finalPickup.latitude,
          finalPickup.longitude,
          finalDropoff.latitude,
          finalDropoff.longitude
        );
        setCalculatedDistance(dist);
      } catch (err) {
        console.error('Distance calculation error:', err);
        setCalculatedDistance(null);
      } finally {
        setIsCalculating(false);
      }
    }, 1500);

    return () => clearTimeout(delayDebounce);
  }, [pickup, dropoff]);

  const handleDispatch = async () => {
    if (!item || !pickup || !dropoff) {
      Alert.alert('Validation Error', 'Please enter item details, pickup point, and drop-off destination.');
      return;
    }

    setIsLoading(true);
    try {
      const token = authStore.getToken();
      
      const payload = {
        type: 'PAKUHA',
        pickupAddress: pickup.trim(),
        dropoffAddress: dropoff.trim(),
        pickupCoords: pickupCoords || { latitude: 8.9475, longitude: 125.5406 },
        dropoffCoords: dropoffCoords || { latitude: 8.9415, longitude: 125.5390 },
        estimatedDistance: calculatedDistance !== null ? calculatedDistance : 2.1,
        price: 0.00,
        details: {
          packageDetails: item.trim(),
          paymentMethod,
          ...(targetRiderId ? { targetedRiderId: targetRiderId, targetedRiderName: decodeURIComponent(targetRiderName) } : {})
        }
      };

      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Failed to dispatch pickup.');
      }

      Alert.alert(
        'Pickup Dispatched', 
        `Your Pakuha request has been successfully created via ${paymentMethod === 'WALLET' ? 'Wallet' : 'Cash on Delivery'}!`,
        [
          { text: 'Track Order', onPress: () => router.push('/customer/orders') }
        ]
      );
    } catch (err: any) {
      console.error('Pakuha dispatch error:', err);
      Alert.alert('Dispatch Failed', err.message || 'Unable to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      
      <View style={[styles.header, { paddingTop: insets.top || 20 }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#D4AF37" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Pakuha Service</Text>
            <Text style={styles.headerSubtitle}>Instant Package Pickup</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.body}>
          
          {/* Direct booking banner */}
          {targetRiderId && (
            <View style={styles.directBookingBanner}>
              <Text style={styles.directBookingTitle}>🎯 DIRECT BOOKING REQUEST</Text>
              <Text style={styles.directBookingDesc}>
                This errand is locked directly to your favorite pilot: <Text style={{ fontWeight: 'bold' }}>{decodeURIComponent(targetRiderName)}</Text>. Only they will be able to accept it!
              </Text>
            </View>
          )}

          {/* Package details */}
          <Text style={styles.sectionTitle}>Package Details</Text>
          <View style={styles.formCard}>
            <View style={styles.inputField}>
              <Package size={18} color="#0047AB" style={styles.fieldIcon} />
              <TextInput
                style={styles.fieldInput}
                placeholder="What item should we pickup? (e.g. Documents)"
                placeholderTextColor="#9CA3AF"
                value={item}
                onChangeText={setItem}
              />
            </View>
          </View>

          {/* Locations */}
          <Text style={styles.sectionTitle}>Pickup & Drop-off Points</Text>
          <View style={styles.locationContainer}>
            <View style={styles.locationField}>
              <MapPin size={18} color="#0047AB" style={styles.fieldIcon} />
              <TextInput
                style={styles.fieldInput}
                placeholder="Pickup Point Address"
                placeholderTextColor="#9CA3AF"
                value={pickup}
                onChangeText={setPickup}
              />
              <TouchableOpacity 
                style={[styles.locationActionBtn, { marginRight: 8 }]} 
                onPress={() => setActivePicker('pickup')}
              >
                <MapPin size={18} color="#0047AB" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.locationActionBtn} 
                onPress={handleUseCurrentLocation}
                disabled={isLocating}
              >
                {isLocating ? (
                  <ActivityIndicator size="small" color="#0047AB" />
                ) : (
                  <Navigation size={16} color="#0047AB" style={{ transform: [{ rotate: '45deg' }] }} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.locationField}>
              <MapPin size={18} color="#D4AF37" style={styles.fieldIcon} />
              <TextInput
                style={styles.fieldInput}
                placeholder="Your Drop-off / Delivery Address"
                placeholderTextColor="#9CA3AF"
                value={dropoff}
                onChangeText={setDropoff}
              />
              <TouchableOpacity 
                style={[styles.locationActionBtn, { marginRight: 8 }]} 
                onPress={() => setActivePicker('dropoff')}
              >
                <MapPin size={18} color="#D4AF37" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Real-time Fare Preview Card */}
          {(calculatedDistance !== null || isCalculating) && (
            <View style={styles.previewCard}>
              {isCalculating ? (
                <View style={styles.previewLoading}>
                  <ActivityIndicator size="small" color="#0047AB" style={{ marginRight: 8 }} />
                  <Text style={styles.previewLoadingText}>Estimating distance and fare...</Text>
                </View>
              ) : (
                <View style={styles.previewDetails}>
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Estimated Distance:</Text>
                    <Text style={styles.previewValue}>{calculatedDistance?.toFixed(2)} km</Text>
                  </View>
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Delivery Fee:</Text>
                    <Text style={styles.previewValueGold}>
                      ₱{settingsStore.getDeliveryFee(calculatedDistance || 0, 'PAKUHA').toFixed(2)}
                    </Text>
                  </View>
                  <Text style={styles.previewNote}>
                    *Based on dynamic admin-set rates for PAKUHA (including 1.2x route factor).
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Payment Method Selector */}
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentSelectorContainer}>
            <View style={[styles.paymentCard, styles.activePaymentCard, { flex: 1, paddingVertical: 14 }]}>
              <View style={styles.paymentHeader}>
                <DollarSign size={16} color="#D4AF37" />
                <Text style={[styles.paymentText, styles.activePaymentText, { fontWeight: '800' }]}>
                  Cash on Delivery (COD)
                </Text>
              </View>
              <Text style={styles.paymentSubtext}>Prepare exact cash amount upon package pickup arrival.</Text>
            </View>
          </View>

          {/* Dispatch */}
          <TouchableOpacity 
            style={styles.dispatchButton}
            activeOpacity={0.9}
            onPress={handleDispatch}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.dispatchText}>DISPATCH PICKUP</Text>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>

      <LocationPickerModal
        visible={activePicker !== null}
        onClose={() => setActivePicker(null)}
        onConfirm={handleConfirmLocation}
        title={activePicker === 'pickup' ? 'Pin Pickup Point' : 'Pin Drop-off Point'}
      />
    </KeyboardAvoidingView>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 24,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  fieldIcon: {
    marginRight: 10,
  },
  fieldInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '500',
  },
  locationContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  locationField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  paymentSelectorContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  paymentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  activePaymentCard: {
    borderColor: '#0047AB',
    backgroundColor: 'rgba(0, 71, 171, 0.02)',
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paymentText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  activePaymentText: {
    color: '#0047AB',
  },
  paymentSubtext: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
    marginTop: 2,
  },
  dispatchButton: {
    backgroundColor: '#0047AB',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#0047AB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  dispatchText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  directBookingBanner: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  directBookingTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 1,
    marginBottom: 4,
  },
  directBookingDesc: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  previewLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  previewLoadingText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  previewDetails: {
    gap: 8,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600',
  },
  previewValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '800',
  },
  previewValueGold: {
    fontSize: 16,
    color: '#D4AF37',
    fontWeight: '800',
  },
  previewNote: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
    fontStyle: 'italic',
    marginTop: 4,
  },
  locationActionBtn: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
