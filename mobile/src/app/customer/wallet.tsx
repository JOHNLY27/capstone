import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Platform,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, CreditCard, ArrowLeft } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function CustomerWalletScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const transactions = [
    { id: "1", type: "debit", amount: "₱350", description: "Pabili - Jollibee", date: "May 7, 2026" },
    { id: "2", type: "credit", amount: "₱500", description: "Top Up", date: "May 6, 2026" },
    { id: "3", type: "debit", amount: "₱150", description: "Pahatod Service", date: "May 5, 2026" },
    { id: "4", type: "debit", amount: "₱200", description: "Pakuha Service", date: "May 4, 2026" },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Premium Gradient Top Background */}
      <View style={[styles.walletHeader, { paddingTop: insets.top || 20 }]}>
        <View style={styles.headerContent}>
          <View style={styles.navRow}>
            <TouchableOpacity 
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={() => router.push('/customer/' as any)}
            >
              <ArrowLeft size={20} color="#D4AF37" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Digital Wallet</Text>
            <Wallet size={20} color="#D4AF37" />
          </View>

            {/* Glowing Balance Card */}
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceAmount}>₱1,250</Text>
                <Text style={styles.balanceCents}>.00</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.topUpButton}
                activeOpacity={0.9}
              >
                <Plus size={18} color="#050A18" style={styles.buttonIcon} />
                <Text style={styles.topUpText}>TOP UP CREDITS</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

      {/* Main Content Area */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.body}>
          {/* Spent vs Added Quick Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <ArrowUpRight size={16} color="#EF4444" />
                <Text style={styles.statLabel}>TOTAL SPENT</Text>
              </View>
              <Text style={styles.statValue}>₱1,200</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <ArrowDownLeft size={16} color="#0047AB" />
                <Text style={styles.statLabel}>TOTAL ADDED</Text>
              </View>
              <Text style={styles.statValue}>₱2,000</Text>
            </View>
          </View>

          {/* Transactions List */}
          <View style={styles.transactionsSection}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <View style={styles.transactionsList}>
              {transactions.map((tx) => {
                const isCredit = tx.type === 'credit';
                return (
                  <View key={tx.id} style={styles.txCard}>
                    <View style={styles.txLeft}>
                      <View style={[styles.txIconWrapper, isCredit ? styles.txCreditBg : styles.txDebitBg]}>
                        {isCredit ? (
                          <ArrowDownLeft size={18} color="#10B981" />
                        ) : (
                          <ArrowUpRight size={18} color="#EF4444" />
                        )}
                      </View>
                      <View>
                        <Text style={styles.txDesc}>{tx.description}</Text>
                        <Text style={styles.txDate}>{tx.date}</Text>
                      </View>
                    </View>
                    <Text style={[styles.txAmount, isCredit ? styles.txCreditText : styles.txDebitText]}>
                      {isCredit ? '+' : '-'}{tx.amount}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Manage Payments Button */}
          <TouchableOpacity 
            style={styles.manageButton}
            activeOpacity={0.8}
          >
            <CreditCard size={18} color="#4B5563" />
            <Text style={styles.manageButtonText}>Manage Payment Methods</Text>
          </TouchableOpacity>
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
  walletHeader: {
    backgroundColor: '#0047AB',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    paddingBottom: 32,
    shadowColor: '#0047AB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
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
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  balanceLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 2,
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    fontStyle: 'italic',
    letterSpacing: -1,
  },
  balanceCents: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
    opacity: 0.9,
  },
  topUpButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 6,
  },
  topUpText: {
    color: '#050A18',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
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
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1F2937',
    fontStyle: 'italic',
  },
  transactionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  transactionsList: {
    gap: 12,
  },
  txCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  txIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txCreditBg: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  txDebitBg: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  txDesc: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  txDate: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  txCreditText: {
    color: '#10B981',
  },
  txDebitText: {
    color: '#1F2937',
  },
  manageButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 8,
  },
  manageButtonText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600',
  },
});
