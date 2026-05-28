import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { DollarSign, TrendingUp, Calendar, Download, ChevronLeft } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type PeriodType = 'daily' | 'weekly' | 'monthly';

export default function RiderEarningsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<PeriodType>('daily');

  const earnings = {
    daily: { amount: "₱850", orders: 8, avg: "₱106" },
    weekly: { amount: "₱4,250", orders: 42, avg: "₱101" },
    monthly: { amount: "₱18,500", orders: 185, avg: "₱100" },
  };

  const recentEarnings = [
    { id: "1", service: "Pabili - Jollibee", time: "2:30 PM", amount: "₱100" },
    { id: "2", service: "Pasugo - Cash In", time: "1:15 PM", amount: "₱80" },
    { id: "3", service: "Pahatod - Documents", time: "12:45 PM", amount: "₱120" },
    { id: "4", service: "Pabili - Groceries", time: "11:30 AM", amount: "₱150" },
    { id: "5", service: "Pakuha - Package", time: "10:00 AM", amount: "₱90" },
  ];

  const currentEarnings = earnings[period];

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
            <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
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
        <View style={styles.body}>
          {/* Withdraw Card */}
          <View style={styles.withdrawCard}>
            <View style={styles.withdrawLeft}>
              <View style={styles.withdrawIconWrapper}>
                <TrendingUp size={22} color="#D4AF37" />
              </View>
              <View>
                <Text style={styles.withdrawTitle}>Withdraw Funds</Text>
                <Text style={styles.withdrawDesc}>Available: ₱18,500</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.cashOutButton}
              activeOpacity={0.9}
            >
              <Text style={styles.cashOutText}>CASH OUT</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Earnings List */}
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Earnings</Text>
              <TouchableOpacity style={styles.statementButton} activeOpacity={0.7}>
                <Download size={14} color="#0047AB" />
                <Text style={styles.statementText}>STATEMENT</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.earningsList}>
              {recentEarnings.map((earning) => (
                <View key={earning.id} style={styles.earningCard}>
                  <View style={styles.earningLeft}>
                    <View style={styles.earningIconWrapper}>
                      <DollarSign size={18} color="#D4AF37" />
                    </View>
                    <View>
                      <Text style={styles.earningService}>{earning.service}</Text>
                      <View style={styles.timeRow}>
                        <Calendar size={12} color="#9CA3AF" />
                        <Text style={styles.earningTime}>{earning.time}</Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.earningAmount}>{earning.amount}</Text>
                </View>
              ))}
            </View>
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
});
