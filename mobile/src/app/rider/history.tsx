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
import { Package, CheckCircle, Calendar, ChevronLeft } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RiderHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const history = [
    {
      id: "1",
      service: "Pabili - Jollibee",
      customer: "Juan Dela Cruz",
      date: "May 7, 2026",
      time: "2:30 PM",
      amount: "₱100",
      status: "Completed",
    },
    {
      id: "2",
      service: "Pasugo - Cash In",
      customer: "Maria Santos",
      date: "May 7, 2026",
      time: "1:15 PM",
      amount: "₱80",
      status: "Completed",
    },
    {
      id: "3",
      service: "Pahatod - Documents",
      customer: "Pedro Cruz",
      date: "May 6, 2026",
      time: "5:45 PM",
      amount: "₱120",
      status: "Completed",
    },
    {
      id: "4",
      service: "Pabili - Groceries",
      customer: "Anna Reyes",
      date: "May 6, 2026",
      time: "3:20 PM",
      amount: "₱150",
      status: "Completed",
    },
    {
      id: "5",
      service: "Pakuha - Package",
      customer: "Jose Garcia",
      date: "May 5, 2026",
      time: "10:00 AM",
      amount: "₱90",
      status: "Completed",
    },
  ];

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
                <Text style={styles.tripsCount}>185</Text>
                <Text style={styles.tripsLabel}>trips completed</Text>
              </View>
            </View>
            
            <View style={styles.achievementIconWrapper}>
              <CheckCircle size={32} color="#D4AF37" />
            </View>
          </View>

          {/* History entries */}
          <View style={styles.listContainer}>
            {history.map((item) => (
              <View key={item.id} style={styles.historyCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={styles.iconWrapper}>
                      <Package size={20} color="#D4AF37" />
                    </View>
                    <View>
                      <Text style={styles.historyService}>{item.service}</Text>
                      <Text style={styles.historyCustomer}>Customer: {item.customer}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.payoutBadge}>
                    <Text style={styles.payoutText}>{item.amount}</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.timeDetails}>
                    <Calendar size={12} color="#9CA3AF" />
                    <Text style={styles.timeText}>{item.date} • {item.time}</Text>
                  </View>
                  
                  <Text style={styles.successTag}>SUCCESS</Text>
                </View>
              </View>
            ))}
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
