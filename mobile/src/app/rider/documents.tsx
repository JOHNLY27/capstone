import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, FileText, CheckCircle, Clock, AlertCircle, Shield, Award } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authStore } from '../../utils/auth-store';
import { API_URL } from '../../constants/api';

export default function RiderDocumentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [docData, setDocData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRiderDocs = async () => {
    const token = authStore.getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const resData = await response.json();

      if (response.ok && resData.success) {
        // Find documents associated with the rider account
        const doc = resData.data.documents?.[0];
        setDocData(doc || null);
      }
    } catch (e) {
      console.error('Error fetching rider documents:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRiderDocs();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', text: 'Verified', icon: CheckCircle };
      case 'REJECTED':
        return { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', text: 'Rejected', icon: AlertCircle };
      default:
        return { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', text: 'Under Review', icon: Clock };
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerAlign]}>
        <ActivityIndicator size="large" color="#050A18" />
        <Text style={styles.loadingText}>Syncing documentation credentials...</Text>
      </View>
    );
  }

  const status = docData?.status || 'PENDING';
  const badgeInfo = getStatusBadge(status);
  const BadgeIcon = badgeInfo.icon;

  const documentItems = [
    {
      id: 'license',
      title: "Professional Driver's License",
      subtitle: docData?.licenseNumber ? `License No: ${docData.licenseNumber}` : 'License Number Unavailable',
      description: 'Official authorization issued by LTO permitting logistical courier operations.',
    },
    {
      id: 'vehicle',
      title: 'Vehicle Registration (OR/CR)',
      subtitle: docData?.plateNumber ? `Plate / MV File No: ${docData.plateNumber}` : 'Plate Number Unavailable',
      description: docData?.vehicleModel ? `Model: ${docData.vehicleModel}` : 'Vehicle Model details',
    },
    {
      id: 'clearance',
      title: 'Official NBI Clearance',
      subtitle: 'Background Safety Check',
      description: 'Criminal record clearance confirming citizen compliance and safety validation.',
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top || 20 }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => router.push('/rider/profile' as any)}
          >
            <ArrowLeft size={20} color="#D4AF37" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Documents</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Verification Alert Banner */}
        <View style={[styles.statusBanner, { backgroundColor: badgeInfo.bg, borderColor: `${badgeInfo.color}30` }]}>
          <BadgeIcon size={24} color={badgeInfo.color} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusBannerTitle, { color: badgeInfo.color }]}>
              Account Status: {badgeInfo.text}
            </Text>
            <Text style={styles.statusBannerDesc}>
              {status === 'APPROVED' 
                ? 'Your professional credentials have been fully verified. You are authorized to accept dispatches!'
                : status === 'REJECTED'
                ? 'One or more of your documents was rejected by administrative review. Please contact support.'
                : 'Your rider application documents are currently undergoing verification reviews. We will notify you once complete.'}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>YOUR SUBMITTED CREDENTIALS</Text>
        
        {documentItems.map((item) => (
          <View key={item.id} style={styles.docCard}>
            <View style={styles.docHeader}>
              <View style={styles.docIconBox}>
                <FileText size={22} color="#050A18" />
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docTitle}>{item.title}</Text>
                <Text style={styles.docSubtitle}>{item.subtitle}</Text>
                <Text style={styles.docDesc}>{item.description}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* Security badge footer */}
        <View style={styles.securityFooter}>
          <Shield size={16} color="#9CA3AF" />
          <Text style={styles.securityFooterText}>
            All documentation records are encrypted and secured under standard Capstone privacy bounds.
          </Text>
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
  centerAlign: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#050A18',
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#050A18',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    gap: 16,
  },
  statusBanner: {
    flexDirection: 'row',
    gap: 16,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
  },
  statusBannerTitle: {
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statusBannerDesc: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 4,
    marginTop: 8,
  },
  docCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  docHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  docIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(5, 10, 24, 0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(5, 10, 24, 0.08)',
  },
  docInfo: {
    flex: 1,
  },
  docTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  docSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0047AB',
    marginBottom: 6,
  },
  docDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    fontWeight: '500',
  },
  securityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 20,
  },
  securityFooterText: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '500',
    flex: 1,
  },
});
