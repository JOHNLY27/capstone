import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, Mail, Lock, Phone, MapPin, Eye, EyeOff, ArrowLeft, ChevronDown } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { getBarangays } from '../../data/philippines';
import { API_URL } from '../../constants/api';
import { authStore } from '../../utils/auth-store';

export default function CustomerSignupScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Email verification modal states
  const [isVerifyModalVisible, setIsVerifyModalVisible] = useState(false);
  const [signupCode, setSignupCode] = useState('');
  const [signupToken, setSignupToken] = useState('');
  const [isVerifyLoading, setIsVerifyLoading] = useState(false);

  const handleVerifyAndRegister = async () => {
    if (!signupCode || signupCode.trim().length !== 6) {
      Alert.alert('Validation Error', 'Please enter a valid 6-digit verification code.');
      return;
    }

    setIsVerifyLoading(true);
    const { fullName, email, password, phoneNumber } = formData;
    try {
      const response = await fetch(`${API_URL}/api/auth/register/customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
          phone: phoneNumber.trim(),
          code: signupCode.trim(),
          signupToken,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Registration failed.');
      }

      setIsVerifyModalVisible(false);
      // Save token and user details to memory store
      authStore.setSession(resData.token, resData.data.user);

      Alert.alert('Success', 'Account created successfully!', [
        {
          text: 'Proceed',
          onPress: () => router.push('/customer'),
        }
      ]);
    } catch (error: any) {
      console.error('Verify & Register Error:', error);
      Alert.alert('Verification Failed', error.message || 'Incorrect verification code or registration failed.');
    } finally {
      setIsVerifyLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    province: 'Agusan del Norte',
    city: 'Butuan City',
    barangay: '',
    streetPurok: '',
    phoneNumber: '',
  });

  const [isBarangayModalVisible, setIsBarangayModalVisible] = useState(false);

  // Fetch all barangays for Butuan City, Agusan del Norte
  const barangays = getBarangays(formData.province, formData.city);

  const handleSubmit = async () => {
    const { fullName, email, password, confirmPassword, phoneNumber, barangay } = formData;

    if (!fullName || !email || !password || !confirmPassword || !phoneNumber || !barangay) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match!');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/send-signup-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Failed to send verification code.');
      }

      setSignupToken(resData.signupToken);
      setIsVerifyModalVisible(true);
    } catch (error: any) {
      console.error('Customer Registration send code error:', error);
      Alert.alert('Registration Failed', error.message || 'Unable to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.replace('/')}
          >
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>

          {/* Logo & Header */}
          <View style={styles.header}>
            <View style={styles.logoWrapper}>
              <Image 
                source={require('../../../assets/images/logo.png')} 
                style={styles.logo}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.title}>Customer Sign Up</Text>
            <Text style={styles.subtitle}>Join the Fetch Me Up family</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <User size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Juan Dela Cruz"
                  placeholderTextColor="#9CA3AF"
                  value={formData.fullName}
                  onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  {showPassword ? (
                    <EyeOff size={20} color="#9CA3AF" />
                  ) : (
                    <Eye size={20} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#9CA3AF" />
                  ) : (
                    <Eye size={20} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Address Section */}
            <View style={styles.sectionHeaderContainer}>
              <MapPin size={20} color="#0047AB" />
              <Text style={styles.sectionTitle}>Address in Philippines</Text>
            </View>

            {/* Province (Locked) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Province</Text>
              <View style={[styles.inputWrapper, styles.disabledInput]}>
                <TextInput
                  style={[styles.input, styles.disabledText]}
                  value={formData.province}
                  editable={false}
                />
              </View>
            </View>

            {/* City (Locked) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>City</Text>
              <View style={[styles.inputWrapper, styles.disabledInput]}>
                <TextInput
                  style={[styles.input, styles.disabledText]}
                  value={formData.city}
                  editable={false}
                />
              </View>
            </View>

            {/* Barangay (Selectable) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Barangay</Text>
              <TouchableOpacity 
                style={styles.inputWrapper}
                onPress={() => setIsBarangayModalVisible(true)}
              >
                <Text style={[
                  styles.input, 
                  { textAlignVertical: 'center', lineHeight: 24, paddingTop: 14 },
                  !formData.barangay ? { color: '#9CA3AF' } : { color: '#1F2937' }
                ]}>
                  {formData.barangay || 'Select Barangay'}
                </Text>
                <ChevronDown size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Street / Purok */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Street / Purok</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter street or purok"
                  placeholderTextColor="#9CA3AF"
                  value={formData.streetPurok}
                  onChangeText={(text) => setFormData({ ...formData, streetPurok: text })}
                />
              </View>
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <Phone size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="09XX XXX XXXX"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  value={formData.phoneNumber}
                  onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              activeOpacity={0.8}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitText}>CREATE ACCOUNT</Text>
              )}
            </TouchableOpacity>

          </View>

          {/* Footer Navigation */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Text 
                style={styles.loginText}
                onPress={() => router.push('/login')}
              >
                Login
              </Text>
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Barangay Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isBarangayModalVisible}
        onRequestClose={() => setIsBarangayModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Barangay</Text>
              <TouchableOpacity onPress={() => setIsBarangayModalVisible(false)}>
                <Text style={styles.modalCloseButton}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={barangays}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.barangayItem}
                  onPress={() => {
                    setFormData({ ...formData, barangay: item });
                    setIsBarangayModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.barangayItemText,
                    formData.barangay === item && styles.selectedBarangayItemText
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
            />
          </View>
        </View>
      </Modal>

      {/* Signup Verification Modal */}
      <Modal
        visible={isVerifyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsVerifyModalVisible(false)}
      >
        <View style={styles.modalOverlayCenter}>
          <View style={styles.modalContentCenter}>
            <Text style={styles.modalTitleCenter}>Verify Email</Text>
            <Text style={styles.modalSubtitleCenter}>
              We sent a 6-digit verification code to <Text style={{ fontWeight: 'bold' }}>{formData.email.trim()}</Text>. Please enter it below to complete registration:
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Verification Code</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 123456"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  maxLength={6}
                  value={signupCode}
                  onChangeText={setSignupCode}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelBtn}
                onPress={() => {
                  setIsVerifyModalVisible(false);
                  setSignupCode('');
                }}
                disabled={isVerifyLoading}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalSubmitBtn, { backgroundColor: '#0047AB' }]}
                onPress={handleVerifyAndRegister}
                disabled={isVerifyLoading}
              >
                {isVerifyLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>Verify & Sign Up</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginTop: 16,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 20,
    padding: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 71, 171, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 16,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0047AB',
    textTransform: 'uppercase',
    fontStyle: 'italic',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  form: {
    width: '100%',
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 54,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#1F2937',
    fontSize: 15,
    height: '100%',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  disabledText: {
    color: '#9CA3AF',
  },
  eyeButton: {
    padding: 4,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#0047AB',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0047AB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 16,
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 2,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#4B5563',
  },
  loginText: {
    color: '#0047AB',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '60%',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalCloseButton: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 15,
  },
  barangayItem: {
    paddingVertical: 16,
  },
  barangayItemText: {
    fontSize: 15,
    color: '#4B5563',
  },
  selectedBarangayItemText: {
    color: '#0047AB',
    fontWeight: '700',
  },
  itemSeparator: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 24, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContentCenter: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  modalTitleCenter: {
    fontSize: 20,
    fontWeight: '900',
    color: '#050A18',
    textTransform: 'uppercase',
    fontStyle: 'italic',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitleCenter: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '700',
  },
  modalSubmitBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
});
