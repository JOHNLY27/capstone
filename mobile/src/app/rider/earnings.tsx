import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { DollarSign, TrendingUp, Calendar, Download, ChevronLeft } from 'lucide-react-native';
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
  }, []);

  const handleCashOut = () => {
    const balanceNum = parseFloat(balance);
    if (balanceNum <= 0) {
      Alert.alert('Cash Out Unavailable', 'Your digital wallet balance is ₱0.00. You must have completed online payment orders to withdraw.');
      return;
    }

    Alert.alert(
      'Cash Out Channel',
      'Select your payout destination:',
      [
        {
          text: 'GCash',
          onPress: () => promptWithdrawalAmount('GCash'),
        },
        {
          text: 'Maya',
          onPress: () => promptWithdrawalAmount('Maya'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        }
      ]
    );
  };

  const promptWithdrawalAmount = (method: 'GCash' | 'Maya') => {
    Alert.prompt(
      `Withdraw to ${method}`,
      `Enter withdrawal amount in PHP (Available: ₱${parseFloat(balance).toLocaleString()}):`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Withdraw Funds',
          onPress: async (amountStr) => {
            const amount = parseFloat(amountStr || '0');
            if (isNaN(amount) || amount <= 0) {
              Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
              return;
            }

            const balanceNum = parseFloat(balance);
            if (amount > balanceNum) {
              Alert.alert('Insufficient Funds', `You cannot withdraw more than your available balance of ₱${balanceNum.toFixed(2)}.`);
              return;
            }

            setIsActionLoading(true);
            try {
              const token = authStore.getToken();
              const response = await fetch(`${API_URL}/api/wallet/withdraw`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  amount,
                  method
                })
              });

              const resData = await response.json();

              if (!response.ok) {
                throw new Error(resData.error || 'Failed to process withdrawal.');
              }

              Alert.alert(
                'Withdrawal Successful', 
                `₱${amount.toFixed(2)} has been successfully transferred to your ${method} account!`
              );
              fetchEarningsData();
            } catch (err: any) {
              Alert.alert('Cash Out Failed', err.message || 'Server connection error.');
            } finally {
              setIsActionLoading(false);
            }
          },
        },
      ],
      'plain-text',
      '',
      'number-pad'
    );
  };

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
            {/* Withdraw Card */}
            <View style={styles.withdrawCard}>
              <View style={styles.withdrawLeft}>
                <View style={styles.withdrawIconWrapper}>
                  <TrendingUp size={22} color="#D4AF37" />
                </View>
                <View>
                  <Text style={styles.withdrawTitle}>Withdraw Funds</Text>
                  <Text style={styles.withdrawDesc}>Available: ₱{parseFloat(balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.cashOutButton}
                activeOpacity={0.9}
                onPress={handleCashOut}
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <ActivityIndicator color="#050A18" size="small" />
                ) : (
                  <Text style={styles.cashOutText}>CASH OUT</Text>
                )}
              </TouchableOpacity>
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
});
