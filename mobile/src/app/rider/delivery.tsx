import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Platform,
  Dimensions
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Phone, MessageSquare, MapPin, Navigation, CheckCircle, Package } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function RiderActiveDeliveryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = params.id || "1";
  const insets = useSafeAreaInsets();
  
  const [status, setStatus] = useState<'assigned' | 'picked_up' | 'completed'>('assigned');

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Top Banner Header */}
      <View style={[styles.header, { paddingTop: insets.top || 20 }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={() => router.push('/rider/' as any)}
            >
              <ChevronLeft size={20} color="#D4AF37" />
            </TouchableOpacity>
            <View>
              <Text style={styles.headerTitle}>Active Delivery</Text>
              <Text style={styles.headerSubtitle}>Order #{orderId}</Text>
            </View>
          </View>

          <View style={styles.orderSummaryCard}>
            <View style={styles.summaryLeft}>
              <Package size={20} color="#D4AF37" />
              <Text style={styles.summaryText}>Pabili - Jollibee</Text>
            </View>
            <View style={styles.paymentBadge}>
              <Text style={styles.paymentText}>₱100</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Mock Map Navigation Section */}
      <View style={styles.mapContainer}>
        {/* Premium Graphic Representation of a Map */}
        <View style={styles.mockMapBackground}>
          <View style={styles.gridLineHorizontal1} />
          <View style={styles.gridLineHorizontal2} />
          <View style={styles.gridLineVertical1} />
          <View style={styles.gridLineVertical2} />
          
          {/* Path Line */}
          <View style={styles.mapRoutePath} />
          
          {/* Pickup Marker */}
          <View style={[styles.mapMarker, styles.pickupMarker]}>
            <View style={styles.markerPulse} />
            <MapPin size={18} color="#0047AB" />
            <View style={styles.markerLabelWrapper}>
              <Text style={styles.markerLabel}>Jollibee</Text>
            </View>
          </View>

          {/* Delivery Marker */}
          <View style={[styles.mapMarker, styles.deliveryMarker]}>
            <View style={styles.markerPulseGold} />
            <MapPin size={18} color="#D4AF37" />
            <View style={styles.markerLabelWrapper}>
              <Text style={styles.markerLabel}>Customer</Text>
            </View>
          </View>
        </View>
        
        {/* Status indicator on Map */}
        <View style={styles.mapStatusBadge}>
          <Text style={styles.mapStatusText}>
            {status === 'assigned' ? 'ROUTE TO STORE (0.5 km)' : 'ROUTE TO CUSTOMER (1.2 km)'}
          </Text>
        </View>
      </View>

      {/* Details Scroll Section */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.body}>
          {/* Customer Profile Actions */}
          <View style={styles.customerCard}>
            <View style={styles.customerLeft}>
              <Text style={styles.blockSublabel}>CUSTOMER</Text>
              <Text style={styles.customerName}>Juan Dela Cruz</Text>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionIconButton}>
                <MessageSquare size={18} color="#D4AF37" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionIconButton}>
                <Phone size={18} color="#D4AF37" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Delivery Address Block */}
          <View style={styles.infoBlock}>
            <View style={styles.blockHeader}>
              <MapPin size={16} color="#4B5563" />
              <Text style={styles.blockTitle}>Delivery Address</Text>
            </View>
            <Text style={styles.addressText}>
              Purok 1, Buhangin, Butuan City, Agusan del Norte
            </Text>
          </View>

          {/* Order Details list */}
          <View style={styles.orderDetailsBlock}>
            <Text style={styles.orderDetailTitle}>Order Details</Text>
            <View style={styles.itemRow}>
              <Text style={styles.itemDot}>•</Text>
              <Text style={styles.itemText}>1x Chickenjoy with Rice</Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.itemDot}>•</Text>
              <Text style={styles.itemText}>1x Jolly Spaghetti</Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={styles.itemDot}>•</Text>
              <Text style={styles.itemText}>2x Iced Tea</Text>
            </View>
          </View>

          {/* Process Navigation & Complete Buttons */}
          <View style={styles.actionSection}>
            {status === 'assigned' ? (
              <TouchableOpacity 
                style={styles.primaryButton}
                activeOpacity={0.8}
                onPress={() => setStatus('picked_up')}
              >
                <CheckCircle size={18} color="#D4AF37" />
                <Text style={styles.primaryButtonText}>MARK AS PICKED UP</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.completedButton}
                activeOpacity={0.8}
                onPress={() => {
                  setStatus('completed');
                  router.push('/rider/' as any);
                }}
              >
                <CheckCircle size={18} color="#FFFFFF" />
                <Text style={styles.completedButtonText}>COMPLETE MISSION</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={styles.navigationButton}
              activeOpacity={0.8}
            >
              <Navigation size={18} color="#FFFFFF" />
              <Text style={styles.navigationButtonText}>START NAVIGATION</Text>
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
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#D4AF37',
    fontWeight: '700',
    marginTop: 2,
  },
  orderSummaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  paymentBadge: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 50,
  },
  paymentText: {
    color: '#050A18',
    fontSize: 13,
    fontWeight: '900',
  },
  mapContainer: {
    height: 240,
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  mockMapBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E8ECEF',
    position: 'relative',
    overflow: 'hidden',
  },
  gridLineHorizontal1: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 80,
    height: 2,
    backgroundColor: '#D1D5DB',
  },
  gridLineHorizontal2: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 160,
    height: 2,
    backgroundColor: '#D1D5DB',
  },
  gridLineVertical1: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: width * 0.33,
    width: 2,
    backgroundColor: '#D1D5DB',
  },
  gridLineVertical2: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: width * 0.66,
    width: 2,
    backgroundColor: '#D1D5DB',
  },
  mapRoutePath: {
    position: 'absolute',
    top: 100,
    left: width * 0.25,
    width: width * 0.45,
    height: 4,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
    transform: [{ rotate: '25deg' }],
  },
  mapMarker: {
    position: 'absolute',
    alignItems: 'center',
  },
  pickupMarker: {
    top: 60,
    left: width * 0.2,
  },
  deliveryMarker: {
    top: 120,
    left: width * 0.65,
  },
  markerPulse: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 71, 171, 0.25)',
    top: -5,
  },
  markerPulseGold: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 175, 55, 0.25)',
    top: -5,
  },
  markerLabelWrapper: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  markerLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  mapStatusBadge: {
    position: 'absolute',
    bottom: 16,
    left: 24,
    right: 24,
    backgroundColor: '#050A18',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  mapStatusText: {
    color: '#D4AF37',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  body: {
    padding: 24,
    gap: 20,
  },
  customerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  customerLeft: {
    flex: 1,
  },
  blockSublabel: {
    fontSize: 8,
    fontWeight: '900',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBlock: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  blockTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  addressText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    lineHeight: 20,
  },
  orderDetailsBlock: {
    backgroundColor: 'rgba(0, 71, 171, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 71, 171, 0.1)',
    borderRadius: 20,
    padding: 18,
  },
  orderDetailTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0047AB',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  itemDot: {
    fontSize: 14,
    color: '#0047AB',
    fontWeight: 'bold',
  },
  itemText: {
    fontSize: 14,
    color: '#0047AB',
    fontWeight: '500',
  },
  actionSection: {
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#050A18',
    borderColor: 'rgba(212, 175, 55, 0.5)',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#D4AF37',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1.5,
  },
  completedButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  completedButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1.5,
  },
  navigationButton: {
    backgroundColor: '#0047AB',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#0047AB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  navigationButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1.5,
  },
});
