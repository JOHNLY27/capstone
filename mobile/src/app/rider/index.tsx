import React, { useState } from 'react';
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
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, DollarSign, Clock, Bell, TrendingUp, Navigation, Package, ShoppingCart, Send, Info, User, Phone, MessageSquare, Check, X, Zap } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function RiderDashboardScreen() {
  const router = useRouter();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [availabilityVisible, setAvailabilityVisible] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);
  const insets = useSafeAreaInsets();

  const nearbyRequests = [
    {
      id: "1",
      type: "Pabili",
      service: "Pabili - Jollibee",
      customer: "Juan Dela Cruz",
      distance: "0.5 km",
      payment: "₱100",
      time: "Just now",
      details: {
        items: ["2x Chickenjoy with Rice", "1x Jolly Spaghetti", "2x Peach Mango Pie", "2x Large Coke"],
        pickupAddress: "Jollibee Drive-Thru, Gaisano Mall",
        deliveryAddress: "Purok 4, Villa Kananga, Butuan City",
        notes: "Please ask for extra gravy and ensure the food is hot. Cash on delivery.",
        contact: "09123456789"
      }
    },
    {
      id: "2",
      type: "Pasugo",
      service: "Pasugo - Cash In",
      customer: "Maria Santos",
      distance: "1.2 km",
      payment: "₱80",
      time: "2 min ago",
      details: {
        action: "GCash Cash-In / Load",
        amount: "₱1,000",
        pickupAddress: "7-Eleven Libertad (Near Mercury Drug)",
        deliveryAddress: "Montalban St., Butuan City (Green Gate)",
        notes: "The shop is just beside the entrance. Please call when you arrive.",
        contact: "09987654321"
      }
    },
    {
      id: "3",
      type: "Pahatod",
      service: "Pahatod - Documents",
      customer: "Pedro Cruz",
      distance: "2.0 km",
      payment: "₱120",
      time: "5 min ago",
      details: {
        item: "Large Brown Envelope (Sensitive Documents)",
        pickupAddress: "Agusan del Norte Provincial Capitol (Lobby)",
        deliveryAddress: "City Hall Annex, Butuan City",
        notes: "Look for Mr. Tan at the records office. Please handle with care - do not fold.",
        contact: "09334455667"
      }
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
                  <Text style={styles.greetingText}>Hello, Mark!</Text>
                  <Text style={styles.onlineText}>Commander Online</Text>
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
                <Text style={styles.statValue}>₱850</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <TrendingUp size={16} color="#D4AF37" />
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
                <Text style={styles.statValue}>8</Text>
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

          {/* Nearby Requests Section */}
          <View style={styles.requestsSection}>
            <View style={styles.requestsHeader}>
              <Text style={styles.sectionTitle}>Nearby Requests</Text>
              <Clock size={20} color="#9CA3AF" />
            </View>

            {/* List of Requests */}
            <View style={styles.requestsList}>
              {nearbyRequests.map((request) => {
                const isPabili = request.type === 'Pabili';
                const isPasugo = request.type === 'Pasugo';

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
                        <View>
                          <Text style={styles.cardServiceTitle}>{request.service}</Text>
                          <Text style={styles.cardCustomerText}>Customer: {request.customer}</Text>
                        </View>
                      </View>

                      <View style={styles.paymentBadge}>
                        <Text style={styles.paymentBadgeText}>{request.payment}</Text>
                      </View>
                    </View>

                    <View style={styles.cardBottom}>
                      <View style={styles.cardMetaRow}>
                        <View style={styles.cardMetaItem}>
                          <MapPin size={14} color="#9CA3AF" />
                          <Text style={styles.cardMetaText}>{request.distance}</Text>
                        </View>
                        <View style={styles.cardMetaItem}>
                          <Clock size={14} color="#9CA3AF" />
                          <Text style={styles.cardMetaText}>{request.time}</Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.acceptButton}
                        activeOpacity={0.8}
                        onPress={() => router.push(`/rider/delivery/${request.id}` as any)}
                      >
                        <Text style={styles.acceptButtonText}>ACCEPT</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Weekly Summary Banner */}
          <TouchableOpacity
            style={styles.weeklySummaryCard}
            activeOpacity={0.9}
            onPress={() => router.push('/rider/earnings')}
          >
            <View>
              <Text style={styles.weeklySummaryLabel}>WEEKLY EARNINGS</Text>
              <Text style={styles.weeklySummaryValue}>₱4,250</Text>
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
                      <Text style={styles.modalBadgeText}>{selectedRequest.type.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.modalPaymentText}>{selectedRequest.payment}</Text>
                  </View>
                  <Text style={styles.modalServiceTitle}>{selectedRequest.service}</Text>
                  <View style={styles.modalMetaRow}>
                    <Clock size={14} color="#9CA3AF" />
                    <Text style={styles.modalMetaText}>Posted {selectedRequest.time} • Review details</Text>
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
                        <Text style={styles.blockLabel}>{selectedRequest.customer}</Text>
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

                    {selectedRequest.type === 'Pabili' && (
                      <View style={styles.itemListBox}>
                        {selectedRequest.details.items.map((item: string, i: number) => (
                          <View key={i} style={styles.itemRow}>
                            <Text style={styles.itemDot}>•</Text>
                            <Text style={styles.itemText}>{item}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {selectedRequest.type === 'Pasugo' && (
                      <View style={styles.itemListBox}>
                        <Text style={styles.pasugoRowText}>
                          <Text style={styles.boldLabel}>Action: </Text>{selectedRequest.details.action}
                        </Text>
                        <Text style={styles.pasugoRowText}>
                          <Text style={styles.boldLabel}>Amount: </Text>{selectedRequest.details.amount}
                        </Text>
                      </View>
                    )}

                    {selectedRequest.type === 'Pahatod' && (
                      <View style={styles.itemListBox}>
                        <Text style={styles.pasugoRowText}>
                          <Text style={styles.boldLabel}>Item: </Text>{selectedRequest.details.item}
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
                        <Text style={styles.addressValue}>{selectedRequest.details.pickupAddress}</Text>
                      </View>

                      <View style={styles.addressDivider} />

                      <View style={styles.addressSubBlock}>
                        <Text style={styles.addressLabel}>DROP-OFF</Text>
                        <Text style={styles.addressValue}>{selectedRequest.details.deliveryAddress}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Customer Notes */}
                  <View style={styles.notesBlock}>
                    <Text style={styles.notesLabel}>CUSTOMER NOTES</Text>
                    <Text style={styles.notesValue}>"{selectedRequest.details.notes}"</Text>
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
                    onPress={() => {
                      setSelectedRequest(null);
                      router.push(`/rider/delivery/${selectedRequest.id}` as any);
                    }}
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
    fontSize: 22,
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
    backgroundColor: '#D4AF37',
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
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  cardCustomerText: {
    fontSize: 13,
    color: '#6B7280',
  },
  paymentBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  paymentBadgeText: {
    fontSize: 13,
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
    fontSize: 12,
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
    fontSize: 24,
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
  },
  modalHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalBadge: {
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  modalBadgeText: {
    color: '#050A18',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  modalPaymentText: {
    color: '#D4AF37',
    fontSize: 24,
    fontWeight: '900',
  },
  modalServiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontStyle: 'italic',
    marginBottom: 6,
  },
  modalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalMetaText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  modalBody: {
    padding: 24,
    gap: 20,
  },
  customerBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  customerInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customerIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockSublabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  blockLabel: {
    fontSize: 15,
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
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsBlock: {
    marginBottom: 20,
  },
  blockHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  blockHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  itemListBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemDot: {
    color: '#D4AF37',
    fontWeight: 'bold',
    fontSize: 16,
  },
  itemText: {
    color: '#4B5563',
    fontSize: 14,
  },
  pasugoRowText: {
    color: '#4B5563',
    fontSize: 14,
    marginBottom: 4,
  },
  boldLabel: {
    fontWeight: '700',
    color: '#1F2937',
  },
  addressContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 16,
  },
  addressSubBlock: {
    gap: 4,
  },
  addressLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#9CA3AF',
    letterSpacing: 1.5,
  },
  addressValue: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  addressDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  notesBlock: {
    backgroundColor: '#FEF9C3', // yellow-100
    borderWidth: 1,
    borderColor: '#FEF08A', // yellow-200
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  notesLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#854D0E', // yellow-800
    letterSpacing: 1,
    marginBottom: 4,
  },
  notesValue: {
    fontSize: 14,
    color: '#713F12',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButtonText: {
    color: '#4B5563',
    fontSize: 15,
    fontWeight: '700',
  },
  acceptButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#1E3A8A',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  availabilitySettingCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  modalIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
  },
  settingDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  toggleBtn: {
    width: 52,
    height: 32,
    borderRadius: 16,
    padding: 2,
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#1E3A8A',
  },
  toggleBtnInactive: {
    backgroundColor: '#E5E7EB',
  },
  toggleKnob: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleKnobActive: {
    transform: [{ translateX: 20 }],
  },
  toggleKnobInactive: {
    transform: [{ translateX: 0 }],
  },
  modalAcceptButton: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  modalAcceptText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  closeButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
