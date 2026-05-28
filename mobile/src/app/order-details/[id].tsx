import React from 'react';
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
  ArrowLeft, CheckCircle, XCircle, Package, Receipt,
  MapPin, Clock, Info, ShieldCheck, Download
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Mock historical order data
const HISTORY_ORDERS: Record<string, any> = {
  '1': {
    id: '1',
    referenceNo: 'FMU-20260506-001',
    service: 'Pabili',
    store: "McDonald's - J.C. Aquino",
    items: ['1pc Chicken McDo w/ Rice', 'McFries (Medium)', 'Coke (Medium)'],
    status: 'Completed',
    date: 'May 6, 2026',
    time: '2:15 PM',
    rider: {
      name: 'Mark Santos',
      vehicle: 'Honda Click 125i',
    },
    pickup: "McDonald's, J.C. Aquino Ave",
    dropoff: 'Brgy. Libertad, Butuan City',
    totalAmount: '₱350.00',
    deliveryFee: '₱49.00',
    subtotal: '₱301.00',
  },
  '2': {
    id: '2',
    referenceNo: 'FMU-20260505-082',
    service: 'Pahatod',
    store: "Documents",
    items: ['Legal Documents', 'Package Box'],
    status: 'Completed',
    date: 'May 5, 2026',
    time: '10:30 AM',
    rider: {
      name: 'Anna Cruz',
      vehicle: 'Yamaha Mio i125',
    },
    pickup: "City Hall, Butuan City",
    dropoff: 'Villa Kananga, Butuan City',
    totalAmount: '₱150.00',
    deliveryFee: '₱150.00',
    subtotal: '₱0.00', // Pahatod is usually just the delivery fee
  },
  '4': {
    id: '4',
    referenceNo: 'FMU-20260503-044',
    service: 'Pabili',
    store: "Puregold",
    items: ['Pancit Canton x5', 'Eggs 1 Dozen', 'Loaf Bread'],
    status: 'Cancelled',
    date: 'May 3, 2026',
    time: '4:45 PM',
    cancelReason: 'Store closed upon arrival.',
    rider: {
      name: 'John Doe',
      vehicle: 'Suzuki Skydrive',
    },
    pickup: "Puregold, Butuan City",
    dropoff: 'Brgy. Baan, Butuan City',
    totalAmount: '₱520.00',
    deliveryFee: '₱65.00',
    subtotal: '₱455.00',
  },
};

export default function OrderDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const orderId = (params.id as string) || '1';
  
  // Fallback if not found in mock
  const order = HISTORY_ORDERS[orderId] || HISTORY_ORDERS['1'];
  
  const isCompleted = order.status === 'Completed';

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
            <Text style={styles.headerTitle}>Order Summary</Text>
            <Text style={styles.headerSubtitle}>Ref: {order.referenceNo}</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          {isCompleted ? (
            <CheckCircle size={48} color="#10B981" />
          ) : (
            <XCircle size={48} color="#EF4444" />
          )}
          <Text style={[styles.statusText, !isCompleted && { color: '#EF4444' }]}>
            Order {order.status}
          </Text>
          <Text style={styles.dateText}>{order.date} • {order.time}</Text>
          
          {!isCompleted && order.cancelReason && (
            <View style={styles.reasonBox}>
              <Info size={16} color="#EF4444" />
              <Text style={styles.reasonText}>{order.cancelReason}</Text>
            </View>
          )}
        </View>

        {/* E-Receipt Card */}
        <View style={styles.receiptCard}>
          <View style={styles.receiptHeader}>
            <Receipt size={20} color="#0047AB" />
            <Text style={styles.receiptTitle}>E-RECEIPT</Text>
          </View>

          <View style={styles.dashedLine} />

          {/* Service & Store Info */}
          <View style={styles.serviceSection}>
            <Text style={styles.serviceLabel}>SERVICE</Text>
            <Text style={styles.serviceValue}>{order.service} - {order.store}</Text>
          </View>

          {/* Route Info */}
          <View style={styles.routeSection}>
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: '#0047AB' }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.routeLabel}>PICKUP LOCATION</Text>
                <Text style={styles.routeAddress}>{order.pickup}</Text>
              </View>
            </View>
            <View style={styles.routeDivider} />
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: '#10B981' }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.routeLabel}>DROP-OFF LOCATION</Text>
                <Text style={styles.routeAddress}>{order.dropoff}</Text>
              </View>
            </View>
          </View>

          <View style={styles.dashedLine} />

          {/* Items */}
          <View style={styles.itemsSection}>
            <Text style={styles.sectionHeading}>ORDER DETAILS</Text>
            {order.items.map((item: string, idx: number) => (
              <View key={idx} style={styles.itemRow}>
                <Text style={styles.itemQuantity}>1x</Text>
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.dashedLine} />

          {/* Price Breakdown */}
          <View style={styles.priceSection}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.priceValue}>{order.subtotal}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Fee</Text>
              <Text style={styles.priceValue}>{order.deliveryFee}</Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>{order.totalAmount}</Text>
            </View>
          </View>
          
          {/* Zigzag bottom edge effect using CSS borders */}
          <View style={styles.receiptBottomEdge} />
        </View>

        {/* Rider Info (If completed) */}
        {isCompleted && order.rider && (
          <View style={styles.riderCard}>
            <Text style={styles.sectionHeading}>DELIVERED BY</Text>
            <View style={styles.riderInfo}>
              <View style={styles.riderAvatar}>
                <ShieldCheck size={20} color="#10B981" />
              </View>
              <View>
                <Text style={styles.riderName}>{order.rider.name}</Text>
                <Text style={styles.riderVehicle}>{order.rider.vehicle}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
            <Download size={20} color="#0047AB" />
            <Text style={styles.actionText}>Download Receipt</Text>
          </TouchableOpacity>
        </View>

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
    letterSpacing: 1,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },

  // Status Card
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    marginTop: -10,
  },
  statusText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#10B981',
    marginTop: 12,
    letterSpacing: -0.5,
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 4,
  },
  reasonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
  },
  reasonText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
  },

  // Receipt Card
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  receiptTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0047AB',
    letterSpacing: 2,
  },
  dashedLine: {
    height: 1,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginVertical: 16,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '900',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 12,
  },

  // Service Info
  serviceSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 4,
  },
  serviceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },

  // Route Info
  routeSection: {
    marginTop: 12,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
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
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginTop: 2,
  },
  routeDivider: {
    width: 2,
    height: 16,
    backgroundColor: '#E5E7EB',
    marginLeft: 4,
    marginVertical: 4,
  },

  // Items
  itemsSection: {
    marginBottom: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0047AB',
    width: 30,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },

  // Price
  priceSection: {
    gap: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 4,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0047AB',
    fontStyle: 'italic',
  },
  receiptBottomEdge: {
    position: 'absolute',
    bottom: -10,
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: '#F3F4F6',
  },

  // Rider Card
  riderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  riderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  riderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(16,185,129,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  riderName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
  riderVehicle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },

  // Actions
  actionsContainer: {
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#0047AB',
  },
  actionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0047AB',
  },
});
