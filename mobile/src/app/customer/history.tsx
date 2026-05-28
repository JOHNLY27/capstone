import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Package, ChevronRight, ArrowLeft } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CustomerHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const history = [
    {
      id: "1",
      service: "Pabili - McDonald's",
      date: "May 6, 2026",
      amount: "₱350",
      status: "Completed",
    },
    {
      id: "2",
      service: "Pahatod - Documents",
      date: "May 5, 2026",
      amount: "₱150",
      status: "Completed",
    },
    {
      id: "3",
      service: "Pasugo - Cash In",
      date: "May 4, 2026",
      amount: "₱100",
      status: "Completed",
    },
    {
      id: "4",
      service: "Pabili - Groceries",
      date: "May 3, 2026",
      amount: "₱520",
      status: "Cancelled",
    },
    {
      id: "5",
      service: "Pakuha - Package",
      date: "May 2, 2026",
      amount: "₱200",
      status: "Completed",
    },
  ];

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
          {history.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.historyCard}
              activeOpacity={0.8}
              onPress={() => router.push(`/order-details/${order.id}` as any)}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardLeft}>
                  <View style={styles.iconWrapper}>
                    <Package size={22} color="#0047AB" />
                  </View>
                  <View>
                    <Text style={styles.orderService}>{order.service}</Text>
                    <Text style={styles.orderDate}>{order.date}</Text>
                  </View>
                </View>
                
                <View style={styles.cardRight}>
                  <View style={styles.amountWrapper}>
                    <Text style={styles.orderAmount}>{order.amount}</Text>
                    <Text style={[
                      styles.successLabel,
                      order.status === 'Cancelled' && styles.cancelledLabel
                    ]}>
                      {order.status.toUpperCase()}
                    </Text>
                  </View>
                  <ChevronRight size={18} color="#C7C7CC" style={styles.arrowIcon} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
});
