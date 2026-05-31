import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
  Linking,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MessageCircle, PhoneCall, Mail, ChevronRight, AlertTriangle, FileText } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RiderHelpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const faqs = [
    {
      q: "What to do if customer is unresponsive?",
      a: "Wait at the drop-off location for at least 10 minutes. Message them via active order chat or call their contact number. If there is no response, contact Emergency Dispatch or Live Chat for authorization to return the item."
    },
    {
      q: "How to report a fake booking?",
      a: "If you suspect a booking is fake or fraudulent, do not proceed with purchasing goods. Immediately open the order options and select 'Report Fraud', or contact the Administrator in Live Chat with the Order ID."
    },
    {
      q: "When do I get my weekly payout?",
      a: "Weekly pilot payouts are automatically processed every Monday at 8:00 AM directly into your registered GCash simulated wallet tokens. Payout summaries can be audited under the 'Earnings' tab."
    },
    {
      q: "How to claim rider incentives?",
      a: "Rider incentive program tokens are automatically credited to your pilot account upon meeting daily dispatch target metrics (e.g. completing 5 trips during peak hours)."
    },
    {
      q: "What if my vehicle breaks down?",
      a: "Prioritize your safety! Pull over safely to the side of the road. Open your active order, call dispatch immediately using the 'Emergency Hotline' button below, and we will route another partner to pick up the cargo."
    }
  ];

  const handlePhoneCall = () => {
    Linking.openURL('tel:+63900000000');
  };

  const handleEmergencyCall = () => {
    Linking.openURL('tel:+63911111111');
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@fetchmeup.com?subject=Rider%20Partner%20Support%20Request');
  };

  const handleFAQPress = (faq: { q: string, a: string }) => {
    Alert.alert(
      faq.q,
      `${faq.a}\n\nNeed further assistance? Tap 'Live Chat' to speak to the Admin in real-time.`
    );
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
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Emergency Card */}
        <View style={styles.emergencyCard}>
          <View style={styles.emergencyHeader}>
            <AlertTriangle size={24} color="#EF4444" />
            <Text style={styles.emergencyTitle}>EMERGENCY HOTLINE</Text>
          </View>
          <Text style={styles.emergencyDesc}>Tap here for immediate dispatch assistance in case of accidents or severe transit emergencies.</Text>
          <TouchableOpacity 
            style={styles.emergencyButton} 
            activeOpacity={0.8}
            onPress={handleEmergencyCall}
          >
            <PhoneCall size={18} color="#FFFFFF" />
            <Text style={styles.emergencyButtonText}>Call Emergency Dispatch</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTACT SUPPORT</Text>
          <View style={styles.contactGrid}>
            <TouchableOpacity 
              style={styles.contactCard} 
              activeOpacity={0.8}
              onPress={() => router.push('/rider/support-chat' as any)}
            >
              <View style={[styles.contactIcon, { backgroundColor: 'rgba(5, 10, 24, 0.05)' }]}>
                <MessageCircle size={24} color="#050A18" />
              </View>
              <Text style={styles.contactText}>Live Chat</Text>
              <Text style={styles.contactSub}>For active dispatches</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.contactCard} 
              activeOpacity={0.8}
              onPress={handleEmailSupport}
            >
              <View style={[styles.contactIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Mail size={24} color="#10B981" />
              </View>
              <Text style={styles.contactText}>Email Us</Text>
              <Text style={styles.contactSub}>For account issues</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RIDER FAQs</Text>
          <View style={styles.card}>
            {faqs.map((faq, index) => (
              <View key={index}>
                <TouchableOpacity 
                  style={styles.faqRow} 
                  activeOpacity={0.7}
                  onPress={() => handleFAQPress(faq)}
                >
                  <Text style={styles.faqText}>{faq.q}</Text>
                  <ChevronRight size={20} color="#C7C7CC" />
                </TouchableOpacity>
                {index < faqs.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LEGAL</Text>
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.faqRow} 
              activeOpacity={0.7}
              onPress={() => Alert.alert("Terms of Service", "By operating as a FetchMeUp pilot partner, you agree to our transit safety protocols, local delivery rules, and GCash simulated payout procedures.")}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <FileText size={20} color="#6B7280" />
                <Text style={styles.faqText}>Terms of Service</Text>
              </View>
              <ChevronRight size={20} color="#C7C7CC" />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity 
              style={styles.faqRow} 
              activeOpacity={0.7}
              onPress={() => Alert.alert("Privacy Policy", "FetchMeUp is committed to securing user coordinates, document verification files, and GCash transaction records.")}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <FileText size={20} color="#6B7280" />
                <Text style={styles.faqText}>Privacy Policy</Text>
              </View>
              <ChevronRight size={20} color="#C7C7CC" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 20 }} />
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
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#050A18',
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
    gap: 24,
  },
  emergencyCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  emergencyTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#EF4444',
    letterSpacing: 1,
  },
  emergencyDesc: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
    fontWeight: '500',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emergencyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginLeft: 4,
  },
  contactGrid: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  contactCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
  },
  contactSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  faqText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    flex: 1,
    paddingRight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
});
