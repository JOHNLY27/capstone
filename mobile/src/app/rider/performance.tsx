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
import { ArrowLeft, Star, TrendingUp, CheckCircle, Clock, MessageSquare, Award } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authStore } from '../../utils/auth-store';
import { API_URL } from '../../constants/api';

export default function RiderPerformanceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [rating, setRating] = useState(5.0);
  const [ratingsCount, setRatingsCount] = useState(0);
  const [tripsCount, setTripsCount] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPerformanceStats = async () => {
    const token = authStore.getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      // 1. Fetch fresh user rating from profile endpoint
      try {
        const profileResponse = await fetch(`${API_URL}/api/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const profileData = await profileResponse.json();
        if (profileResponse.ok && profileData.success && profileData.data.user) {
          const freshUser = profileData.data.user;
          setRating(Number(freshUser.rating || 5.0));
          setRatingsCount(freshUser.ratingsCount || 0);
          authStore.updateUser(freshUser);
        } else {
          // Fallback to cached user
          const user = authStore.getUser();
          if (user) {
            setRating(Number(user.rating || 5.0));
            setRatingsCount(user.ratingsCount || 0);
          }
        }
      } catch (profileError) {
        console.error('Error loading profile rating:', profileError);
        // Fallback to cached user
        const user = authStore.getUser();
        if (user) {
          setRating(Number(user.rating || 5.0));
          setRatingsCount(user.ratingsCount || 0);
        }
      }

      // 2. Fetch completed trips and reviews from orders endpoint
      const response = await fetch(`${API_URL}/api/orders/rider`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await response.json();

      if (response.ok && resData.success) {
        const orders = resData.data.orders || [];
        const completedOrders = orders.filter((o: any) => o.status === 'COMPLETED');
        setTripsCount(completedOrders.length);

        // Filter actually rated completed orders
        const ratedOrders = completedOrders.filter((order: any) => {
          const details = order.details || {};
          return details.isRated === true || typeof details.riderRating !== 'undefined';
        });

        const liveReviews = ratedOrders.map((order: any) => {
          const customerName = order.customer?.name || 'Customer Partner';
          const details = order.details || {};
          const reviewRating = Number(details.riderRating || 5.0);
          const reviewComment = details.riderReview || 'No review comment provided.';
          const formattedDate = new Date(order.createdAt).toLocaleDateString([], { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          });
          
          return {
            id: order.id,
            customer: customerName,
            rating: reviewRating,
            date: formattedDate,
            comment: reviewComment
          };
        });

        setReviews(liveReviews);
      }
    } catch (e) {
      console.error('Error loading performance details:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceStats();
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerAlign]}>
        <ActivityIndicator size="large" color="#050A18" />
        <Text style={styles.loadingText}>Syncing rating diagnostics...</Text>
      </View>
    );
  }

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
            <Text style={styles.mainRatingScore}>{rating.toFixed(1)}</Text>
            <Star size={30} color="#D4AF37" fill="#D4AF37" style={{ marginTop: -8 }} />
          </View>
          <Text style={styles.mainRatingSubtitle}>Based on {tripsCount || ratingsCount || 5} dynamic reviews</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <CheckCircle size={20} color="#10B981" />
              </View>
              <Text style={styles.statValue}>99%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
            <View style={styles.statBox}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(0, 71, 171, 0.1)' }]}>
                <TrendingUp size={20} color="#0047AB" />
              </View>
              <Text style={styles.statValue}>{tripsCount}</Text>
              <Text style={styles.statLabel}>Trips Completed</Text>
            </View>
            <View style={styles.statBox}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <Clock size={20} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>14m</Text>
              <Text style={styles.statLabel}>Avg Speed</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>DYNAMIC REVIEWS FEED</Text>
        
        {reviews.length === 0 ? (
          <View style={styles.emptyCard}>
            <MessageSquare size={36} color="#D1D5DB" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>No Reviews Yet</Text>
            <Text style={styles.emptyDesc}>
              Complete active errand orders in Butuan City to receive ratings and feedback logs from customers!
            </Text>
          </View>
        ) : (
          reviews.map((review) => (
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
                  <Text style={styles.ratingText}>{review.rating.toFixed(1)}</Text>
                </View>
              </View>
              <Text style={styles.reviewComment}>"{review.comment}"</Text>
            </View>
          ))
        )}

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
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 4,
    elevation: 2,
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
    backgroundColor: 'rgba(5, 10, 24, 0.05)',
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
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '800',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
    fontWeight: '500',
  },
});
