import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Bike, MapPin, Wallet, DollarSign, Car, Users, Plus, Minus, Shield } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authStore } from '../../utils/auth-store';
import { API_URL } from '../../constants/api';

export default function RideServiceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const targetRiderId = params.targetRiderId as string;
  const targetRiderName = params.targetRiderName as string;

  const insets = useSafeAreaInsets();
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [vehicleType, setVehicleType] = useState<'Motorcycle' | 'Bao-Bao' | '4-wheels'>('Motorcycle');
  const [passengers, setPassengers] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'WALLET' | 'COD'>('WALLET');
  const [isLoading, setIsLoading] = useState(false);

  const maxCapacity = {
    'Motorcycle': 1,
    'Bao-Bao': 3,
    '4-wheels': 4,
  };

  const handleSelectVehicle = (type: 'Motorcycle' | 'Bao-Bao' | '4-wheels') => {
    setVehicleType(type);
    // Cap passengers to the new limit
    const cap = maxCapacity[type];
    setPassengers(prev => Math.min(prev, cap));
  };

  const incrementPassengers = () => {
    const cap = maxCapacity[vehicleType];
    if (passengers < cap) {
      setPassengers(prev => prev + 1);
    } else {
      Alert.alert('Capacity Limit', `A ${vehicleType} cannot accommodate more than ${cap} passenger(s).`);
    }
  };

  const decrementPassengers = () => {
    if (passengers > 1) {
      setPassengers(prev => prev - 1);
    }
  };

  const handleDispatch = async () => {
    if (!pickup || !dropoff) {
      Alert.alert('Validation Error', 'Please specify both your pickup point and heading destination.');
      return;
    }

    setIsLoading(true);
    try {
      const token = authStore.getToken();
      
      const payload = {
        type: 'PAHATOD',
        pickupAddress: pickup.trim(),
        dropoffAddress: dropoff.trim(),
        pickupCoords: { latitude: 8.9475, longitude: 125.5406 }, // default Butuan City
        dropoffCoords: { latitude: 8.9555, longitude: 125.5310 },
        estimatedDistance: 3.5, // simulated 3.5km ride
        price: 0.00, // no item cost, just transport
        details: {
          itemDescription: `FMU Ride (${vehicleType}) • ${passengers} Pax`,
          paymentMethod,
          rideService: true,
          vehicleType,
          passengers,
          ...(targetRiderId ? { targetedRiderId, targetedRiderName: decodeURIComponent(targetRiderName) } : {})
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
        throw new Error(resData.error || 'Failed to dispatch FMU Ride.');
      }

      Alert.alert(
        'FMU Ride Dispatched', 
        `Your ${vehicleType} ride for ${passengers} passenger(s) has been successfully booked! Finding a verified pilot...`,
        [
          { text: 'Track Ride', onPress: () => router.push('/customer/orders') }
        ]
      );
    } catch (err: any) {
      console.error('FMU Ride dispatch error:', err);
      Alert.alert('Booking Failed', err.message || 'Unable to connect to server. Please try again.');
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
            <Text style={styles.headerTitle}>FMU Ride</Text>
            <Text style={styles.headerSubtitle}>Passenger Hatud Errand</Text>
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
                This transport ride is locked directly to your favorite pilot: <Text style={{ fontWeight: 'bold' }}>{decodeURIComponent(targetRiderName)}</Text>. Only they will be able to accept it!
              </Text>
            </View>
          )}

          {/* Banner Graphic */}
          <View style={styles.bannerCard}>
            <Bike size={32} color="#D4AF37" />
            <Text style={styles.bannerText}>Travel Safely in Butuan City</Text>
            <Text style={styles.bannerSubtext}>Get matched with nearby verified rider partners</Text>
          </View>

          {/* Locations */}
          <Text style={styles.sectionTitle}>Ride Coordinates</Text>
          <View style={styles.locationContainer}>
            <View style={styles.locationField}>
              <MapPin size={18} color="#0047AB" style={styles.fieldIcon} />
              <TextInput
                style={styles.fieldInput}
                placeholder="Where should we pick you up?"
                placeholderTextColor="#9CA3AF"
                value={pickup}
                onChangeText={setPickup}
              />
            </View>

            <View style={styles.locationField}>
              <MapPin size={18} color="#D4AF37" style={styles.fieldIcon} />
              <TextInput
                style={styles.fieldInput}
                placeholder="Where are you heading?"
                placeholderTextColor="#9CA3AF"
                value={dropoff}
                onChangeText={setDropoff}
              />
            </View>
          </View>

          {/* Vehicle Type Picker */}
          <Text style={styles.sectionTitle}>Select Vehicle Type</Text>
          <View style={styles.vehicleGrid}>
            <TouchableOpacity
              style={[styles.vehicleCard, vehicleType === 'Motorcycle' && styles.vehicleCardActive]}
              activeOpacity={0.8}
              onPress={() => handleSelectVehicle('Motorcycle')}
            >
              <Bike size={24} color={vehicleType === 'Motorcycle' ? '#0047AB' : '#9CA3AF'} />
              <Text style={[styles.vehicleLabel, vehicleType === 'Motorcycle' && styles.vehicleLabelActive]}>
                Motorcycle
              </Text>
              <Text style={styles.vehicleCap}>Max: 1 Pax</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.vehicleCard, vehicleType === 'Bao-Bao' && styles.vehicleCardActive]}
              activeOpacity={0.8}
              onPress={() => handleSelectVehicle('Bao-Bao')}
            >
              <Shield size={24} color={vehicleType === 'Bao-Bao' ? '#0047AB' : '#9CA3AF'} />
              <Text style={[styles.vehicleLabel, vehicleType === 'Bao-Bao' && styles.vehicleLabelActive]}>
                Bao-Bao
              </Text>
              <Text style={styles.vehicleCap}>Max: 3 Pax</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.vehicleCard, vehicleType === '4-wheels' && styles.vehicleCardActive]}
              activeOpacity={0.8}
              onPress={() => handleSelectVehicle('4-wheels')}
            >
              <Car size={24} color={vehicleType === '4-wheels' ? '#0047AB' : '#9CA3AF'} />
              <Text style={[styles.vehicleLabel, vehicleType === '4-wheels' && styles.vehicleLabelActive]}>
                4-Wheels
              </Text>
              <Text style={styles.vehicleCap}>Max: 4 Pax</Text>
            </TouchableOpacity>
          </View>

          {/* Passenger Counter */}
          <Text style={styles.sectionTitle}>Number of Passengers</Text>
          <View style={styles.counterCard}>
            <View style={styles.counterInfo}>
              <Users size={20} color="#050A18" />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.counterLabel}>Total Riders</Text>
                <Text style={styles.counterDesc}>Selected vehicle max: {maxCapacity[vehicleType]} pax</Text>
              </View>
            </View>
            
            <View style={styles.counterActions}>
              <TouchableOpacity 
                style={[styles.counterBtn, passengers <= 1 && styles.counterBtnDisabled]}
                onPress={decrementPassengers}
                disabled={passengers <= 1}
              >
                <Minus size={16} color={passengers <= 1 ? '#9CA3AF' : '#050A18'} />
              </TouchableOpacity>
              
              <Text style={styles.counterValue}>{passengers}</Text>
              
              <TouchableOpacity 
                style={[styles.counterBtn, passengers >= maxCapacity[vehicleType] && styles.counterBtnDisabled]}
                onPress={incrementPassengers}
                disabled={passengers >= maxCapacity[vehicleType]}
              >
                <Plus size={16} color={passengers >= maxCapacity[vehicleType] ? '#9CA3AF' : '#050A18'} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Payment Method Selector */}
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentSelectorContainer}>
            <TouchableOpacity
              style={[
                styles.paymentCard,
                paymentMethod === 'WALLET' && styles.activePaymentCard
              ]}
              activeOpacity={0.8}
              onPress={() => setPaymentMethod('WALLET')}
            >
              <View style={styles.paymentHeader}>
                <Wallet size={16} color={paymentMethod === 'WALLET' ? '#0047AB' : '#9CA3AF'} />
                <Text style={[styles.paymentText, paymentMethod === 'WALLET' && styles.activePaymentText]}>
                  Wallet
                </Text>
              </View>
              <Text style={styles.paymentSubtext}>
                Bal: ₱{parseFloat(authStore.getUser()?.walletBalance || '0').toFixed(2)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentCard,
                paymentMethod === 'COD' && styles.activePaymentCard
              ]}
              activeOpacity={0.8}
              onPress={() => setPaymentMethod('COD')}
            >
              <View style={styles.paymentHeader}>
                <DollarSign size={16} color={paymentMethod === 'COD' ? '#D4AF37' : '#9CA3AF'} />
                <Text style={[styles.paymentText, paymentMethod === 'COD' && styles.activePaymentText]}>
                  Cash (COD)
                </Text>
              </View>
              <Text style={styles.paymentSubtext}>Pay physically to rider</Text>
            </TouchableOpacity>
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
              <Text style={styles.dispatchText}>DISPATCH FMU RIDE</Text>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
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
  bannerCard: {
    backgroundColor: '#050A18',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  bannerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 4,
  },
  bannerSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  locationContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    gap: 12,
    marginBottom: 28,
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
  vehicleGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  vehicleCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  vehicleCardActive: {
    borderColor: '#0047AB',
    borderWidth: 1.5,
    backgroundColor: 'rgba(0, 71, 171, 0.02)',
  },
  vehicleLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  vehicleLabelActive: {
    color: '#0047AB',
    fontWeight: '800',
  },
  vehicleCap: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  counterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  counterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  counterDesc: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
    fontWeight: '600',
  },
  counterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  counterBtnDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#F3F4F6',
    opacity: 0.5,
  },
  counterValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#050A18',
    minWidth: 16,
    textAlign: 'center',
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
});
