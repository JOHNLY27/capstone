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
import { Package, Clock, ArrowLeft, ChevronRight } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CustomerOrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const orders = [
    {
      id: "1",
      service: "Pabili - Jollibee",
      status: "In Transit",
      rider: "Mark Santos",
      time: "15 min",
      statusType: "transit", // transit, finding, completed
    },
    {
      id: "2",
      service: "Pasugo - Cash In",
      status: "Finding Rider",
      rider: null,
      time: "2 min ago",
      statusType: "finding",
    },
    {
      id: "3",
      service: "Pakuha - Documents",
      status: "Completed",
      rider: "Anna Cruz",
      time: "30 min ago",
      statusType: "completed",
    },
  ];

  const getStatusStyle = (type: string) => {
    switch (type) {
      case 'transit':
        return {
          container: styles.statusTransit,
          text: styles.statusTransitText
        };
      case 'finding':
        return {
          container: styles.statusFinding,
          text: styles.statusFindingText
        };
      default:
        return {
          container: styles.statusCompleted,
          text: styles.statusCompletedText
        };
    }
  };

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
            <Text style={styles.headerTitle}>Active Orders</Text>
            <Text style={styles.headerSubtitle}>Real-time Deployment Status</Text>
          </View>
        </View>
      </View>

      {/* Orders List */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.listContainer}>
          {orders.map((order) => {
            const statusStyles = getStatusStyle(order.statusType);
            return (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                activeOpacity={0.8}
                onPress={() => router.push(`/track/${order.id}` as any)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={styles.iconWrapper}>
                      <Package size={22} color="#0047AB" />
                    </View>
                    <View>
                      <Text style={styles.orderService}>{order.service}</Text>
                      {order.rider && (
                        <Text style={styles.orderRider}>Rider: {order.rider}</Text>
                      )}
                    </View>
                  </View>
                  <View style={[styles.statusBadge, statusStyles.container]}>
                    <Text style={[styles.statusText, statusStyles.text]}>
                      {order.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.timeWrapper}>
                    <Clock size={14} color="#6B7280" />
                    <Text style={styles.timeText}>{order.time}</Text>
                  </View>
                  <ChevronRight size={16} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            );
          })}

          {orders.length === 0 && (
            <View style={styles.emptyContainer}>
              <Package size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No active orders found</Text>
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
    gap: 16,
  },
  orderCard: {
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
    marginBottom: 2,
  },
  orderRider: {
    fontSize: 13,
    color: '#4B5563',
  },
  statusBadge: {
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  statusTransit: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  statusTransitText: {
    color: '#D4AF37',
  },
  statusFinding: {
    backgroundColor: 'rgba(0, 71, 171, 0.1)',
    borderColor: 'rgba(0, 71, 171, 0.2)',
  },
  statusFindingText: {
    color: '#0047AB',
  },
  statusCompleted: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  statusCompletedText: {
    color: '#4B5563',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  timeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
});
