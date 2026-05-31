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
import { Package, CheckCircle, Calendar, ChevronLeft, ShoppingCart, Send } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authStore } from '../../utils/auth-store';
import { API_URL } from '../../constants/api';

export default function RiderHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [history, setHistory] = useState<any[]>([]);
  const [lifetimeCount, setLifetimeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRiderHistory = async () => {
    const token = authStore.getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/orders/rider`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        const completedMissions = resData.data.orders.filter(
          (order: any) => order.status === 'COMPLETED'
        );
        
        // Sort chronologically descending (newest first)
        completedMissions.sort(
          (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setHistory(completedMissions);
        setLifetimeCount(completedMissions.length);
      } else {
        Alert.alert('Error', resData.error || 'Failed to fetch work history.');
      }
    } catch (err) {
      console.error('Error fetching rider history:', err);
      Alert.alert('Error', 'Unable to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRiderHistory();
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
        <Text style={styles.loadingText}>Syncing mission history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Top Banner Header */}
      <View style={[styles.header, { paddingTop: insets.top || 20 }]}>
        <View style={styles.headerContent}>
          <View style={styles.navRow}>
            <TouchableOpacity 
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={() => router.push('/rider/' as any)}
            >
              <ChevronLeft size={20} color="#D4AF37" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Work History</Text>
            <CheckCircle size={20} color="#D4AF37" />
          </View>
          <Text style={styles.headerSubtitle}>Completed Errand Missions</Text>
        </View>
      </View>

      {/* History content list */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.body}>
          {/* Lifetime statistics card */}
          <View style={styles.achievementCard}>
            <View style={styles.achievementLeft}>
              <Text style={styles.achievementLabel}>LIFETIME ACHIEVEMENT</Text>
              <View style={styles.tripsRow}>
                <Text style={styles.tripsCount}>{lifetimeCount}</Text>
                <Text style={styles.tripsLabel}>trips completed</Text>
              </View>
            </View>
            
            <View style={styles.achievementIconWrapper}>
              <CheckCircle size={32} color="#D4AF37" />
            </View>
          </View>

          {/* History entries */}
          {history.length === 0 ? (
            <View style={styles.emptyCard}>
              <Package size={48} color="#9CA3AF" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyTitle}>No completed errands yet</Text>
              <Text style={styles.emptyDesc}>
                Deliver some active missions to Customer coordinates to register your success logs!
              </Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {history.map((item) => {
                const details = item.details || {};
                const isPabili = item.type === 'PABILI';
                const isPasugo = item.type === 'PASUGO';
                const isPakuha = item.type === 'PAKUHA';
                const isRide = item.type === 'PAHATOD' && details.rideService === true;

                return (
                  <View key={item.id} style={styles.historyCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.cardHeaderLeft}>
                        <View style={[
                          styles.iconWrapper,
                          isPabili && styles.pabiliIconBg,
                          isPasugo && styles.pasugoIconBg,
                          isPakuha && styles.pakuhaIconBg,
                          isRide && styles.rideIconBg
                        ]}>
                          {isPabili ? <ShoppingCart size={18} color="#EA580C" /> :
                           isPasugo ? <Send size={18} color="#2563EB" /> :
                           <Package size={18} color="#9333EA" />}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.historyService}>{getServiceLabel(item)}</Text>
                          <Text style={styles.historyCustomer}>Customer: {item.customer?.name || 'FetchMeUp Client'}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.payoutBadge}>
                        <Text style={styles.payoutText}>₱{parseFloat(item.deliveryFee || '0').toFixed(2)}</Text>
                      </View>
                    </View>

                    <View style={styles.cardFooter}>
                      <View style={styles.timeDetails}>
                        <Calendar size={12} color="#9CA3AF" />
                        <Text style={styles.timeText}>{formatDate(item.createdAt)}</Text>
                      </View>
                      
                      <Text style={styles.successTag}>SUCCESS</Text>
                    </View>
                  </View>
                );
              })}
            </View>
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
    color: '#4B5563',
    fontWeight: '600',
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
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
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
    marginTop: 4,
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
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#050A18',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 28,
    shadowColor: '#0047AB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  achievementLeft: {
    flex: 1,
  },
  achievementLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  tripsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  tripsCount: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    fontStyle: 'italic',
  },
  tripsLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
  },
  achievementIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  listContainer: {
    gap: 16,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 16,
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
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#050A18',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
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
  historyService: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  historyCustomer: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  payoutBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  payoutText: {
    color: '#050A18',
    fontSize: 13,
    fontWeight: '900',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  timeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  successTag: {
    fontSize: 9,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 0.5,
  },
});
