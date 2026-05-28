import React, { useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { Bike, ShoppingBag, ArrowRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  // Floating animation for the Logo
  const floatAnim = useSharedValue(0);
  useEffect(() => {
    floatAnim.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: floatAnim.value }],
    };
  });

  // Background glow pulse animation
  const glowAnim = useSharedValue(1);
  useEffect(() => {
    glowAnim.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedGlow1 = useAnimatedStyle(() => {
    return {
      transform: [{ scale: glowAnim.value }],
    };
  });

  const animatedGlow2 = useAnimatedStyle(() => {
    return {
      transform: [{ scale: glowAnim.value * 0.95 }],
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Ambient background glows */}
      <View style={styles.glowContainer} pointerEvents="none">
        <Animated.View style={[styles.blueGlow, animatedGlow1]} />
        <Animated.View style={[styles.goldGlow, animatedGlow2]} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          
          {/* Header & Logo Section */}
          <View style={styles.headerSection}>
            <Animated.View style={[styles.logoWrapper, animatedLogoStyle]}>
              <Image 
                source={require('../../assets/images/logo.png')} 
                style={styles.logo}
                resizeMode="cover"
              />
            </Animated.View>

            <Text style={styles.title}>
              FETCH <Text style={styles.goldText}>ME UP</Text>
            </Text>
            <Text style={styles.subtitle}>BUTUAN CITY</Text>
          </View>

          {/* Action Buttons Section */}
          <View style={styles.buttonSection}>
            
            {/* Primary Access Account Button */}
            <TouchableOpacity 
              style={styles.primaryButton}
              activeOpacity={0.8}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.primaryButtonText}>ACCESS ACCOUNT</Text>
              <ArrowRight size={20} color="#FFFFFF" style={styles.buttonIcon} />
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>JOIN THE FLEET</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Role Signup Buttons */}
            <View style={styles.roleGrid}>
              
              {/* Customer Signup */}
              <TouchableOpacity 
                style={styles.roleButton}
                activeOpacity={0.8}
                onPress={() => router.push('/signup/customer')}
              >
                <View style={[styles.iconWrapper, styles.blueIconBg]}>
                  <ShoppingBag size={24} color="#0047AB" />
                </View>
                <Text style={styles.roleButtonText}>Customer</Text>
              </TouchableOpacity>

              {/* Rider Signup */}
              <TouchableOpacity 
                style={styles.roleButton}
                activeOpacity={0.8}
                onPress={() => router.push('/signup/rider')}
              >
                <View style={[styles.iconWrapper, styles.goldIconBg]}>
                  <Bike size={24} color="#D4AF37" />
                </View>
                <Text style={styles.roleButtonText}>Rider</Text>
              </TouchableOpacity>

            </View>
          </View>

          {/* Footer Branding */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              SAFE  •  FAST  •  RELIABLE  •  ESTABLISHED 2025
            </Text>
          </View>

        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050A18',
  },
  glowContainer: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  blueGlow: {
    position: 'absolute',
    top: -height * 0.15,
    left: -width * 0.2,
    width: width * 1.1,
    height: width * 1.1,
    borderRadius: (width * 1.1) / 2,
    backgroundColor: 'rgba(0, 71, 171, 0.18)',
    filter: [{ blur: 100 }] as any, // Supported natively in Expo SDK 56+ via React Native / CSS style inheritance
  },
  goldGlow: {
    position: 'absolute',
    bottom: -height * 0.15,
    right: -width * 0.2,
    width: width * 1.0,
    height: width * 1.0,
    borderRadius: (width * 1.0) / 2,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    filter: [{ blur: 100 }] as any,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: height * 0.05,
    paddingBottom: height * 0.03,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: height * 0.04,
  },
  logoWrapper: {
    width: 160,
    height: 160,
    borderRadius: 32,
    padding: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 24,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 31,
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  goldText: {
    color: '#D4AF37',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#D4AF37',
    letterSpacing: 4,
    opacity: 0.8,
  },
  buttonSection: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#0047AB',
    paddingVertical: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#0047AB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dividerText: {
    color: 'rgba(212, 175, 55, 0.4)',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 3,
    paddingHorizontal: 16,
  },
  roleGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 20,
    gap: 12,
  },
  iconWrapper: {
    padding: 12,
    borderRadius: 14,
  },
  blueIconBg: {
    backgroundColor: 'rgba(0, 71, 171, 0.15)',
  },
  goldIconBg: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  roleButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    marginTop: height * 0.04,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.2)',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 2.5,
    textAlign: 'center',
  },
});
