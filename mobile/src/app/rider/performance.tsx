import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Star, TrendingUp, CheckCircle, Clock, MessageCircle } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RiderPerformanceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const reviews = [
    {
      id: '1',
      customer: 'Juan D.',
      rating: 5,
      date: '2 days ago',
      comment: 'Very fast delivery and polite rider! Food was still hot.',
    },
    {
      id: '2',
      customer: 'Maria S.',
      rating: 5,
      date: '1 week ago',
      comment: 'Careful with the items. Highly recommended!',
    },
    {
      id: '3',
      customer: 'Alex P.',
      rating: 4,
      date: '2 weeks ago',
      comment: 'Good service, just a bit hard to find the location but he called.',
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
          <Text style={styles.headerTitle}>Performance</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Stats Card */}
        <View style={styles.mainStatsCard}>
          <Text style={styles.mainRatingTitle}>Overall Rating</Text>
          <View style={styles.mainRatingRow}>
            <Text style={styles.mainRatingScore}>4.9</Text>
            <Star size={32} color="#D4AF37" fill="#D4AF37" style={{ marginTop: -8 }} />
          </View>
          <Text style={styles.mainRatingSubtitle}>Based on 150+ reviews</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <CheckCircle size={20} color="#10B981" />
              </View>
              <Text style={styles.statValue}>98%</Text>
              <Text style={styles.statLabel}>Acceptance</Text>
            </View>
            <View style={styles.statBox}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <TrendingUp size={20} color="#3B82F6" />
              </View>
              <Text style={styles.statValue}>185</Text>
              <Text style={styles.statLabel}>Total Trips</Text>
            </View>
            <View style={styles.statBox}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <Clock size={20} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>12m</Text>
              <Text style={styles.statLabel}>Avg Time</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>RECENT REVIEWS</Text>
        
        {reviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewAvatar}>
                <Text style={styles.reviewInitial}>{review.customer[0]}</Text>
              </View>
              <View style={styles.reviewInfo}>
                <Text style={styles.reviewName}>{review.customer}</Text>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
              <View style={styles.ratingBadge}>
                <Star size={12} color="#D4AF37" fill="#D4AF37" />
                <Text style={styles.ratingText}>{review.rating}.0</Text>
              </View>
            </View>
            <Text style={styles.reviewComment}>"{review.comment}"</Text>
          </View>
        ))}

        <TouchableOpacity style={styles.viewAllButton}>
          <MessageCircle size={16} color="#1E3A8A" />
          <Text style={styles.viewAllText}>View All Reviews</Text>
        </TouchableOpacity>

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
  mainStatsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 8,
  },
  mainRatingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 8,
  },
  mainRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mainRatingScore: {
    fontSize: 48,
    fontWeight: '900',
    color: '#1F2937',
  },
  mainRatingSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 4,
    marginTop: 8,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  reviewInfo: {
    flex: 1,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  reviewDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4AF37',
  },
  reviewComment: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(30, 58, 138, 0.05)',
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  viewAllText: {
    color: '#1E3A8A',
    fontSize: 14,
    fontWeight: '700',
  }
});
