import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { ShoppingBag, Send, Package, Navigation, Bell, MapPin, Bike } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function CustomerDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const services = [
    {
      id: 'pabili',
      title: 'Pabili',
      description: 'Food & Groceries',
      icon: ShoppingBag,
      color: '#0047AB',
      path: '/customer/pabili',
    },
    {
      id: 'pasugo',
      title: 'Pasugo',
      description: 'Errands & Parcel',
      icon: Send,
      color: '#D4AF37',
      path: '/customer/pasugo',
    },
    {
      id: 'pakuha',
      title: 'Pakuha',
      description: 'Pickup Items',
      icon: Package,
      color: '#050A18',
      path: '/customer/pakuha',
    },
    {
      id: 'pahatod',
      title: 'Pahatod',
      description: 'Drop-off / Delivery',
      icon: Navigation,
      color: '#475569', // slate-600
      path: '/customer/pahatod',
    },
    {
      id: 'ride',
      title: 'FMU Ride',
      description: 'Passenger / Hatud',
      icon: Bike,
      color: '#D4AF37',
      path: '/customer/ride',
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
        
        {/* Header Section with Profile & Delivery Zone */}
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
                  <Text style={styles.greetingText}>Hello, Juan!</Text>
                  <Text style={styles.missionText}>What's your mission today?</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.notificationButton}
                activeOpacity={0.7}
                onPress={() => router.push('/customer/notifications')}
              >
                <Bell size={24} color="#FFFFFF" />
                <View style={styles.notificationBadge} />
              </TouchableOpacity>
            </View>

            {/* Delivery Zone Banner */}
            <View style={styles.deliveryZone}>
              <MapPin size={20} color="#D4AF37" style={styles.zoneIcon} />
              <View>
                <Text style={styles.zoneLabel}>DELIVERY ZONE</Text>
                <Text style={styles.zoneValue}>Buhangin, Butuan City</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Services & Active Orders Section */}
        <View style={styles.body}>
          
          <Text style={styles.sectionTitle}>Services</Text>
          
          {/* Services Grid (2 Columns) */}
          <View style={styles.servicesGrid}>
            {services.map((service) => {
              const IconComponent = service.icon;
              return (
                <TouchableOpacity
                  key={service.id}
                  style={styles.serviceCard}
                  activeOpacity={0.8}
                  onPress={() => router.push(service.path as any)}
                >
                  <View style={[styles.iconWrapper, { backgroundColor: service.color }]}>
                    <IconComponent size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                  <Text style={styles.serviceDesc}>{service.description}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Active Orders Section */}
          <View style={styles.activeOrdersSection}>
            <View style={styles.activeOrdersHeader}>
              <Text style={styles.sectionTitle}>Active Orders</Text>
              <TouchableOpacity onPress={() => router.push('/customer/orders')}>
                <Text style={styles.viewAllText}>VIEW ALL</Text>
              </TouchableOpacity>
            </View>

            {/* Active Order Card */}
            <TouchableOpacity 
              style={styles.orderCard}
              activeOpacity={0.9}
              onPress={() => router.push('/track/1' as any)}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderTitle}>Pabili - Jollibee</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>IN TRANSIT</Text>
                </View>
              </View>
              <Text style={styles.riderText}>Rider: Mark Santos</Text>
              <View style={styles.timeWrapper}>
                <Navigation size={14} color="#6B7280" />
                <Text style={styles.timeText}>Arriving in 15 minutes</Text>
              </View>
            </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerBackground: {
    backgroundColor: '#0047AB',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    paddingBottom: 32,
    shadowColor: '#0047AB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
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
  missionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D4AF37',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  notificationButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
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
  deliveryZone: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  zoneIcon: {
    marginRight: 2,
  },
  zoneLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1.5,
  },
  zoneValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 2,
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 28,
  },
  serviceCard: {
    width: (width - 64) / 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  serviceDesc: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  activeOrdersSection: {
    marginTop: 8,
  },
  activeOrdersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0047AB',
    letterSpacing: 1.5,
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0047AB',
    fontStyle: 'italic',
  },
  statusBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#D4AF37',
    letterSpacing: 0.5,
  },
  riderText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 10,
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
});
