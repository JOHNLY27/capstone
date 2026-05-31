import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { ShoppingBag, Send, Package, Navigation, Bell, MapPin, Bike, Wallet } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authStore } from '../../utils/auth-store';
import { API_URL } from '../../constants/api';

const { width } = Dimensions.get('window');

export default function CustomerDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [user, setUser] = useState(authStore.getUser());
  const [activeOrders, setActiveOrders] = useState<any[]>([]);

  const fetchProfileAndOrders = async () => {
    const token = authStore.getToken();
    if (!token) return;

    try {
      // 1. Fetch latest profile/wallet balance
      const profileRes = await fetch(`${API_URL}/api/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const profileData = await profileRes.json();
      if (profileRes.ok && profileData.success) {
        authStore.updateUser(profileData.data.user);
        setUser(authStore.getUser());
      }

      // 2. Fetch customer orders
      const ordersRes = await fetch(`${API_URL}/api/orders/customer`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const ordersData = await ordersRes.json();
      if (ordersRes.ok && ordersData.success) {
        // Filter for active orders (status is PENDING, ACCEPTED, or IN_TRANSIT)
        const active = ordersData.data.orders.filter((order: any) => 
          ['PENDING', 'ACCEPTED', 'IN_TRANSIT'].includes(order.status)
        );
        setActiveOrders(active);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchProfileAndOrders();

    // Poll every 10 seconds for real-time updates while on the dashboard
    const interval = setInterval(fetchProfileAndOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const services = [
    {
      id: 'pabili',
      title: 'Pabili',
      description: 'Food & Groceries',
      icon: ShoppingBag,
      color: '#0047AB',
      path: '/customer/pabili',
    },
    {
      id: 'pasugo',
      title: 'Pasugo',
      description: 'Errands & Parcel',
      icon: Send,
      color: '#D4AF37',
      path: '/customer/pasugo',
    },
    {
      id: 'pakuha',
      title: 'Pakuha',
      description: 'Pickup Items',
      icon: Package,
      color: '#050A18',
      path: '/customer/pakuha',
    },
    {
      id: 'pahatod',
      title: 'Pahatod',
      description: 'Drop-off / Delivery',
      icon: Navigation,
      color: '#475569', // slate-600
      path: '/customer/pahatod',
    },
    {
      id: 'ride',
      title: 'FMU Ride',
      description: 'Passenger / Hatud',
      icon: Bike,
      color: '#D4AF37',
      path: '/customer/ride',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Header Section with Profile & Delivery Zone */}
        <View style={[styles.headerBackground, { paddingTop: insets.top || 20 }]}>
          <View style={styles.headerContent}>
            <View style={styles.profileRow}>
              <View style={styles.profileLeft}>
                <View style={styles.logoWrapper}>
                  <Image 
                    source={require('../../../assets/images/logo.png')} 
                    style={styles.logo}
                    resizeMode="cover"
                  />
                </View>
                <View>
                  <Text style={styles.greetingText}>Hello, {user?.name.split(' ')[0] || 'Customer'}!</Text>
                  <Text style={styles.missionText}>What's your mission today?</Text>
                </View>
              </View>
              
              <View style={styles.headerRight}>
                <TouchableOpacity 
                  style={styles.walletChip}
                  activeOpacity={0.8}
                  onPress={() => router.push('/customer/wallet')}
                >
                  <Wallet size={14} color="#D4AF37" />
                  <Text style={styles.walletBalanceText}>
                    ₱{Number(user?.walletBalance || 0).toFixed(2)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.notificationButton}
                  activeOpacity={0.7}
                  onPress={() => router.push('/customer/notifications')}
                >
                  <Bell size={22} color="#FFFFFF" />
                  <View style={styles.notificationBadge} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Delivery Zone Banner */}
            <View style={styles.deliveryZone}>
              <MapPin size={20} color="#D4AF37" style={styles.zoneIcon} />
              <View>
                <Text style={styles.zoneLabel}>DELIVERY ZONE</Text>
                <Text style={styles.zoneValue}>Buhangin, Butuan City</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Services & Active Orders Section */}
        <View style={styles.body}>
          
          <Text style={styles.sectionTitle}>Services</Text>
          
          {/* Services Grid (2 Columns) */}
          <View style={styles.servicesGrid}>
            {services.map((service) => {
              const IconComponent = service.icon;
              return (
                <TouchableOpacity
                  key={service.id}
                  style={styles.serviceCard}
                  activeOpacity={0.8}
                  onPress={() => router.push(service.path as any)}
                >
                  <View style={[styles.iconWrapper, { backgroundColor: service.color }]}>
                    <IconComponent size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                  <Text style={styles.serviceDesc}>{service.description}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Active Orders Section */}
          <View style={styles.activeOrdersSection}>
            <View style={styles.activeOrdersHeader}>
              <Text style={styles.sectionTitle}>Active Orders</Text>
              <TouchableOpacity onPress={() => router.push('/customer/orders')}>
                <Text style={styles.viewAllText}>VIEW ALL</Text>
              </TouchableOpacity>
            </View>

            {activeOrders.length === 0 ? (
              <View style={styles.emptyOrdersCard}>
                <Bike size={28} color="#D4AF37" style={{ marginBottom: 10 }} />
                <Text style={styles.emptyOrdersTitle}>No Active Errands</Text>
                <Text style={styles.emptyOrdersDesc}>Need something fetched? Choose a service above to dispatch a rider.</Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {activeOrders.map((order) => (
                  <TouchableOpacity 
                    key={order.id}
                    style={styles.orderCard}
                    activeOpacity={0.9}
                    onPress={() => router.push('/customer/orders' as any)}
                  >
                    <View style={styles.orderHeader}>
                      <Text style={styles.orderTitle}>
                        {order.type === 'PAHATOD' && order.details?.rideService === true ? 'FMU RIDE' : order.type} - {order.pickupAddress.split(',')[0]}
                      </Text>
                      <View style={[
                        styles.statusBadge,
                        order.status === 'PENDING' && { backgroundColor: 'rgba(107, 114, 128, 0.1)', borderColor: 'rgba(107, 114, 128, 0.25)' },
                        order.status === 'ACCEPTED' && { backgroundColor: 'rgba(0, 71, 171, 0.1)', borderColor: 'rgba(0, 71, 171, 0.25)' },
                        order.status === 'IN_TRANSIT' && { backgroundColor: 'rgba(212, 175, 55, 0.12)', borderColor: 'rgba(212, 175, 55, 0.25)' },
                      ]}>
                        <Text style={[
                          styles.statusBadgeText,
                          order.status === 'PENDING' && { color: '#6B7280' },
                          order.status === 'ACCEPTED' && { color: '#0047AB' },
                          order.status === 'IN_TRANSIT' && { color: '#D4AF37' },
                        ]}>
                          {order.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.riderText}>
                      {order.rider ? `Rider: ${order.rider.name}` : 'Searching for nearby rider...'}
                    </Text>
                    <View style={styles.timeWrapper}>
                      <Navigation size={14} color="#6B7280" />
                      <Text style={styles.timeText}>
                        Fee: ₱{Number(order.deliveryFee).toFixed(2)} {Number(order.price) > 0 && `+ Item: ₱${Number(order.price).toFixed(2)}`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerBackground: {
    backgroundColor: '#0047AB',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    paddingBottom: 32,
    shadowColor: '#0047AB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  headerContent: {
    width: '100%',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logoWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    padding: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    fontStyle: 'italic',
    letterSpacing: -0.5,
  },
  missionText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D4AF37',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  walletChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  walletBalanceText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  notificationButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 50,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  deliveryZone: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  zoneIcon: {
    marginRight: 2,
  },
  zoneLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1.5,
  },
  zoneValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 2,
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 28,
  },
  serviceCard: {
    width: (width - 64) / 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  serviceDesc: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  activeOrdersSection: {
    marginTop: 8,
  },
  activeOrdersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0047AB',
    letterSpacing: 1.5,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0047AB',
    fontStyle: 'italic',
  },
  statusBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  riderText: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 10,
  },
  timeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  emptyOrdersCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyOrdersTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  emptyOrdersDesc: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 16,
  },
});
