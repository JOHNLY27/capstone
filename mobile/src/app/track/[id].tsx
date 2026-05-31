import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Linking,
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  Bike, Phone, MessageSquare, MapPin, ArrowLeft, 
  Clock, Package, Star, Shield, CircleDot, CheckCircle, Heart
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { authStore } from '../../utils/auth-store';
import { API_URL } from '../../constants/api';

const { width } = Dimensions.get('window');

const STATUS_STEPS = [
  { key: 'confirmed', label: 'Errand Placed', description: 'Your request has been registered' },
  { key: 'finding_rider', label: 'Finding Rider', description: 'Matching you with a nearby rider' },
  { key: 'rider_accepted', label: 'Rider Heading Out', description: 'Rider has accepted and is on the way' },
  { key: 'picked_up', label: 'In Progress', description: 'Rider is carrying out the operation' },
  { key: 'in_transit', label: 'In Transit', description: 'Rider is on the way to you' },
  { key: 'delivered', label: 'Delivered', description: 'Order successfully completed!' },
];

function getStepIndex(status: string): number {
  switch (status) {
    case 'PENDING': return 1; // Finding Rider
    case 'ACCEPTED': return 2; // Rider Accepted
    case 'IN_TRANSIT': return 4; // In Transit
    case 'COMPLETED': return 5; // Delivered
    case 'CANCELLED': return 5;
    default: return 1;
  }
}

export default function TrackOrderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [favoritesList, setFavoritesList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Rating states
  const [showRateModal, setShowRateModal] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const handleSubmitRating = async () => {
    if (!ratingInput || ratingInput < 1 || ratingInput > 5) return;
    setIsSubmittingRating(true);
    const token = authStore.getToken();
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/rate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: ratingInput,
          comment: reviewComment.trim(),
        }),
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        Alert.alert('Thank You!', 'Your rating has been submitted successfully.');
        setShowRateModal(false);
        setReviewComment('');
        fetchOrderDetails();
      } else {
        Alert.alert('Error', resData.error || 'Failed to submit rating.');
      }
    } catch (e) {
      console.error('Error submitting rating:', e);
      Alert.alert('Error', 'Unable to reach the server.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Pulse animation for active step
  const pulseAnim = useSharedValue(1);
  useEffect(() => {
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  // Rider dot floating movement animation
  const riderFloat = useSharedValue(0);
  useEffect(() => {
    riderFloat.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(6, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const riderDotStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: riderFloat.value }],
  }));

  const fetchFavorites = async () => {
    const token = authStore.getToken();
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/favorites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await response.json();
      if (response.ok && resData.success) {
        setFavoritesList(resData.favorites.map((fav: any) => fav.riderId));
      }
    } catch (e) {
      console.error('Error fetching favorites list:', e);
    }
  };

  const toggleFavoriteRider = async (riderId: string) => {
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
        if (resData.isFavorite) {
          setFavoritesList(prev => [...prev, riderId]);
          Alert.alert('Trusted Pilot Added', `${order?.rider?.name || 'Rider'} is now saved in your trusted pilot registry! You can directly request them for future dispatches.`);
        } else {
          setFavoritesList(prev => prev.filter(id => id !== riderId));
          Alert.alert('Favorite Removed', `${order?.rider?.name || 'Rider'} was removed from your favorite list.`);
        }
      } else {
        Alert.alert('Notice', resData.error || 'Failed to toggle favorite.');
      }
    } catch (err) {
      console.error('Toggle favorite error:', err);
      Alert.alert('Error', 'Unable to complete the action.');
    }
  };

  const fetchOrderDetails = async () => {
    if (!orderId) return;
    const token = authStore.getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await response.json();

      if (response.ok && resData.success) {
        setOrder(resData.data.order);
      }
    } catch (err) {
      console.error('Error fetching tracker details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
    fetchOrderDetails();
    // Poll every 5 seconds for real-time tracking updates
    const interval = setInterval(fetchOrderDetails, 5000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerAlign]}>
        <ActivityIndicator size="large" color="#0047AB" />
        <Text style={styles.loadingText}>Syncing tracker details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, styles.centerAlign, { padding: 24 }]}>
        <Package size={48} color="#9CA3AF" />
        <Text style={styles.errorTitle}>Order Not Found</Text>
        <Text style={styles.errorDesc}>This operation could not be located or has already finished.</Text>
        <TouchableOpacity style={styles.errorButton} onPress={() => router.push('/customer/orders')}>
          <Text style={styles.errorButtonText}>Go to Active Orders</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const details = order.details || {};
  const isRide = order.type === 'PAHATOD' && details.rideService === true;
  const serviceLabel = isRide ? 'FMU RIDE' : order.type;
  const currentStep = getStepIndex(order.status);
  
  // Format items
  let itemStrings: string[] = [];
  if (order.type === 'PABILI') {
    if (details.itemsList) {
      itemStrings = Array.isArray(details.itemsList) 
        ? details.itemsList.map((item: any) => typeof item === 'string' ? item : item.item)
        : String(details.itemsList).split(',').map(s => s.trim());
    } else {
      itemStrings = ['Shopping Errand List'];
    }
  } else if (order.type === 'PASUGO') {
    itemStrings = [details.taskDetails || 'Errand operation'];
  } else if (order.type === 'PAHATOD') {
    itemStrings = [details.itemDescription || 'Courier Package'];
  } else if (order.type === 'PAKUHA') {
    itemStrings = [details.packageDetails || 'Pickup Package'];
  }

  // Parse price details
  const deliveryFee = parseFloat(order.deliveryFee || '0');
  const price = parseFloat(order.price || '0');
  const totalAmount = deliveryFee + price;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => router.push('/customer/orders')}
          >
            <ArrowLeft size={20} color="#D4AF37" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Track Order</Text>
            <Text style={styles.headerSubtitle}>Order #{order.id.slice(0, 8).toUpperCase()} • {serviceLabel}</Text>
          </View>
          <View style={styles.etaBadge}>
            <Clock size={12} color="#D4AF37" />
            <Text style={styles.etaBadgeText}>
              {order.status === 'PENDING' ? 'Finding rider...' : 'Active'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Live Map Visualization */}
        <View style={styles.mapCard}>
          <View style={styles.mapInner}>
            {/* Grid lines for streets */}
            <View style={styles.mapGrid}>
              <View style={[styles.gridH, { top: '25%' }]} />
              <View style={[styles.gridH, { top: '50%' }]} />
              <View style={[styles.gridH, { top: '75%' }]} />
              <View style={[styles.gridV, { left: '20%' }]} />
              <View style={[styles.gridV, { left: '50%' }]} />
              <View style={[styles.gridV, { left: '80%' }]} />
            </View>

            {/* River visual */}
            <View style={styles.river} />

            {/* Store Pin */}
            <View style={[styles.pin, { top: '20%', left: '22%' }]}>
              <View style={[styles.pinDot, { backgroundColor: '#0047AB' }]}>
                <Package size={12} color="#FFF" />
              </View>
              <View style={styles.pinLabel}>
                <Text style={styles.pinText}>Start</Text>
              </View>
            </View>

            {/* Customer Pin */}
            <View style={[styles.pin, { bottom: '18%', right: '15%' }]}>
              <View style={[styles.pinDot, { backgroundColor: '#10B981' }]}>
                <MapPin size={12} color="#FFF" />
              </View>
              <View style={styles.pinLabel}>
                <Text style={styles.pinText}>You</Text>
              </View>
            </View>

            {/* Rider Pin (animated) */}
            {order.rider && (
              <Animated.View style={[
                styles.pin, 
                { top: '42%', left: '40%' },
                riderDotStyle
              ]}>
                <View style={[styles.pinDot, styles.riderPinDot]}>
                  <Bike size={14} color="#050A18" />
                </View>
                <View style={[styles.pinLabel, styles.riderPinLabel]}>
                  <Text style={[styles.pinText, { color: '#D4AF37' }]}>{order.rider.name}</Text>
                </View>
              </Animated.View>
            )}

            {/* Route line (dashed) */}
            <View style={styles.routeLine} />
          </View>
        </View>

        {/* Status / Progress Tracker */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ORDER STATUS</Text>
          <View style={styles.stepsContainer}>
            {STATUS_STEPS.map((step, index) => {
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;
              const isFuture = index > currentStep;

              return (
                <View key={step.key}>
                  <View style={styles.stepRow}>
                    {/* Step indicator */}
                    <View style={styles.stepIndicator}>
                      {isCompleted ? (
                        <View style={styles.completedCircle}>
                          <CheckCircle size={18} color="#10B981" />
                        </View>
                      ) : isActive ? (
                        <Animated.View style={[styles.activeCircle, pulseStyle]}>
                          <CircleDot size={18} color="#D4AF37" />
                        </Animated.View>
                      ) : (
                        <View style={styles.futureCircle}>
                          <View style={styles.futureInner} />
                        </View>
                      )}
                    </View>

                    {/* Step label */}
                    <View style={styles.stepContent}>
                      <Text style={[
                        styles.stepLabel,
                        isCompleted && styles.completedLabel,
                        isActive && styles.activeLabel,
                        isFuture && styles.futureLabel,
                      ]}>
                        {step.label}
                      </Text>
                      {(isCompleted || isActive) && (
                        <Text style={[
                          styles.stepDescription,
                          isActive && { color: '#4B5563' }
                        ]}>
                          {step.description}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Connector line between steps */}
                  {index < STATUS_STEPS.length - 1 && (
                    <View style={styles.connectorWrapper}>
                      <View style={[
                        styles.connector,
                        isCompleted && styles.completedConnector,
                        isActive && styles.activeConnector,
                      ]} />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Rider Info Card */}
        {order.rider ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>YOUR RIDER</Text>
            <View style={styles.riderSection}>
              {/* Rider avatar + info */}
              <View style={styles.riderRow}>
                <View style={styles.riderAvatar}>
                  <Bike size={24} color="#D4AF37" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.riderName}>{order.rider.name}</Text>
                    <TouchableOpacity 
                      activeOpacity={0.7}
                      onPress={() => toggleFavoriteRider(order.rider.id)}
                    >
                      <Heart 
                        size={16} 
                        color={favoritesList.includes(order.rider.id) ? "#EF4444" : "#9CA3AF"} 
                        fill={favoritesList.includes(order.rider.id) ? "#EF4444" : "transparent"}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.riderMeta}>
                    <Star size={12} color="#D4AF37" fill="#D4AF37" />
                    <Text style={styles.riderRating}>{parseFloat(order.rider.rating || '5').toFixed(1)}</Text>
                    <Text style={styles.riderTrips}>• {order.rider.ratingsCount || '10'} trips</Text>
                  </View>
                  <Text style={styles.riderVehicle}>
                    {order.rider.riderDocuments?.[0]?.vehicleModel || 'Motorcycle'} • {order.rider.riderDocuments?.[0]?.plateNumber || 'Verified'}
                  </Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Shield size={14} color="#10B981" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </View>

              {/* Rating or Contact buttons */}
              {order.status === 'COMPLETED' ? (
                <View style={styles.ratingInfoContainer}>
                  {details.isRated ? (
                    <View style={styles.ratedBanner}>
                      <Star size={16} color="#10B981" fill="#10B981" />
                      <Text style={styles.ratedBannerText}>
                        You rated this pilot {details.riderRating}.0 ★
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={styles.rateButton}
                      activeOpacity={0.8}
                      onPress={() => setShowRateModal(true)}
                    >
                      <Star size={18} color="#FFFFFF" fill="#FFFFFF" />
                      <Text style={styles.rateButtonText}>Rate & Review Rider</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={styles.contactRow}>
                  <TouchableOpacity 
                    style={styles.callButton} 
                    activeOpacity={0.8}
                    onPress={() => {
                      if (order.rider?.phone) {
                        Linking.openURL(`tel:${order.rider.phone}`);
                      } else {
                        Alert.alert('Notice', 'No phone details available.');
                      }
                    }}
                  >
                    <Phone size={18} color="#0047AB" />
                    <Text style={styles.callText}>Call Rider</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.chatButton} 
                    activeOpacity={0.8}
                    onPress={() => router.push(`/chat/${order.id}` as any)}
                  >
                    <MessageSquare size={18} color="#FFFFFF" />
                    <Text style={styles.chatText}>Chat</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>YOUR RIDER</Text>
            <View style={styles.findingRiderBox}>
              <Animated.View style={pulseStyle}>
                <Bike size={32} color="#0047AB" />
              </Animated.View>
              <Text style={styles.findingTitle}>Finding Your Rider...</Text>
              <Text style={styles.findingDesc}>We're matching you with the best available rider nearby. This usually takes 1-3 minutes.</Text>
            </View>
          </View>
        )}

        {/* Order Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ORDER DETAILS</Text>
          
          {/* Route info */}
          <View style={styles.routeInfo}>
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: '#0047AB' }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.routeLabel}>PICKUP</Text>
                <Text style={styles.routeAddress}>{order.pickupAddress}</Text>
              </View>
            </View>
            <View style={styles.routeDivider} />
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: '#10B981' }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.routeLabel}>DROP-OFF</Text>
                <Text style={styles.routeAddress}>{order.dropoffAddress}</Text>
              </View>
            </View>
          </View>

          {/* Items */}
          <View style={styles.itemsSection}>
            <Text style={styles.itemsSectionTitle}>Items</Text>
            {itemStrings.map((item: string, idx: number) => (
              <View key={idx} style={styles.itemRow}>
                <View style={styles.itemBullet} />
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Price breakdown */}
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Errand cost</Text>
              <Text style={styles.priceValue}>₱{price.toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Fee</Text>
              <Text style={styles.priceValue}>₱{deliveryFee.toFixed(2)}</Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceRow}>
              <Text style={styles.priceTotalLabel}>Total</Text>
              <Text style={styles.priceTotalValue}>₱{totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Bottom spacer */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Star Rating & Review Modal */}
      <Modal
        visible={showRateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rate Your Rider Partner</Text>
            <Text style={styles.modalSubtitle}>How was your logistical experience with {order.rider?.name || 'this pilot'}?</Text>

            {/* Stars Selector Row */}
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  activeOpacity={0.7}
                  onPress={() => setRatingInput(star)}
                >
                  <Star 
                    size={36} 
                    color={star <= ratingInput ? '#D4AF37' : '#D1D5DB'} 
                    fill={star <= ratingInput ? '#D4AF37' : 'transparent'} 
                    style={{ marginHorizontal: 6 }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Review Comment Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Write a Review (Optional)</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Share details of your transit ride, safety, speed, or courier handling..."
                placeholderTextColor="#9CA3AF"
                multiline={true}
                numberOfLines={3}
                value={reviewComment}
                onChangeText={setReviewComment}
              />
            </View>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelBtn}
                onPress={() => {
                  setShowRateModal(false);
                  setRatingInput(5);
                  setReviewComment('');
                }}
                disabled={isSubmittingRating}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalSubmitBtn}
                onPress={handleSubmitRating}
                disabled={isSubmittingRating}
              >
                {isSubmittingRating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>Submit Review</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  centerAlign: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
  },
  errorDesc: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 24,
  },
  errorButton: {
    marginTop: 20,
    backgroundColor: '#0047AB',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#0047AB',
    paddingHorizontal: 20,
    paddingBottom: 18,
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
    gap: 12,
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
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    fontStyle: 'italic',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212,175,55,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  etaBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D4AF37',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },

  // Map card
  mapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  mapInner: {
    height: 200,
    backgroundColor: '#EEF2F7',
    position: 'relative',
    overflow: 'hidden',
  },
  mapGrid: {
    ...StyleSheet.absoluteFill,
  },
  gridH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#D1D5DB',
    opacity: 0.5,
  },
  gridV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#D1D5DB',
    opacity: 0.5,
  },
  river: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '55%',
    width: 30,
    backgroundColor: 'rgba(0,71,171,0.06)',
    transform: [{ rotate: '12deg' }],
  },
  pin: {
    position: 'absolute',
    alignItems: 'center',
  },
  pinDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  riderPinDot: {
    backgroundColor: '#D4AF37',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  pinLabel: {
    backgroundColor: '#FFF',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  riderPinLabel: {
    backgroundColor: '#050A18',
    borderColor: '#050A18',
  },
  pinText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#374151',
  },
  routeLine: {
    position: 'absolute',
    top: '35%',
    left: '28%',
    width: '40%',
    height: 2,
    backgroundColor: '#0047AB',
    opacity: 0.3,
    transform: [{ rotate: '25deg' }],
  },

  // Cards
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#9CA3AF',
    letterSpacing: 2,
    marginBottom: 16,
  },

  // Status steps
  stepsContainer: {},
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepIndicator: {
    width: 24,
    alignItems: 'center',
  },
  completedCircle: {},
  activeCircle: {},
  futureCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  futureInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
  },
  stepContent: {
    flex: 1,
    paddingVertical: 4,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  completedLabel: {
    color: '#10B981',
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  activeLabel: {
    color: '#D4AF37',
    fontWeight: '900',
    fontSize: 15,
  },
  futureLabel: {
    color: '#D1D5DB',
  },
  stepDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  connectorWrapper: {
    paddingLeft: 11,
    height: 20,
    justifyContent: 'center',
  },
  connector: {
    width: 2,
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  completedConnector: {
    backgroundColor: '#10B981',
  },
  activeConnector: {
    backgroundColor: '#D4AF37',
  },

  // Rider section
  riderSection: {
    gap: 16,
  },
  riderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  riderAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#050A18',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
  },
  riderName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1F2937',
  },
  riderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  riderRating: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D4AF37',
  },
  riderTrips: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  riderVehicle: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
    fontWeight: '600',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
  },
  contactRow: {
    flexDirection: 'row',
    gap: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingVertical: 14,
    backgroundColor: '#FAFAFA',
  },
  callText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0047AB',
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0047AB',
    borderRadius: 14,
    paddingVertical: 14,
    shadowColor: '#0047AB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  chatText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Finding rider
  findingRiderBox: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  findingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0047AB',
  },
  findingDesc: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },

  // Route info
  routeInfo: {
    marginBottom: 16,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 4,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  routeLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#9CA3AF',
    letterSpacing: 1.5,
  },
  routeAddress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 2,
  },
  routeDivider: {
    width: 2,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginLeft: 4,
  },

  // Items
  itemsSection: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 14,
    marginBottom: 14,
  },
  itemsSectionTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  itemBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D4AF37',
  },
  itemText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },

  // Price
  priceSection: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 14,
    gap: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  priceTotalLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1F2937',
  },
  priceTotalValue: {
    fontSize: 18,
    fontWeight: '900',
    fontStyle: 'italic',
  },

  // Rating styles
  ratingInfoContainer: {
    paddingTop: 8,
  },
  ratedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 14,
    paddingVertical: 14,
  },
  ratedBannerText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10B981',
  },
  rateButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#D4AF37',
    borderRadius: 14,
    paddingVertical: 14,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  rateButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#050A18',
  },

  // Rating Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 24, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1F2937',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    fontWeight: '500',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4B5563',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  commentInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: '#1F2937',
    minHeight: 80,
    textAlignVertical: 'top',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#4B5563',
    fontSize: 13,
    fontWeight: '700',
  },
  modalSubmitBtn: {
    flex: 1,
    backgroundColor: '#0047AB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
