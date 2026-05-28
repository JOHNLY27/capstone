import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, FileText, CheckCircle, Clock, AlertCircle, UploadCloud } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RiderDocumentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const documents = [
    {
      id: '1',
      title: "Driver's License",
      status: 'verified',
      expiry: 'Oct 2028',
    },
    {
      id: '2',
      title: 'Vehicle Registration (OR/CR)',
      status: 'verified',
      expiry: 'May 2027',
    },
    {
      id: '3',
      title: 'NBI Clearance',
      status: 'pending',
      expiry: 'N/A',
    },
    {
      id: '4',
      title: 'Barangay Clearance',
      status: 'expired',
      expiry: 'Jan 2026',
    }
  ];

  const getStatusInfo = (status: string) => {
    switch(status) {
      case 'verified':
        return { color: '#10B981', icon: CheckCircle, text: 'Verified' };
      case 'pending':
        return { color: '#F59E0B', icon: Clock, text: 'Under Review' };
      case 'expired':
        return { color: '#EF4444', icon: AlertCircle, text: 'Expired' };
      default:
        return { color: '#6B7280', icon: FileText, text: 'Unknown' };
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
        <Text style={styles.sectionTitle}>REQUIRED DOCUMENTS</Text>
        <Text style={styles.sectionDesc}>Keep these updated to avoid account suspension.</Text>
        
        {documents.map((doc) => {
          const statusInfo = getStatusInfo(doc.status);
          const StatusIcon = statusInfo.icon;
          
          return (
            <View key={doc.id} style={[styles.docCard, doc.status === 'expired' && styles.docCardExpired]}>
              <View style={styles.docHeader}>
                <View style={styles.docIconBox}>
                  <FileText size={24} color="#1E3A8A" />
                </View>
                <View style={styles.docInfo}>
                  <Text style={styles.docTitle}>{doc.title}</Text>
                  <Text style={styles.docExpiry}>Valid until: {doc.expiry}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}15` }]}>
                  <StatusIcon size={12} color={statusInfo.color} />
                  <Text style={[styles.statusText, { color: statusInfo.color }]}>
                    {statusInfo.text}
                  </Text>
                </View>
              </View>

              {doc.status !== 'verified' && (
                <TouchableOpacity style={styles.uploadButton} activeOpacity={0.8}>
                  <UploadCloud size={16} color="#FFFFFF" />
                  <Text style={styles.uploadButtonText}>
                    {doc.status === 'expired' ? 'Upload Renewal' : 'Upload Document'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

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
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
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
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    marginTop: -12,
  },
  docCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  docCardExpired: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1.5,
  },
  docHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  docIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 58, 138, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
  docExpiry: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 20,
    gap: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
