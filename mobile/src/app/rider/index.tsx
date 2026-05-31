import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  FlatList,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, DollarSign, Clock, Bell, TrendingUp, Navigation, Package, ShoppingCart, Send, Info, User, Phone, MessageSquare, Check, X, Zap, Bike } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authStore } from '../../utils/auth-store';
import { API_URL } from '../../constants/api';

const { width, height } = Dimensions.get('window');

export default function RiderDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [user, setUser] = useState(authStore.getUser());
  const [nearbyRequests, setNearbyRequests] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  
  const [availabilityVisible, setAvailabilityVisible] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Stats
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [weeklyEarnings, setWeeklyEarnings] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  const fetchRiderDashboardData = async () => {
    const token = authStore.getToken();
    if (!token) return;

    try {
      // 1. Fetch available pending orders
      const avRes = await fetch(`${API_URL}/api/orders/available`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const avData = await avRes.json();
      if (avRes.ok && avData.success) {
        setNearbyRequests(avData.data.orders);
      }

      // 2. Fetch rider stats & active orders (using rider orders history)
      const rdRes = await fetch(`${API_URL}/api/orders/rider`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const rdData = await rdRes.json();
      if (rdRes.ok && rdData.success) {
        const todayStr = new Date().toDateString();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        let earnings = 0;
        let weekly = 0;
        let count = 0;
        const activeList: any[] = [];

        rdData.data.orders.forEach((order: any) => {
          if (order.status === 'COMPLETED') {
            // Use updatedAt because it represents the completion date (when it was actually earned)
            const orderDate = new Date(order.updatedAt || order.createdAt);
            const orderDateStr = orderDate.toDateString();
            const fee = parseFloat(order.deliveryFee || '0');

            if (orderDateStr === todayStr) {
              earnings += fee;
              count += 1;
            }

            if (orderDate >= oneWeekAgo) {
              weekly += fee;
            }
          } else if (order.status === 'ACCEPTED' || order.status === 'IN_TRANSIT') {
            activeList.push(order);
          }
        });

        setTodayEarnings(earnings);
        setWeeklyEarnings(weekly);
        setCompletedCount(count);
        setActiveOrders(activeList);
      }
    } catch (err) {
      console.error('Error fetching rider dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRiderDashboardData();

    // Poll every 10 seconds for real-time jobs
    const interval = setInterval(fetchRiderDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptJob = async (orderId: string) => {
    setIsLoading(true);
    try {
      const token = authStore.getToken();
      const response = await fetch(`${API_URL}/api/orders/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Failed to accept order.');
      }

      Alert.alert('Job Accepted', 'Mission locked! Route to store/pickup coordinates to proceed.', [
        {
          text: 'Proceed',
          onPress: () => {
            setSelectedRequest(null);
            router.push(`/rider/delivery?id=${orderId}` as any);
          }
        }
      ]);
    } catch (err: any) {
      console.error('Job accept error:', err);
      Alert.alert('Failed to Claim Job', err.message || 'Another rider might have claimed this already.');
    } finally {
      setIsLoading(false);
      fetchRiderDashboardData();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Header Section with Profile & Today Stats */}
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
                  <Text style={styles.greetingText}>Hello, {user?.name.split(' ')[0] || 'Rider'}!</Text>
                  <Text style={styles.onlineText}>{isOnline ? 'Commander Online' : 'Commander Offline'}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.notificationButton}
                activeOpacity={0.7}
                onPress={() => router.push('/rider/notifications')}
              >
                <Bell size={24} color="#FFFFFF" />
                <View style={styles.notificationBadge} />
              </TouchableOpacity>
            </View>

            {/* Earnings & Completed Grid */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <DollarSign size={16} color="#D4AF37" />
                  <Text style={styles.statLabel}>Today's Earnings</Text>
                </View>
                <Text style={styles.statValue}>₱{todayEarnings.toFixed(2)}</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <TrendingUp size={16} color="#D4AF37" />
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
                <Text style={styles.statValue}>{completedCount}</Text>
              </View>
            </View>

          </View>
        </View>

        {/* Availability Banner & Requests Section */}
        <View style={styles.body}>

          {/* Availability Status Banner */}
          <View style={styles.availabilityBanner}>
            <View style={styles.availabilityInfo}>
              <View style={[styles.pulseIndicator, !isOnline && { backgroundColor: '#EF4444' }]} />
              <View>
                <Text style={styles.bannerTitle}>{isOnline ? "You're Online" : "You're Offline"}</Text>
                <Text style={styles.bannerDesc}>{isOnline ? "Ready to accept orders" : "Not receiving any orders"}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.manageButton}
              activeOpacity={0.8}
              onPress={() => setAvailabilityVisible(true)}
            >
              <Text style={styles.manageButtonText}>MANAGE</Text>
            </TouchableOpacity>
          </View>

          {/* Active Missions Section */}
          {activeOrders.length > 0 && (
            <View style={styles.activeSection}>
              <View style={styles.activeHeader}>
                <Text style={styles.activeSectionTitle}>Active Missions ({activeOrders.length})</Text>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              </View>

              {activeOrders.map((order) => {
                const details = order.details || {};
                const isRide = order.type === 'PAHATOD' && details.rideService === true;
                const serviceLabel = isRide ? 'FMU RIDE' : order.type;
                const totalCost = parseFloat(order.deliveryFee || '0') + parseFloat(order.price || '0');

                return (
                  <TouchableOpacity
                    key={order.id}
                    style={styles.activeCard}
                    activeOpacity={0.9}
                    onPress={() => router.push(`/rider/delivery?id=${order.id}` as any)}
                  >
                    <View style={styles.activeCardTop}>
                      <View style={styles.activeCardLeft}>
                        <View style={styles.activeIconBg}>
                          <Bike size={20} color="#D4AF37" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.activeCardTitle} numberOfLines={1}>
                            {serviceLabel} Delivery
                          </Text>
                          <Text style={styles.activeCardSub} numberOfLines={1}>
                            To: {order.dropoffAddress.split(',')[0]}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.activePriceBadge}>
                        <Text style={styles.activePriceText}>₱{totalCost.toFixed(2)}</Text>
                      </View>
                    </View>

                    <View style={styles.activeCardDivider} />

                    <View style={styles.activeCardBottom}>
                      <View style={styles.activeStatusWrapper}>
                        <View style={styles.activeStatusIndicator} />
                        <Text style={styles.activeStatusText}>
                          {order.status === 'ACCEPTED' ? 'Heading to Pickup' : 'In Transit'}
                        </Text>
                      </View>
                      <View style={styles.viewMissionButton}>
                        <Text style={styles.viewMissionButtonText}>RESUME MISSION ➡️</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Nearby Requests Section */}
          <View style={styles.requestsSection}>
            <View style={styles.requestsHeader}>
              <Text style={styles.sectionTitle}>Nearby Requests</Text>
              <Clock size={20} color="#9CA3AF" />
            </View>

            {!isOnline ? (
              <View style={styles.emptyRequestsCard}>
                <Navigation size={32} color="#EF4444" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyRequestsTitle}>You are Offline</Text>
                <Text style={styles.emptyRequestsDesc}>Turn on your online status from the availability toggle above to start receiving nearby errand requests in Butuan City.</Text>
              </View>
            ) : isLoading ? (
              <ActivityIndicator size="small" color="#D4AF37" />
            ) : nearbyRequests.length === 0 ? (
              <View style={styles.emptyRequestsCard}>
                <Zap size={32} color="#D1D5DB" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyRequestsTitle}>No Pending Errands</Text>
                <Text style={styles.emptyRequestsDesc}>Butuan City is quiet right now. Real-time dispatches will show up instantly here.</Text>
              </View>
            ) : (
              <View style={styles.requestsList}>
                {nearbyRequests.map((request) => {
                  const isPabili = request.type === 'PABILI';
                  const isPasugo = request.type === 'PASUGO';
                  const isPakuha = request.type === 'PAKUHA';

                  const itemCost = parseFloat(request.price || '0');
                  const deliveryFee = parseFloat(request.deliveryFee || '0');
                  const payAmount = deliveryFee + itemCost;

                  return (
                    <TouchableOpacity
                      key={request.id}
                      style={styles.requestCard}
                      activeOpacity={0.9}
                      onPress={() => setSelectedRequest(request)}
                    >
                      <View style={styles.cardTop}>
                        <View style={styles.cardHeaderLeft}>
                          <View style={[
                            styles.cardIconWrapper,
                            isPabili && styles.pabiliIconBg,
                            isPasugo && styles.pasugoIconBg,
                            !isPabili && !isPasugo && styles.pahatodIconBg
                          ]}>
                            {isPabili ? <ShoppingCart size={20} color="#EA580C" /> :
                              isPasugo ? <Send size={20} color="#2563EB" /> :
                                <Package size={20} color="#9333EA" />}
                          </View>
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Text style={styles.cardServiceTitle} numberOfLines={1}>
                                {request.type === 'PAHATOD' && request.details?.rideService === true ? 'FMU RIDE' : request.type} - {request.pickupAddress.split(',')[0]}
                              </Text>
                              {request.details?.targetedRiderId === user?.id && (
                                <View style={styles.directRequestBadge}>
                                  <Text style={styles.directRequestText}>🎯 DIRECT</Text>
                                </View>
                              )}
                            </View>
                            <Text style={styles.cardCustomerText} numberOfLines={1}>
                              Customer: {request.customer?.name || 'FetchMeUp Client'}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.paymentBadge}>
                          <Text style={styles.paymentBadgeText}>₱{payAmount.toFixed(2)}</Text>
                        </View>
                      </View>

                      <View style={styles.cardBottom}>
                        <View style={styles.cardMetaRow}>
                          <View style={styles.cardMetaItem}>
                            <MapPin size={14} color="#9CA3AF" />
                            <Text style={styles.cardMetaText}>{request.estimatedDistance.toFixed(1)} km</Text>
                          </View>
                          <View style={styles.cardMetaItem}>
                            <Clock size={14} color="#9CA3AF" />
                            <Text style={styles.cardMetaText}>Active</Text>
                          </View>
                        </View>

                        <TouchableOpacity
                          style={styles.acceptButton}
                          activeOpacity={0.8}
                          onPress={() => handleAcceptJob(request.id)}
                        >
                          <Text style={styles.acceptButtonText}>ACCEPT</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Weekly Summary Banner */}
          <TouchableOpacity
            style={styles.weeklySummaryCard}
            activeOpacity={0.9}
            onPress={() => router.push('/rider/earnings')}
          >
            <View>
              <Text style={styles.weeklySummaryLabel}>WEEKLY EARNINGS</Text>
              <Text style={styles.weeklySummaryValue}>₱{weeklyEarnings.toFixed(2)}</Text>
            </View>
            <Navigation size={28} color="#D4AF37" />
          </TouchableOpacity>

        </View>

      </ScrollView>

      {/* Request Details Dialog Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={!!selectedRequest}
        onRequestClose={() => setSelectedRequest(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedRequest && (
              <>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderTop}>
                    <View style={styles.modalBadge}>
                      <Text style={styles.modalBadgeText}>
                        {selectedRequest.type === 'PAHATOD' && selectedRequest.details?.rideService === true ? 'FMU RIDE' : selectedRequest.type}
                      </Text>
                    </View>
                    <Text style={styles.modalPaymentText}>
                      ₱{(parseFloat(selectedRequest.deliveryFee) + parseFloat(selectedRequest.price || '0')).toFixed(2)}
                    </Text>
                  </View>
                  <Text style={styles.modalServiceTitle} numberOfLines={1}>
                    {selectedRequest.type === 'PAHATOD' && selectedRequest.details?.rideService === true ? 'Passenger transit ride' : `${selectedRequest.type} shopping & delivery`}
                  </Text>
                  <View style={styles.modalMetaRow}>
                    <Clock size={14} color="#9CA3AF" />
                    <Text style={styles.modalMetaText}>Est: {selectedRequest.estimatedDistance.toFixed(1)} km • Pay: {selectedRequest.details?.paymentMethod || 'WALLET'}</Text>
                  </View>
                </View>

                {/* Modal Scroll Content */}
                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>

                  {/* Customer Block */}
                  <View style={styles.customerBlock}>
                    <View style={styles.customerInfoLeft}>
                      <View style={styles.customerIconWrapper}>
                        <User size={22} color="#0047AB" />
                      </View>
                      <View>
                        <Text style={styles.blockSublabel}>CUSTOMER</Text>
                        <Text style={styles.blockLabel}>{selectedRequest.customer?.name || 'Client'}</Text>
                      </View>
                    </View>
                    <View style={styles.customerActions}>
                      <TouchableOpacity style={styles.actionIconButton}>
                        <MessageSquare size={18} color="#9CA3AF" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionIconButton}>
                        <Phone size={18} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Request Items details */}
                  <View style={styles.detailsBlock}>
                    <View style={styles.blockHeaderRow}>
                      <View style={[styles.blockHeaderIcon, { backgroundColor: '#FFEDD5' }]}>
                        <Info size={16} color="#EA580C" />
                      </View>
                      <Text style={styles.blockTitle}>Request Details</Text>
                    </View>

                    {selectedRequest.type === 'PABILI' && selectedRequest.details?.itemsList && (
                      <View style={styles.itemListBox}>
                        {selectedRequest.details.itemsList.map((item: any, i: number) => (
                          <View key={i} style={styles.itemRow}>
                            <Text style={styles.itemDot}>•</Text>
                            <Text style={styles.itemText}>{item.qty}x {item.name} {item.notes && `(${item.notes})`}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {selectedRequest.type === 'PASUGO' && (
                      <View style={styles.itemListBox}>
                        <Text style={styles.pasugoRowText}>
                          <Text style={styles.boldLabel}>Task: </Text>{selectedRequest.details?.taskDetails || 'Cash Errand'}
                        </Text>
                        <Text style={styles.pasugoRowText}>
                          <Text style={styles.boldLabel}>Errand Budget: </Text>₱{Number(selectedRequest.price).toFixed(2)}
                        </Text>
                      </View>
                    )}

                    {selectedRequest.type === 'PAHATOD' && (
                      <View style={styles.itemListBox}>
                        <Text style={styles.pasugoRowText}>
                          <Text style={styles.boldLabel}>Item: </Text>{selectedRequest.details?.itemDescription || 'Courier package'}
                        </Text>
                      </View>
                    )}

                    {selectedRequest.type === 'PAKUHA' && (
                      <View style={styles.itemListBox}>
                        <Text style={styles.pasugoRowText}>
                          <Text style={styles.boldLabel}>Item: </Text>{selectedRequest.details?.packageDetails || 'Package pickup'}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Addresses */}
                  <View style={styles.detailsBlock}>
                    <View style={styles.blockHeaderRow}>
                      <View style={[styles.blockHeaderIcon, { backgroundColor: '#DBEAFE' }]}>
                        <MapPin size={16} color="#2563EB" />
                      </View>
                      <Text style={styles.blockTitle}>Addresses</Text>
                    </View>

                    <View style={styles.addressContainer}>
                      <View style={styles.addressSubBlock}>
                        <Text style={styles.addressLabel}>PICKUP</Text>
                        <Text style={styles.addressValue}>{selectedRequest.pickupAddress}</Text>
                      </View>

                      <View style={styles.addressDivider} />

                      <View style={styles.addressSubBlock}>
                        <Text style={styles.addressLabel}>DROP-OFF</Text>
                        <Text style={styles.addressValue}>{selectedRequest.dropoffAddress}</Text>
                      </View>
                    </View>
                  </View>

                </ScrollView>

                {/* Modal Footer Actions */}
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setSelectedRequest(null)}
                  >
                    <Text style={styles.closeButtonText}>CLOSE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalAcceptButton}
                    onPress={() => handleAcceptJob(selectedRequest.id)}
                  >
                    <Text style={styles.modalAcceptButtonText}>ACCEPT JOB</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Availability Manager Modal */}
      <Modal
        visible={availabilityVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAvailabilityVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { marginTop: 'auto', paddingBottom: insets.bottom || 24, borderRadius: 32 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage Availability</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setAvailabilityVisible(false)}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>

              {/* Online Toggle */}
              <View style={styles.availabilitySettingCard}>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <View style={[styles.modalIconBox, { backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                      <Navigation size={20} color={isOnline ? "#10B981" : "#EF4444"} />
                    </View>
                    <View>
                      <Text style={styles.settingLabel}>Online Status</Text>
                      <Text style={styles.settingDesc}>{isOnline ? "Receiving requests" : "Currently offline"}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.toggleBtn, isOnline ? styles.toggleBtnActive : styles.toggleBtnInactive]}
                    onPress={() => setIsOnline(!isOnline)}
                  >
                    <View style={[styles.toggleKnob, isOnline ? styles.toggleKnobActive : styles.toggleKnobInactive]} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Auto Accept */}
              <View style={styles.availabilitySettingCard}>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <View style={[styles.modalIconBox, { backgroundColor: 'rgba(30, 58, 138, 0.1)' }]}>
                      <Zap size={20} color="#1E3A8A" />
                    </View>
                    <View>
                      <Text style={styles.settingLabel}>Auto-Accept</Text>
                      <Text style={styles.settingDesc}>Automatically accept incoming orders</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.toggleBtn, autoAccept ? styles.toggleBtnActive : styles.toggleBtnInactive]}
                    onPress={() => setAutoAccept(!autoAccept)}
                  >
                    <View style={[styles.toggleKnob, autoAccept ? styles.toggleKnobActive : styles.toggleKnobInactive]} />
                  </TouchableOpacity>
                </View>
              </View>

            </ScrollView>

            <TouchableOpacity
              style={styles.modalAcceptButton}
              onPress={() => setAvailabilityVisible(false)}
            >
              <Text style={styles.modalAcceptText}>DONE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
    backgroundColor: '#050A18',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    paddingBottom: 32,
    shadowColor: '#050A18',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
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
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    fontStyle: 'italic',
    letterSpacing: -0.5,
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D4AF37',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  notificationButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D4AF37',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  availabilityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  availabilityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pulseIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  bannerDesc: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 1,
  },
  manageButton: {
    backgroundColor: '#050A18',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  manageButtonText: {
    color: '#D4AF37',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  requestsSection: {
    marginBottom: 24,
  },
  requestsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  requestsList: {
    gap: 12,
  },
  requestCard: {
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
  cardTop: {
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
  cardIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pabiliIconBg: {
    backgroundColor: '#FFEDD5', // orange-100
  },
  pasugoIconBg: {
    backgroundColor: '#DBEAFE', // blue-100
  },
  pahatodIconBg: {
    backgroundColor: '#F3E8FF', // purple-100
  },
  cardServiceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  cardCustomerText: {
    fontSize: 12,
    color: '#6B7280',
  },
  paymentBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  paymentBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#D4AF37',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    gap: 8,
  },
  cardMetaRow: {
    flexDirection: 'row',
    gap: 14,
  },
  cardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardMetaText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  acceptButton: {
    backgroundColor: '#0047AB',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: '#0047AB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  weeklySummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#050A18',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 8,
  },
  weeklySummaryLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  weeklySummaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    width: '100%',
    maxHeight: height * 0.8,
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: '#050A18',
    padding: 24,
    gap: 8,
  },
  modalHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modalBadgeText: {
    color: '#D4AF37',
    fontSize: 10,
    fontWeight: '900',
  },
  modalPaymentText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  modalServiceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  modalMetaText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  modalBody: {
    padding: 24,
  },
  customerBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  customerInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customerIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 71, 171, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockSublabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 2,
  },
  blockLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  customerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsBlock: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  blockHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  blockHeaderIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  itemListBox: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 8,
  },
  itemDot: {
    color: '#4B5563',
  },
  itemText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  pasugoRowText: {
    fontSize: 13,
    color: '#4B5563',
  },
  boldLabel: {
    fontWeight: 'bold',
    color: '#1F2937',
  },
  addressContainer: {
    gap: 12,
  },
  addressSubBlock: {
    gap: 4,
  },
  addressLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  addressValue: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  addressDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  modalFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 24,
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#4B5563',
    fontWeight: '800',
    fontSize: 12,
  },
  modalAcceptButton: {
    flex: 2,
    backgroundColor: '#0047AB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAcceptButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  availabilitySettingCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  settingDesc: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  toggleBtn: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
  },
  toggleBtnActive: {
    backgroundColor: '#10B981',
  },
  toggleBtnInactive: {
    backgroundColor: '#E5E7EB',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  toggleKnobInactive: {
    alignSelf: 'flex-start',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  modalAcceptText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  emptyRequestsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyRequestsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  emptyRequestsDesc: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 12,
  },
  activeSection: {
    marginBottom: 20,
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  activeSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#050A18',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
  },
  activeCard: {
    backgroundColor: '#050A18',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
  },
  activeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  activeIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(212,175,55,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.25)',
  },
  activeCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  activeCardSub: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  activePriceBadge: {
    backgroundColor: 'rgba(212,175,55,0.12)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
  },
  activePriceText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D4AF37',
  },
  activeCardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 12,
  },
  activeCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeStatusWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeStatusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  activeStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  viewMissionButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  viewMissionButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#050A18',
  },
  directRequestBadge: {
    backgroundColor: '#D4AF37',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  directRequestText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#050A18',
  },
});
