import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  Image
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  Bike, Phone, MessageSquare, MapPin, ArrowLeft, 
  Navigation, CheckCircle, Clock, Package, Star,
  Shield, CircleDot
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

const { width, height } = Dimensions.get('window');

// Mock order data
const MOCK_ORDERS: Record<string, any> = {
  '1': {
    id: '1',
    service: 'Pabili',
    store: 'Jollibee - Robinsons Butuan',
    items: ['2pc Chickenjoy', 'Jolly Spaghetti', 'Peach Mango Pie x2'],
    status: 'in_transit',
    rider: {
      name: 'Mark Santos',
      phone: '+63 912 345 6789',
      rating: 4.9,
      completedTrips: 847,
      vehicle: 'Honda Click 125i',
      plate: 'ABC-1234',
    },
    pickup: 'Jollibee, Robinsons Place Butuan',
    dropoff: 'Brgy. Libertad, J.C. Aquino Ave',
    estimatedTime: '12-15 min',
    totalAmount: '₱385.00',
    deliveryFee: '₱49.00',
    orderTime: '2:30 PM',
  },
  '2': {
    id: '2',
    service: 'Pasugo',
    store: 'Cash-In Service',
    items: ['GCash Cash-In ₱500'],
    status: 'finding_rider',
    rider: null,
    pickup: 'Palawan Pawnshop - Butuan',
    dropoff: 'Villa Kananga, Butuan City',
    estimatedTime: 'Finding rider...',
    totalAmount: '₱500.00',
    deliveryFee: '₱39.00',
    orderTime: '2:45 PM',
  },
  '3': {
    id: '3',
    service: 'Pakuha',
    store: 'Document Pickup',
    items: ['Birth Certificate', 'Barangay Clearance'],
    status: 'picked_up',
    rider: {
      name: 'Anna Cruz',
      phone: '+63 917 654 3210',
      rating: 4.8,
      completedTrips: 562,
      vehicle: 'Yamaha Mio i125',
      plate: 'XYZ-5678',
    },
    pickup: 'City Hall, Butuan City',
    dropoff: 'Brgy. Baan, Butuan City',
    estimatedTime: '8-10 min',
    totalAmount: '₱200.00',
    deliveryFee: '₱55.00',
    orderTime: '2:15 PM',
  },
};

const STATUS_STEPS = [
  { key: 'confirmed', label: 'Order Confirmed', description: 'Your order has been placed' },
  { key: 'finding_rider', label: 'Finding Rider', description: 'Matching you with a nearby rider' },
  { key: 'rider_accepted', label: 'Rider Accepted', description: 'Rider is heading to the store' },
  { key: 'picked_up', label: 'Items Picked Up', description: 'Rider has your items' },
  { key: 'in_transit', label: 'In Transit', description: 'Rider is on the way to you' },
  { key: 'delivered', label: 'Delivered', description: 'Order complete!' },
];

function getStepIndex(status: string): number {
  switch (status) {
    case 'confirmed': return 0;
    case 'finding_rider': return 1;
    case 'rider_accepted': return 2;
    case 'picked_up': return 3;
    case 'in_transit': return 4;
    case 'delivered': return 5;
    default: return 1;
  }
}

export default function TrackOrderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const orderId = (params.id as string) || '1';
  const order = MOCK_ORDERS[orderId] || MOCK_ORDERS['1'];
  const currentStep = getStepIndex(order.status);

  // Pulsing animation for active step
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

  // Rider dot movement animation
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

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#D4AF37" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Track Order</Text>
            <Text style={styles.headerSubtitle}>Order #{order.id} • {order.service}</Text>
          </View>
          <View style={styles.etaBadge}>
            <Clock size={12} color="#D4AF37" />
            <Text style={styles.etaBadgeText}>{order.estimatedTime}</Text>
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
                <Text style={styles.pinText}>Store</Text>
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
                  <Text style={styles.riderName}>{order.rider.name}</Text>
                  <View style={styles.riderMeta}>
                    <Star size={12} color="#D4AF37" fill="#D4AF37" />
                    <Text style={styles.riderRating}>{order.rider.rating}</Text>
                    <Text style={styles.riderTrips}>• {order.rider.completedTrips} trips</Text>
                  </View>
                  <Text style={styles.riderVehicle}>{order.rider.vehicle} • {order.rider.plate}</Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Shield size={14} color="#10B981" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </View>

              {/* Contact buttons */}
              <View style={styles.contactRow}>
                <TouchableOpacity style={styles.callButton} activeOpacity={0.8}>
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
                <Text style={styles.routeAddress}>{order.pickup}</Text>
              </View>
            </View>
            <View style={styles.routeDivider} />
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: '#10B981' }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.routeLabel}>DROP-OFF</Text>
                <Text style={styles.routeAddress}>{order.dropoff}</Text>
              </View>
            </View>
          </View>

          {/* Items */}
          <View style={styles.itemsSection}>
            <Text style={styles.itemsSectionTitle}>Items</Text>
            {order.items.map((item: string, idx: number) => (
              <View key={idx} style={styles.itemRow}>
                <View style={styles.itemBullet} />
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Price breakdown */}
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Order Total</Text>
              <Text style={styles.priceValue}>{order.totalAmount}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Fee</Text>
              <Text style={styles.priceValue}>{order.deliveryFee}</Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceRow}>
              <Text style={styles.priceTotalLabel}>Total</Text>
              <Text style={styles.priceTotalValue}>
                ₱{(parseFloat(order.totalAmount.replace('₱', '').replace(',', '')) + parseFloat(order.deliveryFee.replace('₱', '').replace(',', ''))).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom spacer */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
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
    color: '#0047AB',
    fontStyle: 'italic',
  },
});
