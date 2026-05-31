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
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, ShoppingBag, Plus, Minus, MapPin, Coffee, Clipboard, DollarSign, Wallet } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authStore } from '../../utils/auth-store';
import { API_URL } from '../../constants/api';

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
  const [estimatedBudget, setEstimatedBudget] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState<'WALLET' | 'COD'>('COD');
  const [isLoading, setIsLoading] = useState(false);

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
        pickupCoords: { latitude: 8.9475, longitude: 125.5406 }, // default Butuan City
        dropoffCoords: { latitude: 8.9565, longitude: 125.5230 },
        estimatedDistance: 4.1, // simulated 4.1km
        price: estimatedBudget ? parseFloat(estimatedBudget) : 0.00,
        details: {
          itemsList: validItems,
          category,
          paymentMethod,
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
            </View>
          </View>

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
});
