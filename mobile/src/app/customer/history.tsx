import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Package, ChevronRight, ArrowLeft, ShoppingCart, Send, Bike } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authStore } from '../../utils/auth-store';
import { API_URL } from '../../constants/api';

export default function CustomerHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCustomerHistory = async () => {
    const token = authStore.getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/orders/customer`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        const closedMissions = resData.data.orders.filter(
          (order: any) => order.status === 'COMPLETED' || order.status === 'CANCELLED'
        );
        
        // Sort chronologically descending (newest first)
        closedMissions.sort(
          (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setHistory(closedMissions);
      } else {
        Alert.alert('Error', resData.error || 'Failed to fetch order history.');
      }
    } catch (err) {
      console.error('Error fetching customer history:', err);
      Alert.alert('Error', 'Unable to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerHistory();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const optionsDate: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
      const optionsTime: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
      return `${d.toLocaleDateString('en-US', optionsDate)} • ${d.toLocaleTimeString('en-US', optionsTime)}`;
    } catch (e) {
      return '';
    }
  };

  const getServiceLabel = (item: any) => {
    const details = item.details || {};
    const isRide = item.type === 'PAHATOD' && details.rideService === true;
    const serviceName = isRide ? 'FMU RIDE' : item.type;

    if (item.type === 'PABILI') {
      const firstItem = details.itemsList?.[0]?.name || 'Items';
      return `Pabili - ${firstItem}`;
    }
    if (item.type === 'PASUGO') {
      const desc = details.taskDetails || 'Errand';
      return `Pasugo - ${desc.length > 20 ? desc.substring(0, 18) + '...' : desc}`;
    }
    if (item.type === 'PAHATOD') {
      const desc = details.itemDescription || 'Delivery';
      return `${serviceName} - ${desc.length > 20 ? desc.substring(0, 18) + '...' : desc}`;
    }
    if (item.type === 'PAKUHA') {
      const desc = details.packageDetails || 'Package';
      return `Pakuha - ${desc.length > 20 ? desc.substring(0, 18) + '...' : desc}`;
    }
    return `${serviceName} Errand`;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerAlign]}>
        <ActivityIndicator size="large" color="#0047AB" />
        <Text style={styles.loadingText}>Syncing order history...</Text>
      </View>
    );
  }

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
            <Text style={styles.headerTitle}>Order History</Text>
            <Text style={styles.headerSubtitle}>Past Errand Records</Text>
          </View>
        </View>
      </View>

      {/* History List */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.listContainer}>
          {history.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Bike size={48} color="#D1D5DB" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyText}>No Past Records</Text>
              <Text style={styles.emptyDesc}>Deliveries you complete or cancel will appear in this ledger dashboard.</Text>
            </View>
          ) : (
            history.map((order) => {
              const details = order.details || {};
              const isPabili = order.type === 'PABILI';
              const isPasugo = order.type === 'PASUGO';
              const isPakuha = order.type === 'PAKUHA';
              const isRide = order.type === 'PAHATOD' && details.rideService === true;
              
              const deliveryFee = parseFloat(order.deliveryFee || '0');
              const price = parseFloat(order.price || '0');
              const totalCost = deliveryFee + price;

              return (
                <TouchableOpacity
                  key={order.id}
                  style={styles.historyCard}
                  activeOpacity={0.8}
                  onPress={() => router.push(`/track/${order.id}` as any)}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.cardLeft}>
                      <View style={[
                        styles.iconWrapper,
                        isPabili && styles.pabiliIconBg,
                        isPasugo && styles.pasugoIconBg,
                        isPakuha && styles.pakuhaIconBg,
                        isRide && styles.rideIconBg
                      ]}>
                        {isPabili ? <ShoppingCart size={18} color="#EA580C" /> :
                         isPasugo ? <Send size={18} color="#2563EB" /> :
                         isRide ? <Bike size={18} color="#D4AF37" /> :
                         <Package size={18} color="#0047AB" />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.orderService}>{getServiceLabel(order)}</Text>
                        <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.cardRight}>
                      <View style={styles.amountWrapper}>
                        <Text style={styles.orderAmount}>₱{totalCost.toFixed(2)}</Text>
                        <Text style={[
                          styles.successLabel,
                          order.status === 'CANCELLED' && styles.cancelledLabel
                        ]}>
                          {order.status}
                        </Text>
                      </View>
                      <ChevronRight size={18} color="#C7C7CC" style={styles.arrowIcon} />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
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
  listContainer: {
    padding: 24,
    gap: 12,
  },
  historyCard: {
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
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
  pabiliIconBg: {
    backgroundColor: 'rgba(234, 88, 12, 0.08)',
    borderColor: 'rgba(234, 88, 12, 0.2)',
  },
  pasugoIconBg: {
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderColor: 'rgba(37, 99, 235, 0.2)',
  },
  pakuhaIconBg: {
    backgroundColor: 'rgba(147, 51, 234, 0.08)',
    borderColor: 'rgba(147, 51, 234, 0.2)',
  },
  rideIconBg: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  orderService: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amountWrapper: {
    alignItems: 'flex-end',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1F2937',
    fontStyle: 'italic',
  },
  successLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  cancelledLabel: {
    color: '#EF4444',
  },
  arrowIcon: {
    marginLeft: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '800',
  },
  emptyDesc: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 18,
  },
});
