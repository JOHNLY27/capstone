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
import { Bell, ArrowLeft, DollarSign, Bike, AlertTriangle } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RiderNotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const notifications = [
    {
      id: '1',
      title: 'Errand Completed',
      body: 'Successfully completed Pabili order from Jollibee. ₱100 added to balance.',
      time: '10 min ago',
      type: 'earning',
    },
    {
      id: '2',
      title: 'High Demand Alert',
      body: 'Buhangin area has a high number of active orders. Peak surcharge active (+₱20).',
      time: '1 hour ago',
      type: 'surge',
    },
    {
      id: '3',
      title: 'System Maintenance',
      body: 'Fetch Me Up servers will undergo a quick upgrade on Sunday at 2:00 AM.',
      time: '1 day ago',
      type: 'system',
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'earning':
        return <DollarSign size={20} color="#D4AF37" />;
      case 'surge':
        return <AlertTriangle size={20} color="#EF4444" />;
      default:
        return <Bike size={20} color="#050A18" />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top || 20 }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#D4AF37" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Rider Alerts</Text>
            <Text style={styles.headerSubtitle}>Fleet Notifications</Text>
          </View>
        </View>
      </View>

      {/* Notifications List */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.listContainer}>
          {notifications.map((item) => (
            <View key={item.id} style={styles.notificationCard}>
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  {getIcon(item.type)}
                  <Text style={styles.cardTitle}>{item.title}</Text>
                </View>
                <Text style={styles.cardTime}>{item.time}</Text>
              </View>
              <Text style={styles.cardBody}>{item.body}</Text>
            </View>
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
    backgroundColor: '#050A18',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    paddingBottom: 24,
    shadowColor: '#000',
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
  notificationCard: {
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
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cardTime: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  cardBody: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
});
