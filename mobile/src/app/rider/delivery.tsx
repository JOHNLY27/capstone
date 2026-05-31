import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Platform,
  Dimensions,
  ActivityIndicator,
  Alert,
  Linking
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Phone, MessageSquare, MapPin, Navigation, CheckCircle, Package, Info, AlertTriangle } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authStore } from '../../utils/auth-store';
import { API_URL } from '../../constants/api';

const { width } = Dimensions.get('window');

export default function RiderActiveDeliveryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = params.id;
  const insets = useSafeAreaInsets();
  
  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState<'assigned' | 'picked_up' | 'completed'>('assigned');
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchActiveOrderDetails = async () => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }

    try {
      const token = authStore.getToken();
      const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await response.json();

      if (response.ok && resData.success) {
        const ord = resData.data.order;
        setOrder(ord);
        
        // Map server order status to visual stepper status
        if (ord.status === 'ACCEPTED') {
          setStatus('assigned');
        } else if (ord.status === 'IN_TRANSIT') {
          setStatus('picked_up');
        } else if (ord.status === 'COMPLETED') {
          setStatus('completed');
        }
      } else {
        Alert.alert('Error', resData.error || 'Failed to fetch active order details.');
      }
    } catch (err) {
      console.error('Active order details fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveOrderDetails();
  }, [orderId]);

  const handleUpdateStatus = async (nextServerStatus: 'IN_TRANSIT' | 'COMPLETED') => {
    setIsActionLoading(true);
    try {
      const token = authStore.getToken();
      const response = await fetch(`${API_URL}/api/orders/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId,
          status: nextServerStatus
        })
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Failed to update order status.');
      }

      if (nextServerStatus === 'IN_TRANSIT') {
        setStatus('picked_up');
        Alert.alert('Status Updated', 'Items picked up successfully. Starting transit to customer!');
      } else if (nextServerStatus === 'COMPLETED') {
        setStatus('completed');
        
        const details: any = order?.details || {};
        const isCOD = details.paymentMethod === 'COD';
        
        Alert.alert(
          'Mission Completed!', 
          isCOD 
            ? 'Cash on Delivery physically collected from customer. Wallet ledger logs have been generated.'
            : 'Delivery successfully settled! Balance has been credited to your digital wallet.',
          [
            { text: 'Back to Dashboard', onPress: () => router.push('/rider/') }
          ]
        );
      }
      fetchActiveOrderDetails();
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Server connection error.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenNavigation = () => {
    if (!order) return;
    
    // Route to pickup point if assigned, route to customer dropoff if picked up
    const headingToPickup = status === 'assigned';
    
    let lat = headingToPickup ? 8.9475 : 8.9555; // Default Butuan City coordinates
    let lng = headingToPickup ? 125.5406 : 125.5310;
    let label = headingToPickup ? order.pickupAddress : order.dropoffAddress;
    
    try {
      const coords = headingToPickup ? order.pickupCoords : order.dropoffCoords;
      if (coords && typeof coords === 'object') {
        lat = coords.latitude || lat;
        lng = coords.longitude || lng;
      } else if (coords && typeof coords === 'string') {
        const parsed = JSON.parse(coords);
        lat = parsed.latitude || lat;
        lng = parsed.longitude || lng;
      }
    } catch (e) {
      console.warn('Coordinates parsing error:', e);
    }
    
    const url = Platform.OS === 'ios'
      ? `http://maps.apple.com/?q=${lat},${lng}`
      : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url).catch(() => {
        // Fallback to text address query search on web browser if native maps fails
        const query = encodeURIComponent(label);
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
        Linking.openURL(webUrl).catch(() => {
          Alert.alert('Notice', 'Unable to launch Google Maps on this device.');
        });
      });
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerAlign]}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.loadingText}>Syncing Order Details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, styles.centerAlign, { padding: 24 }]}>
        <Package size={48} color="#9CA3AF" />
        <Text style={styles.errorTitle}>Active Order Not Found</Text>
        <Text style={styles.errorDesc}>This operation may have been finished or reassigned.</Text>
        <TouchableOpacity style={styles.errorButton} onPress={() => router.push('/rider/')}>
          <Text style={styles.errorButtonText}>Go to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const deliveryFee = parseFloat(order.deliveryFee || '0');
  const price = parseFloat(order.price || '0');
  const totalCharge = deliveryFee + price;
  
  const details: any = order.details || {};
  const isCOD = details.paymentMethod === 'COD';

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Top Banner Header */}
      <View style={[styles.header, { paddingTop: insets.top || 20 }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={() => router.push('/rider/' as any)}
            >
              <ChevronLeft size={20} color="#D4AF37" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Active Delivery</Text>
              <Text style={styles.headerSubtitle}>Order #{order.id.slice(0, 8).toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.orderSummaryCard}>
            <View style={styles.summaryLeft}>
              <Package size={20} color="#D4AF37" />
              <Text style={styles.summaryText}>
                {order.type === 'PAHATOD' && details?.rideService === true ? 'FMU RIDE' : order.type} Errand
              </Text>
            </View>
            <View style={[styles.paymentBadge, isCOD && { backgroundColor: '#EF4444' }]}>
              <Text style={[styles.paymentText, isCOD && { color: '#FFFFFF' }]}>
                ₱{totalCharge.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Mock Map Navigation Section */}
      <View style={styles.mapContainer}>
        {/* Premium Graphic Representation of a Map */}
        <View style={styles.mockMapBackground}>
          <View style={styles.gridLineHorizontal1} />
          <View style={styles.gridLineHorizontal2} />
          <View style={styles.gridLineVertical1} />
          <View style={styles.gridLineVertical2} />
          
          {/* Path Line */}
          <View style={styles.mapRoutePath} />
          
          {/* Pickup Marker */}
          <View style={[styles.mapMarker, styles.pickupMarker]}>
            <View style={styles.markerPulse} />
            <MapPin size={18} color="#0047AB" />
            <View style={styles.markerLabelWrapper}>
              <Text style={styles.markerLabel} numberOfLines={1}>
                {order.pickupAddress.split(',')[0]}
              </Text>
            </View>
          </View>

          {/* Delivery Marker */}
          <View style={[styles.mapMarker, styles.deliveryMarker]}>
            <View style={styles.markerPulseGold} />
            <MapPin size={18} color="#D4AF37" />
            <View style={styles.markerLabelWrapper}>
              <Text style={styles.markerLabel} numberOfLines={1}>
                {order.dropoffAddress.split(',')[0]}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Status indicator on Map */}
        <View style={styles.mapStatusBadge}>
          <Text style={styles.mapStatusText}>
            {status === 'assigned' 
              ? `ROUTE TO STORE / PICKUP POINT (${order.estimatedDistance.toFixed(1)} km)` 
              : `ROUTE TO CUSTOMER DESTINATION (${(order.estimatedDistance * 0.8).toFixed(1)} km)`}
          </Text>
        </View>
      </View>

      {/* Details Scroll Section */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.body}>
          
          {/* Cash collection warning for COD */}
          {isCOD && (
            <View style={styles.codWarningCard}>
              <AlertTriangle size={20} color="#EF4444" style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.codWarningTitle}>CASH ON DELIVERY OPERATION</Text>
                <Text style={styles.codWarningDesc}>
                  You must collect a physical cash payment of ₱{totalCharge.toFixed(2)} from the customer upon completion.
                </Text>
              </View>
            </View>
          )}

          {/* Customer Profile Actions */}
          <View style={styles.customerCard}>
            <View style={styles.customerLeft}>
              <Text style={styles.blockSublabel}>CUSTOMER</Text>
              <Text style={styles.customerName}>{order.customer?.name || 'FetchMeUp Client'}</Text>
              <Text style={styles.customerPhone}>{order.customer?.phone || 'No phone provided'}</Text>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionIconButton}
                activeOpacity={0.7}
                onPress={() => router.push(`/chat/${order.id}` as any)}
              >
                <MessageSquare size={18} color="#D4AF37" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionIconButton}
                activeOpacity={0.7}
                onPress={() => {
                  if (order.customer?.phone) {
                    Linking.openURL(`tel:${order.customer.phone}`);
                  } else {
                    Alert.alert('Notice', 'No phone number available for this customer.');
                  }
                }}
              >
                <Phone size={18} color="#D4AF37" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Delivery Address Block */}
          <View style={styles.infoBlock}>
            <View style={styles.blockHeader}>
              <MapPin size={16} color="#4B5563" />
              <Text style={styles.blockTitle}>Task Route</Text>
            </View>
            <View style={{ gap: 8, marginTop: 4 }}>
              <View>
                <Text style={styles.routePointLabel}>PICKUP POINT:</Text>
                <Text style={styles.routePointValue}>{order.pickupAddress}</Text>
              </View>
              <View style={styles.routeDivider} />
              <View>
                <Text style={styles.routePointLabel}>DROP-OFF DESTINATION:</Text>
                <Text style={styles.routePointValue}>{order.dropoffAddress}</Text>
              </View>
            </View>
          </View>

          {/* Order Details list */}
          <View style={styles.orderDetailsBlock}>
            <Text style={styles.orderDetailTitle}>Errand Logistics & Items</Text>
            
            {order.type === 'PABILI' && details.itemsList && (
              <View style={{ gap: 6 }}>
                {details.itemsList.map((item: any, i: number) => (
                  <View key={i} style={styles.itemRow}>
                    <Text style={styles.itemDot}>•</Text>
                    <Text style={styles.itemText}>{item.qty}x {item.name} {item.notes && `(${item.notes})`}</Text>
                  </View>
                ))}
              </View>
            )}

            {order.type === 'PASUGO' && (
              <View style={{ gap: 6 }}>
                <Text style={styles.itemText}>Task: {details.taskDetails || 'Errand operation'}</Text>
                <Text style={styles.itemText}>Simulated Cash Budget: ₱{price.toFixed(2)}</Text>
              </View>
            )}

            {order.type === 'PAHATOD' && (
              <View style={{ gap: 6 }}>
                <Text style={styles.itemText}>Courier Item: {details.itemDescription || 'Courier envelope'}</Text>
              </View>
            )}

            {order.type === 'PAKUHA' && (
              <View style={{ gap: 6 }}>
                <Text style={styles.itemText}>Pickup Package: {details.packageDetails || 'Pickup envelope'}</Text>
              </View>
            )}

            <View style={styles.costBreakdown}>
              <Text style={styles.costText}>Delivery Fee: ₱{deliveryFee.toFixed(2)}</Text>
              {price > 0 && <Text style={styles.costText}>Purchase Cost: ₱{price.toFixed(2)}</Text>}
              <Text style={styles.costTotal}>Total Settlement: ₱{totalCharge.toFixed(2)}</Text>
            </View>
          </View>

          {/* Process Navigation & Complete Buttons */}
          <View style={styles.actionSection}>
            {isActionLoading ? (
              <ActivityIndicator color="#0047AB" size="large" />
            ) : status === 'assigned' ? (
              <TouchableOpacity 
                style={styles.primaryButton}
                activeOpacity={0.8}
                onPress={() => handleUpdateStatus('IN_TRANSIT')}
              >
                <CheckCircle size={18} color="#D4AF37" />
                <Text style={styles.primaryButtonText}>MARK AS PICKED UP</Text>
              </TouchableOpacity>
            ) : status === 'picked_up' ? (
              <TouchableOpacity 
                style={styles.completedButton}
                activeOpacity={0.8}
                onPress={() => handleUpdateStatus('COMPLETED')}
              >
                <CheckCircle size={18} color="#FFFFFF" />
                <Text style={styles.completedButtonText}>COMPLETE MISSION</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.completedBanner}>
                <CheckCircle size={22} color="#10B981" />
                <Text style={styles.completedBannerText}>MISSION FULLY DELIVERED & SETTLED</Text>
              </View>
            )}

            <TouchableOpacity 
              style={styles.navigationButton}
              activeOpacity={0.8}
              onPress={handleOpenNavigation}
            >
              <Navigation size={18} color="#FFFFFF" />
              <Text style={styles.navigationButtonText}>OPEN GOOGLE MAPS NAVIGATION</Text>
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
  centerAlign: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1,
  },
  header: {
    backgroundColor: '#050A18',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 24,
    shadowColor: '#050A18',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  headerContent: {
    width: '100%',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#D4AF37',
    fontWeight: '700',
    marginTop: 2,
  },
  orderSummaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  paymentBadge: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 50,
  },
  paymentText: {
    color: '#050A18',
    fontSize: 13,
    fontWeight: '900',
  },
  mapContainer: {
    height: 200,
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  mockMapBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E8ECEF',
    position: 'relative',
    overflow: 'hidden',
  },
  gridLineHorizontal1: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 60,
    height: 2,
    backgroundColor: '#D1D5DB',
  },
  gridLineHorizontal2: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 130,
    height: 2,
    backgroundColor: '#D1D5DB',
  },
  gridLineVertical1: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: width * 0.33,
    width: 2,
    backgroundColor: '#D1D5DB',
  },
  gridLineVertical2: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: width * 0.66,
    width: 2,
    backgroundColor: '#D1D5DB',
  },
  mapRoutePath: {
    position: 'absolute',
    top: 90,
    left: width * 0.25,
    width: width * 0.45,
    height: 4,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
    transform: [{ rotate: '15deg' }],
  },
  mapMarker: {
    position: 'absolute',
    alignItems: 'center',
  },
  pickupMarker: {
    top: 50,
    left: width * 0.2,
  },
  deliveryMarker: {
    top: 100,
    left: width * 0.65,
  },
  markerPulse: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 71, 171, 0.25)',
    top: -5,
  },
  markerPulseGold: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
    top: -5,
  },
  markerLabelWrapper: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  markerLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  mapStatusBadge: {
    position: 'absolute',
    bottom: 12,
    left: 20,
    right: 20,
    backgroundColor: '#050A18',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  mapStatusText: {
    color: '#D4AF37',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  body: {
    padding: 24,
    gap: 20,
  },
  codWarningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 16,
    padding: 16,
  },
  codWarningTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#EF4444',
    letterSpacing: 1,
    marginBottom: 4,
  },
  codWarningDesc: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
    lineHeight: 16,
  },
  customerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  customerLeft: {
    flex: 1,
  },
  blockSublabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  customerPhone: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBlock: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  blockTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  routePointLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  routePointValue: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '500',
    marginTop: 2,
  },
  routeDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    lineHeight: 20,
  },
  orderDetailsBlock: {
    backgroundColor: 'rgba(0, 71, 171, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 71, 171, 0.1)',
    borderRadius: 20,
    padding: 18,
  },
  orderDetailTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0047AB',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  itemDot: {
    fontSize: 14,
    color: '#0047AB',
    fontWeight: 'bold',
  },
  itemText: {
    fontSize: 13,
    color: '#0047AB',
    fontWeight: '500',
  },
  costBreakdown: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 71, 171, 0.15)',
    marginTop: 12,
    paddingTop: 10,
    gap: 4,
  },
  costText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  costTotal: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0047AB',
    marginTop: 4,
  },
  actionSection: {
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#050A18',
    borderColor: 'rgba(212, 175, 55, 0.5)',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#D4AF37',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1.5,
  },
  completedButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  completedButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1.5,
  },
  navigationButton: {
    backgroundColor: '#0047AB',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#0047AB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  navigationButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1.5,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  completedBannerText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1F2937',
    marginTop: 12,
  },
  errorDesc: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  errorButton: {
    backgroundColor: '#050A18',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  errorButtonText: {
    color: '#D4AF37',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
