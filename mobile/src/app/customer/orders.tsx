import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Package, Clock, ArrowLeft, ChevronRight, Bike } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authStore } from '../../utils/auth-store';
import { API_URL } from '../../constants/api';

export default function CustomerOrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    const token = authStore.getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/orders/customer`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await response.json();

      if (response.ok && resData.success) {
        setOrders(resData.data.orders);
      }
    } catch (err) {
      console.error('Error fetching customer orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Poll every 10 seconds for real-time order status updates
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          text: 'FINDING RIDER',
          container: styles.statusFinding,
          textStyle: styles.statusFindingText
        };
      case 'ACCEPTED':
        return {
          text: 'RIDER ACCEPTED',
          container: styles.statusTransit,
          textStyle: styles.statusTransitText
        };
      case 'IN_TRANSIT':
        return {
          text: 'IN TRANSIT',
          container: styles.statusTransit,
          textStyle: styles.statusTransitText
        };
      case 'COMPLETED':
        return {
          text: 'COMPLETED',
          container: styles.statusCompleted,
          textStyle: styles.statusCompletedText
        };
      case 'CANCELLED':
        return {
          text: 'CANCELLED',
          container: styles.statusCancelled,
          textStyle: styles.statusCancelledText
        };
      default:
        return {
          text: status,
          container: styles.statusCompleted,
          textStyle: styles.statusCompletedText
        };
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Premium Header */}
      <View style={[styles.header, { paddingTop: insets.top || 20 }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => router.push('/customer/' as any)}
          >
            <ArrowLeft size={20} color="#D4AF37" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>My Orders</Text>
            <Text style={styles.headerSubtitle}>Real-time Deployment Status</Text>
          </View>
        </View>
      </View>

      {/* Orders List */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#0047AB" />
            <Text style={styles.loaderText}>Syncing Missions...</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {orders.map((order) => {
              const statusDetails = getStatusDetails(order.status);
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <TouchableOpacity
                  key={order.id}
                  style={styles.orderCard}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/track/${order.id}` as any)}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View style={styles.iconWrapper}>
                        <Package size={22} color="#0047AB" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.orderService}>
                          {order.type === 'PAHATOD' && order.details?.rideService === true ? 'FMU RIDE' : order.type} - {order.pickupAddress.split(',')[0]}
                        </Text>
                        <Text style={styles.orderRider}>
                          {order.rider ? `Rider: ${order.rider.name}` : 'Searching for pilot...'}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, statusDetails.container]}>
                      <Text style={[styles.statusText, statusDetails.textStyle]}>
                        {statusDetails.text}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <View style={styles.timeWrapper}>
                      <Clock size={14} color="#6B7280" />
                      <Text style={styles.timeText}>
                        Fee: ₱{Number(order.deliveryFee).toFixed(2)} {Number(order.price) > 0 && `+ Item: ₱${Number(order.price).toFixed(2)}`} • {formattedDate}
                      </Text>
                    </View>
                    <ChevronRight size={16} color="#9CA3AF" />
                  </View>
                </TouchableOpacity>
              );
            })}

            {orders.length === 0 && (
              <View style={styles.emptyContainer}>
                <Bike size={48} color="#D1D5DB" style={{ marginBottom: 12 }} />
                <Text style={styles.emptyText}>No Active Operations Found</Text>
                <Text style={styles.emptyDesc}>Choose a service to launch your first delivery courier errand today!</Text>
              </View>
            )}
          </View>
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
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  loaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1,
  },
  listContainer: {
    padding: 24,
    gap: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 71, 171, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 71, 171, 0.1)',
  },
  orderService: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  orderRider: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statusBadge: {
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  statusTransit: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  statusTransitText: {
    color: '#D4AF37',
  },
  statusFinding: {
    backgroundColor: 'rgba(0, 71, 171, 0.08)',
    borderColor: 'rgba(0, 71, 171, 0.2)',
  },
  statusFindingText: {
    color: '#0047AB',
  },
  statusCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  statusCompletedText: {
    color: '#10B981',
  },
  statusCancelled: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  statusCancelledText: {
    color: '#EF4444',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  timeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    gap: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '700',
  },
  emptyDesc: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
});
