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
import { ArrowLeft, Send, MapPin, DollarSign, Wallet } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authStore } from '../../utils/auth-store';
import { API_URL } from '../../constants/api';

export default function PasugoServiceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const targetRiderId = params.targetRiderId as string;
  const targetRiderName = params.targetRiderName as string;

  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState('');
  const [taskDetails, setTaskDetails] = useState('');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState<'WALLET' | 'COD'>('WALLET');
  const [isLoading, setIsLoading] = useState(false);

  const handleDispatch = async () => {
    if (!taskDetails || !pickup || !dropoff) {
      Alert.alert('Validation Error', 'Please fill in task details, pickup point, and dropoff destination.');
      return;
    }

    setIsLoading(true);
    try {
      const token = authStore.getToken();
      
      const payload = {
        type: 'PASUGO',
        pickupAddress: pickup.trim(),
        dropoffAddress: dropoff.trim(),
        // Butuan City coords
        pickupCoords: { latitude: 8.9475, longitude: 125.5406 },
        dropoffCoords: { latitude: 8.9515, longitude: 125.5280 },
        estimatedDistance: 2.8, // simulated 2.8km distance
        price: amount ? parseFloat(amount) : 0.00,
        details: {
          taskDetails: taskDetails.trim(),
          cashErrandAmount: amount.trim(),
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
        throw new Error(resData.error || 'Failed to dispatch errand.');
      }

      Alert.alert(
        'Errand Dispatched', 
        `Your special mission has been logged successfully via ${paymentMethod === 'WALLET' ? 'Wallet' : 'Cash on Delivery'}! A rider will accept it shortly.`,
        [
          { text: 'Track Order', onPress: () => router.push('/customer/orders') }
        ]
      );
    } catch (err: any) {
      console.error('Pasugo dispatch error:', err);
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
            <Text style={styles.headerTitle}>Pasugo Service</Text>
            <Text style={styles.headerSubtitle}>Cash Errands & Special Missions</Text>
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

          {/* Mission Details */}
          <Text style={styles.sectionTitle}>Errand / Cash Details</Text>
          <View style={styles.formCard}>
            <View style={styles.inputField}>
              <DollarSign size={18} color="#0047AB" style={styles.fieldIcon} />
              <TextInput
                style={styles.fieldInput}
                placeholder="Amount to Cash-In / Pay (e.g. 1000)"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            <TextInput
              style={[styles.textInput, styles.areaInput]}
              placeholder="Describe your errand task details here..."
              placeholderTextColor="#9CA3AF"
              multiline={true}
              numberOfLines={3}
              value={taskDetails}
              onChangeText={setTaskDetails}
            />
          </View>

          {/* Locations */}
          <Text style={styles.sectionTitle}>Task Locations</Text>
          <View style={styles.locationContainer}>
            <View style={styles.locationField}>
              <MapPin size={18} color="#0047AB" style={styles.fieldIcon} />
              <TextInput
                style={styles.fieldInput}
                placeholder="Pickup / Transaction point"
                placeholderTextColor="#9CA3AF"
                value={pickup}
                onChangeText={setPickup}
              />
            </View>

            <View style={styles.locationField}>
              <MapPin size={18} color="#D4AF37" style={styles.fieldIcon} />
              <TextInput
                style={styles.fieldInput}
                placeholder="Delivery Destination Point"
                placeholderTextColor="#9CA3AF"
                value={dropoff}
                onChangeText={setDropoff}
              />
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
              <Text style={styles.dispatchText}>DISPATCH ERRAND</Text>
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
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    gap: 12,
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
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1F2937',
  },
  areaInput: {
    height: 90,
    textAlignVertical: 'top',
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
