import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { DollarSign, TrendingUp, Calendar, Download, ChevronLeft, ShieldCheck, AlertTriangle } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authStore } from '../../utils/auth-store';
import { API_URL } from '../../constants/api';

type PeriodType = 'daily' | 'weekly' | 'monthly';

export default function RiderEarningsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<PeriodType>('daily');

  const [balance, setBalance] = useState('0.00');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [refCode, setRefCode] = useState('');
  
  const [systemSettings, setSystemSettings] = useState<any>({
    gcashNumber: '0912 - 345 - 6789',
    gcashQrCode: ''
  });

  const [periodStats, setPeriodStats] = useState({
    daily: { amount: "₱0", orders: 0, avg: "₱0" },
    weekly: { amount: "₱0", orders: 0, avg: "₱0" },
    monthly: { amount: "₱0", orders: 0, avg: "₱0" },
  });

  const calculatePeriodStats = (completedOrders: any[]) => {
    const now = new Date();
    
    // Start of intervals in local time
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Start of current calendar week (Sunday start)
    const currentDay = now.getDay();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - currentDay);
    
    // Start of current calendar month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let stats = {
      daily: { sum: 0, count: 0 },
      weekly: { sum: 0, count: 0 },
      monthly: { sum: 0, count: 0 },
    };

    completedOrders.forEach(order => {
      // Use updatedAt because it represents the completion date (when it was actually earned)
      const orderDate = new Date(order.updatedAt || order.createdAt);
      const deliveryFee = parseFloat(order.deliveryFee || '0');

      // Daily
      if (orderDate >= startOfToday) {
        stats.daily.sum += deliveryFee;
        stats.daily.count += 1;
      }
      
      // Weekly
      if (orderDate >= startOfWeek) {
        stats.weekly.sum += deliveryFee;
        stats.weekly.count += 1;
      }

      // Monthly
      if (orderDate >= startOfMonth) {
        stats.monthly.sum += deliveryFee;
        stats.monthly.count += 1;
      }
    });

    const formatStat = (sum: number, count: number) => {
      const avg = count > 0 ? Math.round(sum / count) : 0;
      return {
        amount: `₱${sum.toLocaleString()}`,
        orders: count,
        avg: `₱${avg.toLocaleString()}`
      };
    };

    setPeriodStats({
      daily: formatStat(stats.daily.sum, stats.daily.count),
      weekly: formatStat(stats.weekly.sum, stats.weekly.count),
      monthly: formatStat(stats.monthly.sum, stats.monthly.count),
    });
  };

  const fetchSubscriptionStatus = async () => {
    const token = authStore.getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/auth/weekly-fee-status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSubscriptionInfo({
          weeklyFeeStatus: data.weeklyFeeStatus,
          feeDueDate: data.feeDueDate,
          pendingTicket: data.pendingTicket
        });
      }
    } catch (e) {
      console.error('Error fetching subscription status:', e);
    }
  };

  const fetchSystemSettings = async () => {
    const token = authStore.getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/auth/system-settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSystemSettings({
          gcashNumber: data.data.gcashNumber || '0912 - 345 - 6789',
          gcashQrCode: data.data.gcashQrCode || ''
        });
      }
    } catch (e) {
      console.error('Error fetching system settings:', e);
    }
  };

  const handleSettleSubmit = async () => {
    if (refCode.trim().length !== 13) return;
    setIsActionLoading(true);
    const token = authStore.getToken();
    try {
      const response = await fetch(`${API_URL}/api/auth/settle-weekly-fee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ referenceCode: refCode.trim() })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        Alert.alert('Remittance Logged', 'Your GCash reference has been submitted! Dues will be audited shortly by the Administrator.');
        setIsSettleModalOpen(false);
        setRefCode('');
        fetchSubscriptionStatus();
        fetchEarningsData();
      } else {
        Alert.alert('Error', data.error || 'Failed to submit settlement details.');
      }
    } catch (e) {
      console.error('Error settling dues:', e);
      Alert.alert('Error', 'Unable to connect to server.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const fetchEarningsData = async () => {
    const token = authStore.getToken();
    if (!token) return;

    try {
      // 1. Fetch Wallet details (balance and transaction history)
      const walletRes = await fetch(`${API_URL}/api/wallet`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const walletData = await walletRes.json();

      let balanceVal = '0.00';
      let txList: any[] = [];

      if (walletRes.ok && walletData.success) {
        balanceVal = parseFloat(walletData.data.walletBalance || '0').toFixed(2);
        txList = walletData.data.transactions || [];
        setBalance(balanceVal);
        setTransactions(txList);
        // Sync authStore balance too
        authStore.updateUser({ walletBalance: walletData.data.walletBalance });
      }

      // 2. Fetch Rider orders
      const ordersRes = await fetch(`${API_URL}/api/orders/rider`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const ordersData = await ordersRes.json();

      if (ordersRes.ok && ordersData.success) {
        const allOrders = ordersData.data.orders || [];
        setOrders(allOrders);
        const completed = allOrders.filter((o: any) => o.status === 'COMPLETED');
        calculatePeriodStats(completed);
      }
    } catch (err) {
      console.error('Error fetching rider earnings data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEarningsData();
    fetchSubscriptionStatus();
    fetchSystemSettings();
  }, []);

  const currentEarnings = periodStats[period];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Top Gradient Header */}
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
            <Text style={styles.headerTitle}>Earnings</Text>
            <DollarSign size={20} color="#D4AF37" />
          </View>

          {/* Interval Filters */}
          <View style={styles.filterTabs}>
            {(['daily', 'weekly', 'monthly'] as PeriodType[]).map((tab) => {
              const isActive = period === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.filterTab, isActive && styles.activeFilterTab]}
                  activeOpacity={0.8}
                  onPress={() => setPeriod(tab)}
                >
                  <Text style={[styles.filterTabText, isActive && styles.activeFilterTabText]}>
                    {tab.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Dynamic Total Balance display */}
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>PERIOD EARNINGS</Text>
            <Text style={styles.balanceValue}>{currentEarnings.amount}</Text>
          </View>

          {/* Quick Metrics Grid */}
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>COMPLETED ORDERS</Text>
              <Text style={styles.metricValue}>{currentEarnings.orders}</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>AVG PER TRIP</Text>
              <Text style={styles.metricValue}>{currentEarnings.avg}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Main content body */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#050A18" />
            <Text style={styles.loaderText}>Calculating Earnings...</Text>
          </View>
        ) : (
          <View style={styles.body}>
             {/* Weekly Platform Subscription Dues Card */}
             {subscriptionInfo && (
               <View style={[
                 styles.subsCard,
                 subscriptionInfo.weeklyFeeStatus === 'OVERDUE' && styles.subsCardOverdue,
                 subscriptionInfo.weeklyFeeStatus === 'DUE' && styles.subsCardDue
               ]}>
                 <View style={styles.subsHeaderRow}>
                   <View style={styles.subsHeaderLeft}>
                     <ShieldCheck size={20} color={subscriptionInfo.weeklyFeeStatus === 'PAID' ? '#10B981' : '#D4AF37'} />
                     <Text style={styles.subsStatusTitle}>Weekly Admin Fee</Text>
                   </View>
                   <View style={[
                     styles.subsBadge,
                     subscriptionInfo.weeklyFeeStatus === 'PAID' && styles.subsBadgePaid,
                     subscriptionInfo.weeklyFeeStatus === 'DUE' && styles.subsBadgeDue,
                     subscriptionInfo.weeklyFeeStatus === 'OVERDUE' && styles.subsBadgeOverdue
                   ]}>
                     <Text style={[
                       styles.subsBadgeText,
                       subscriptionInfo.weeklyFeeStatus === 'PAID' && { color: '#10B981' },
                       subscriptionInfo.weeklyFeeStatus === 'DUE' && { color: '#D4AF37' },
                       subscriptionInfo.weeklyFeeStatus === 'OVERDUE' && { color: '#EF4444' }
                     ]}>
                       {subscriptionInfo.weeklyFeeStatus}
                     </Text>
                   </View>
                 </View>
                 
                 <Text style={styles.subsDueDateText}>
                   {subscriptionInfo.weeklyFeeStatus === 'PAID' 
                     ? `Subscription Active until: ${new Date(subscriptionInfo.feeDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                     : `Platform Fee Dues (₱50.00) are due by: ${new Date(subscriptionInfo.feeDueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                   }
                 </Text>

                 {subscriptionInfo.pendingTicket ? (
                   <View style={styles.pendingTicketRow}>
                     <ActivityIndicator size="small" color="#D4AF37" style={{ marginRight: 6 }} />
                     <Text style={styles.pendingTicketText}>
                       Ref: #{subscriptionInfo.pendingTicket.referenceCode} is pending Admin verification.
                     </Text>
                   </View>
                 ) : (
                   subscriptionInfo.weeklyFeeStatus !== 'PAID' && (
                     <TouchableOpacity 
                       style={styles.settleButton}
                       activeOpacity={0.8}
                       onPress={() => setIsSettleModalOpen(true)}
                     >
                       <Text style={styles.settleButtonText}>Settle ₱50.00 Admin Fee</Text>
                     </TouchableOpacity>
                   )
                 )}
               </View>
             )}

             {/* Cash Settlement Notice Card */}
             <View style={styles.withdrawCard}>
               <View style={styles.withdrawLeft}>
                 <View style={styles.withdrawIconWrapper}>
                   <TrendingUp size={22} color="#D4AF37" />
                 </View>
                 <View style={{ flex: 1 }}>
                   <Text style={styles.withdrawTitle}>COD Settlement</Text>
                   <Text style={[styles.withdrawDesc, { color: '#E5E7EB', fontSize: 11, lineHeight: 16, marginTop: 4 }]}>
                     All delivery fees and errand totals are physically collected in cash directly from customers. No digital wallet cash-outs required.
                   </Text>
                 </View>
               </View>
             </View>

            {/* Recent Earnings List */}
            <View style={styles.recentSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Earnings</Text>
                <TouchableOpacity 
                  style={styles.statementButton} 
                  activeOpacity={0.7}
                  onPress={fetchEarningsData}
                >
                  <Download size={14} color="#0047AB" />
                  <Text style={styles.statementText}>REFRESH</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.earningsList}>
                {transactions.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Calendar size={32} color="#9CA3AF" style={{ marginBottom: 8 }} />
                    <Text style={styles.emptyText}>No Transactions Found</Text>
                    <Text style={styles.emptyDesc}>Your deliveries and cash out history will appear here.</Text>
                  </View>
                ) : (
                  transactions.map((tx) => {
                    const isCredit = tx.type === 'CREDIT' || tx.type === 'TOPUP';
                    const txFormattedDate = new Date(tx.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <View key={tx.id} style={styles.earningCard}>
                        <View style={styles.earningLeft}>
                          <View style={[styles.earningIconWrapper, !isCredit && styles.earningDebitIconWrapper]}>
                            <DollarSign size={18} color={isCredit ? '#D4AF37' : '#EF4444'} />
                          </View>
                          <View style={{ flex: 1, paddingRight: 8 }}>
                            <Text style={styles.earningService} numberOfLines={1}>{tx.description}</Text>
                            <View style={styles.timeRow}>
                              <Calendar size={12} color="#9CA3AF" />
                              <Text style={styles.earningTime}>{txFormattedDate}</Text>
                            </View>
                          </View>
                        </View>
                        <Text style={[styles.earningAmount, !isCredit && styles.earningDebitAmount]}>
                          {isCredit ? '+' : '-'}₱{parseFloat(tx.amount || '0').toFixed(2)}
                        </Text>
                      </View>
                    );
                  })
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Settle platform fee Modal */}
      <Modal
        visible={isSettleModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsSettleModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Settle Platform Fee</Text>
              <Text style={styles.modalSubtitle}>
                Remit exactly <Text style={{ fontWeight: '900', color: '#D4AF37' }}>₱50.00</Text> weekly fee to system administrator via GCash:
              </Text>
            </View>

            {/* GCash Details */}
            <View style={styles.qrCard}>
              {/* Official QR Code or Fallback Simulated QR Code Visual */}
              {systemSettings.gcashQrCode ? (
                <Image 
                  source={{ uri: systemSettings.gcashQrCode }} 
                  style={styles.actualQrImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.simulatedQr}>
                  <View style={styles.qrHeader}>
                    <Text style={styles.qrHeaderText}>FETCHMEUP ADMIN</Text>
                  </View>
                  <View style={styles.qrPatternBox}>
                    {/* Grid simulated pattern blocks */}
                    <View style={[styles.qrBlock, { top: 12, left: 12 }]} />
                    <View style={[styles.qrBlock, { top: 12, right: 12 }]} />
                    <View style={[styles.qrBlock, { bottom: 12, left: 12 }]} />
                    <View style={[styles.qrBlock, { bottom: 30, right: 30, width: 24, height: 24 }]} />
                    <Text style={styles.qrLogo}>GCash</Text>
                  </View>
                  <Text style={styles.qrFooterText}>SCAN TO PAY</Text>
                </View>
              )}
              
              <Text style={styles.remitPhoneTitle}>GCash Mobile Remittance No.</Text>
              <Text style={styles.remitPhone}>{systemSettings.gcashNumber}</Text>
              <Text style={styles.remitDesc}>
                Scan the QR code above OR manually transfer exactly ₱50.00 to the mobile number listed above using your personal GCash account.
              </Text>
            </View>

            {/* Reference input group */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>GCash 13-Digit Reference Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 5012345678901"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={13}
                value={refCode}
                onChangeText={setRefCode}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelBtn}
                onPress={() => {
                  setIsSettleModalOpen(false);
                  setRefCode('');
                }}
                disabled={isActionLoading}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.modalSubmitBtn, 
                  (refCode.trim().length !== 13 || isActionLoading) && styles.modalSubmitBtnDisabled
                ]}
                onPress={handleSettleSubmit}
                disabled={refCode.trim().length !== 13 || isActionLoading}
              >
                {isActionLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>Submit Dues</Text>
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
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#050A18',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 24,
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
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
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
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeFilterTab: {
    backgroundColor: '#D4AF37',
  },
  filterTabText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  activeFilterTabText: {
    color: '#050A18',
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 2,
    marginBottom: 6,
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    fontStyle: 'italic',
    letterSpacing: -1,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
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
  withdrawCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#050A18',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 28,
    shadowColor: '#0047AB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  withdrawLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  withdrawIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  withdrawTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  withdrawDesc: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
    marginTop: 2,
  },
  cashOutButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cashOutText: {
    color: '#050A18',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  recentSection: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  statementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statementText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0047AB',
    letterSpacing: 1,
  },
  earningsList: {
    gap: 12,
  },
  earningCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  earningLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  earningIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  earningDebitIconWrapper: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  earningService: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  earningTime: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  earningAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0047AB',
    fontStyle: 'italic',
  },
  earningDebitAmount: {
    color: '#EF4444',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 24,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
  },
  subsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 3,
  },
  subsCardDue: {
    borderColor: 'rgba(212, 175, 55, 0.5)',
    backgroundColor: 'rgba(212, 175, 55, 0.02)',
  },
  subsCardOverdue: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.02)',
  },
  subsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  subsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subsStatusTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subsBadge: {
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
  },
  subsBadgePaid: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  subsBadgeDue: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  subsBadgeOverdue: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  subsBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  subsDueDateText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 14,
    lineHeight: 18,
  },
  pendingTicketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pendingTicketText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '600',
  },
  settleButton: {
    backgroundColor: '#050A18',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    shadowColor: '#050A18',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  settleButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    gap: 16,
    maxHeight: '90%',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1F2937',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  qrCard: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  simulatedQr: {
    width: 140,
    height: 140,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#050A18',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  actualQrImage: {
    width: 140,
    height: 140,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#050A18',
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  qrHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#050A18',
    paddingVertical: 3,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    alignItems: 'center',
  },
  qrHeaderText: {
    color: '#D4AF37',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  qrPatternBox: {
    width: 110,
    height: 110,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  qrBlock: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: '#050A18',
    borderRadius: 3,
  },
  qrLogo: {
    fontSize: 11,
    fontWeight: '950',
    color: '#0047AB',
    fontStyle: 'italic',
  },
  qrFooterText: {
    position: 'absolute',
    bottom: 4,
    fontSize: 7,
    fontWeight: '950',
    color: '#050A18',
    letterSpacing: 1.5,
  },
  remitPhoneTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  remitPhone: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0047AB',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  remitDesc: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 14,
    marginTop: 8,
    paddingHorizontal: 12,
    fontWeight: '500',
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
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
    color: '#374151',
    fontWeight: 'bold',
    fontSize: 13,
  },
  modalSubmitBtn: {
    flex: 2,
    backgroundColor: '#050A18',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  modalSubmitBtnDisabled: {
    backgroundColor: '#9CA3AF',
    borderColor: '#9CA3AF',
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
