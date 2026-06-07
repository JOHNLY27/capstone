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
import { ArrowLeft, ShoppingBag, Plus, Minus, MapPin, Coffee, Clipboard, DollarSign, Wallet, Navigation } from 'lucide-react-native';
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

export default function PabiliServiceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const targetRiderId = params.targetRiderId as string;
  const targetRiderName = params.targetRiderName as string;

  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState('food');
  const [items, setItems] = useState([{ name: '', qty: 1, notes: '' }]);
  const [storeLocation, setStoreLocation] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [pickupCoords, setPickupCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [estimatedBudget, setEstimatedBudget] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState<'WALLET' | 'COD'>('COD');
  const [isLoading, setIsLoading] = useState(false);

  const [activePicker, setActivePicker] = useState<'pickup' | 'dropoff' | null>(null);

  const handleConfirmLocation = async (address: string, coords: { latitude: number; longitude: number }) => {
    if (activePicker === 'pickup') {
      setStoreLocation(address);
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
      setDeliveryLocation(address);
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
        setDropoffCoords(coords);
        const address = await reverseGeocode(coords.latitude, coords.longitude);
        setDeliveryLocation(address);
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
      if (!storeLocation.trim() || !deliveryLocation.trim()) {
        setCalculatedDistance(null);
        return;
      }
      setIsCalculating(true);
      try {
        const resolvedPickup = await geocodeAddress(storeLocation);
        const resolvedDropoff = await geocodeAddress(deliveryLocation);

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
  }, [storeLocation, deliveryLocation]);

  const categories = [
    { id: 'food', label: 'Food', icon: Coffee },
    { id: 'groceries', label: 'Groceries', icon: ShoppingBag },
    { id: 'other', label: 'Other', icon: Clipboard }
  ];

  const addItemRow = () => {
    setItems([...items, { name: '', qty: 1, notes: '' }]);
  };

  const removeItemRow = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItemRow = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleDispatch = async () => {
    // Basic validation
    const validItems = items.filter(item => item.name.trim() !== '');
    if (validItems.length === 0) {
      Alert.alert('Validation Error', 'Please enter at least one item to purchase.');
      return;
    }
    if (!storeLocation || !deliveryLocation) {
      Alert.alert('Validation Error', 'Please fill in both the store and delivery destinations.');
      return;
    }

    setIsLoading(true);
    try {
      const token = authStore.getToken();
      
      const payload = {
        type: 'PABILI',
        pickupAddress: storeLocation.trim(),
        dropoffAddress: deliveryLocation.trim(),
        pickupCoords: pickupCoords || { latitude: 8.9475, longitude: 125.5406 },
        dropoffCoords: dropoffCoords || { latitude: 8.9565, longitude: 125.5230 },
        estimatedDistance: calculatedDistance !== null ? calculatedDistance : 4.1,
        price: estimatedBudget ? parseFloat(estimatedBudget) : 0.00,
        details: {
          itemsList: validItems,
          category,
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
        throw new Error(resData.error || 'Failed to dispatch shopping order.');
      }

      Alert.alert(
        'Shopping Dispatched', 
        `Your Pabili shopping mission was created successfully via ${paymentMethod === 'WALLET' ? 'Wallet' : 'Cash on Delivery'}!`,
        [
          { text: 'Track Order', onPress: () => router.push('/customer/orders') }
        ]
      );
    } catch (err: any) {
      console.error('Pabili dispatch error:', err);
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
      
      {/* Premium Header */}
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
            <Text style={styles.headerTitle}>Pabili Service</Text>
            <Text style={styles.headerSubtitle}>Direct Shopping Assistance</Text>
          </View>
        </View>
      </View>

      {/* Form scroll block */}
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

          {/* Categories Selector */}
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.categoryRow}>
            {categories.map((cat) => {
              const IconComponent = cat.icon;
              const isSelected = category === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryCard, isSelected && styles.activeCategoryCard]}
                  activeOpacity={0.8}
                  onPress={() => setCategory(cat.id)}
                >
                  <IconComponent size={24} color={isSelected ? "#D4AF37" : "#9CA3AF"} />
                  <Text style={[styles.categoryText, isSelected && styles.activeCategoryText]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Items To Buy Section */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Items to Buy</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={addItemRow}
            >
              <Plus size={16} color="#0047AB" />
              <Text style={styles.addButtonText}>Add Item</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.itemsList}>
            {items.map((item, idx) => (
              <View key={idx} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemCountLabel}>Item {idx + 1}</Text>
                  {items.length > 1 && (
                    <TouchableOpacity onPress={() => removeItemRow(idx)}>
                      <Minus size={16} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>

                <TextInput
                  style={styles.textInput}
                  placeholder="Item name (e.g., Chickenjoy with Rice)"
                  placeholderTextColor="#9CA3AF"
                  value={item.name}
                  onChangeText={(val) => updateItemRow(idx, 'name', val)}
                />

                <View style={styles.itemRowBottom}>
                  <View style={styles.qtyContainer}>
                    <TouchableOpacity 
                      style={styles.qtyButton}
                      onPress={() => updateItemRow(idx, 'qty', Math.max(1, item.qty - 1))}
                    >
                      <Minus size={14} color="#1F2937" />
                    </TouchableOpacity>
                    <Text style={styles.qtyValue}>{item.qty}</Text>
                    <TouchableOpacity 
                      style={styles.qtyButton}
                      onPress={() => updateItemRow(idx, 'qty', item.qty + 1)}
                    >
                      <Plus size={14} color="#1F2937" />
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    style={[styles.textInput, styles.notesInput]}
                    placeholder="Notes (optional)"
                    placeholderTextColor="#9CA3AF"
                    value={item.notes}
                    onChangeText={(val) => updateItemRow(idx, 'notes', val)}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Budget Input */}
          <Text style={styles.sectionTitle}>Shopping Budget</Text>
          <View style={styles.formCard}>
            <View style={styles.inputField}>
              <DollarSign size={18} color="#0047AB" style={styles.fieldIcon} />
              <TextInput
                style={styles.fieldInput}
                placeholder="Estimated item cost (₱) (e.g. 350)"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={estimatedBudget}
                onChangeText={setEstimatedBudget}
              />
            </View>
          </View>

          {/* Locations Input */}
          <Text style={styles.sectionTitle}>Store & Destination</Text>
          <View style={styles.locationContainer}>
            <View style={styles.locationField}>
              <MapPin size={18} color="#0047AB" style={styles.fieldIcon} />
              <TextInput
                style={styles.fieldInput}
                placeholder="Store Location (e.g., Jollibee Gaisano Mall)"
                placeholderTextColor="#9CA3AF"
                value={storeLocation}
                onChangeText={setStoreLocation}
              />
              <TouchableOpacity 
                style={[styles.locationActionBtn, { marginRight: 8 }]} 
                onPress={() => setActivePicker('pickup')}
              >
                <MapPin size={18} color="#0047AB" />
              </TouchableOpacity>
            </View>

            <View style={styles.locationField}>
              <MapPin size={18} color="#D4AF37" style={styles.fieldIcon} />
              <TextInput
                style={styles.fieldInput}
                placeholder="Delivery Destination (Your Butuan Address)"
                placeholderTextColor="#9CA3AF"
                value={deliveryLocation}
                onChangeText={setDeliveryLocation}
              />
              <TouchableOpacity 
                style={[styles.locationActionBtn, { marginRight: 8 }]} 
                onPress={() => setActivePicker('dropoff')}
              >
                <MapPin size={18} color="#D4AF37" />
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
                      ₱{settingsStore.getDeliveryFee(calculatedDistance || 0, 'PABILI').toFixed(2)}
                    </Text>
                  </View>
                  <Text style={styles.previewNote}>
                    *Based on dynamic admin-set rates for PABILI (including 1.2x route factor).
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
              <Text style={styles.paymentSubtext}>Prepare exact cash amount upon shopping arrival.</Text>
            </View>
          </View>

          {/* Dispatch Button */}
          <TouchableOpacity 
            style={styles.dispatchButton}
            activeOpacity={0.9}
            onPress={handleDispatch}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.dispatchText}>DISPATCH ORDER</Text>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>

      <LocationPickerModal
        visible={activePicker !== null}
        onClose={() => setActivePicker(null)}
        onConfirm={handleConfirmLocation}
        title={activePicker === 'pickup' ? 'Pin Store Location' : 'Pin Delivery Destination'}
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
  categoryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
  },
  activeCategoryCard: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeCategoryText: {
    color: '#D4AF37',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 13,
    color: '#0047AB',
    fontWeight: '600',
  },
  itemsList: {
    gap: 14,
    marginBottom: 24,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemCountLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 10,
  },
  itemRowBottom: {
    flexDirection: 'row',
    gap: 10,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 2,
  },
  qtyButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    paddingHorizontal: 10,
  },
  notesInput: {
    flex: 1,
    marginBottom: 0,
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
