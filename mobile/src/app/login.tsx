import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Check } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { API_URL } from '../constants/api';
import { authStore } from '../utils/auth-store';
import { persistentStorage } from '../utils/persistent-storage';

export default function LoginScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'customer' | 'rider'>('customer');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password modal states
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const handleSendCode = async () => {
    if (!forgotEmail) {
      Alert.alert('Validation Error', 'Please enter your email address.');
      return;
    }
    setIsForgotLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        Alert.alert('Code Sent', 'If the email is registered, you will receive a verification code shortly.');
        setForgotStep(2);
      } else {
        Alert.alert('Error', data.error || 'Failed to request code.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Unable to connect to server.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!forgotEmail || !resetCode || !newPassword) {
      Alert.alert('Validation Error', 'Please fill out all fields.');
      return;
    }
    if (resetCode.trim().length !== 6) {
      Alert.alert('Validation Error', 'Please enter the 6-digit code.');
      return;
    }
    setIsForgotLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          code: resetCode.trim(),
          newPassword,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        Alert.alert('Success', 'Password reset successful! You can now log in with your new password.');
        setIsForgotModalOpen(false);
        setForgotEmail('');
        setResetCode('');
        setNewPassword('');
        setForgotStep(1);
      } else {
        Alert.alert('Error', data.error || 'Failed to reset password.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Unable to connect to server.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  const loadSavedCredentials = async (type: 'customer' | 'rider') => {
    try {
      const savedEmail = await persistentStorage.getItem(`@remember_email_${type}`);
      const savedPassword = await persistentStorage.getItem(`@remember_password_${type}`);
      const savedRemember = await persistentStorage.getItem(`@remember_flag_${type}`);

      if (savedRemember === 'true' && savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      } else {
        setEmail('');
        setPassword('');
        setRememberMe(false);
      }
    } catch (err) {
      console.error('Error loading remembered credentials:', err);
    }
  };

  useEffect(() => {
    loadSavedCredentials(userType);
  }, [userType]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          role: userType.toUpperCase(),
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Authentication failed. Please check your credentials.');
      }

      // Persist credentials locally if "Remember Me" is enabled
      try {
        if (rememberMe) {
          await persistentStorage.setItem(`@remember_email_${userType}`, email.trim());
          await persistentStorage.setItem(`@remember_password_${userType}`, password);
          await persistentStorage.setItem(`@remember_flag_${userType}`, 'true');
        } else {
          await persistentStorage.removeItem(`@remember_email_${userType}`);
          await persistentStorage.removeItem(`@remember_password_${userType}`);
          await persistentStorage.removeItem(`@remember_flag_${userType}`);
        }
      } catch (storageErr) {
        console.error('Storage persistence error:', storageErr);
      }

      // Save token and user details to memory store
      authStore.setSession(resData.token, resData.data.user);

      // Navigate to respective dashboard
      if (userType === 'customer') {
        router.push('/customer');
      } else {
        router.push('/rider');
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      Alert.alert('Login Failed', error.message || 'Unable to connect to server. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const isCustomer = userType === 'customer';
  const primaryColor = isCustomer ? '#0047AB' : '#D4AF37';

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
                source={require('../../assets/images/logo.png')} 
                style={styles.logo}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Access your command center</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            
            {/* User Type Switch */}
            <View style={styles.switchContainer}>
              <TouchableOpacity
                style={[
                  styles.switchButton,
                  isCustomer && { backgroundColor: '#0047AB' }
                ]}
                activeOpacity={0.9}
                onPress={() => setUserType('customer')}
              >
                <Text style={[
                  styles.switchText,
                  isCustomer ? styles.activeText : styles.inactiveText
                ]}>
                  CUSTOMER
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.switchButton,
                  !isCustomer && { backgroundColor: '#D4AF37' }
                ]}
                activeOpacity={0.9}
                onPress={() => setUserType('rider')}
              >
                <Text style={[
                  styles.switchText,
                  !isCustomer ? styles.activeText : styles.inactiveText
                ]}>
                  RIDER
                </Text>
              </TouchableOpacity>
            </View>

            {/* Email Input */}
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
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#9CA3AF" />
                  ) : (
                    <Eye size={20} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Remember Me & Forgot Password Row */}
            <View style={styles.rememberRow}>
              <TouchableOpacity 
                style={styles.rememberMeContainer}
                activeOpacity={0.8}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[
                  styles.checkbox,
                  rememberMe && { backgroundColor: primaryColor, borderColor: primaryColor }
                ]}>
                  {rememberMe && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                </View>
                <Text style={styles.rememberMeText}>Remember Me</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => setIsForgotModalOpen(true)}
              >
                <Text style={[styles.forgotPasswordText, { color: primaryColor }]}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: primaryColor }]}
              activeOpacity={0.8}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitText}>LOGIN</Text>
              )}
            </TouchableOpacity>

          </View>

          {/* Footer Navigation */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account?{' '}
              <Text 
                style={[styles.signUpText, { color: primaryColor }]}
                onPress={() => {
                  if (isCustomer) {
                    router.push('/signup/customer');
                  } else {
                    router.push('/signup/rider');
                  }
                }}
              >
                Sign up
              </Text>
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal */}
      <Modal
        visible={isForgotModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setIsForgotModalOpen(false);
          setForgotStep(1);
          setForgotEmail('');
          setResetCode('');
          setNewPassword('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Forgot Password</Text>
            
            {forgotStep === 1 ? (
              <View style={styles.modalStep}>
                <Text style={styles.modalSubtitle}>
                  Enter your registered email address below, and we will send you a 6-digit verification code.
                </Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <Mail size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="your@email.com"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={forgotEmail}
                      onChangeText={setForgotEmail}
                    />
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={styles.modalCancelBtn}
                    onPress={() => {
                      setIsForgotModalOpen(false);
                      setForgotEmail('');
                    }}
                    disabled={isForgotLoading}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalSubmitBtn, { backgroundColor: primaryColor }]}
                    onPress={handleSendCode}
                    disabled={isForgotLoading}
                  >
                    {isForgotLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.modalSubmitText}>Send Code</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.modalStep}>
                <Text style={styles.modalSubtitle}>
                  We sent a 6-digit code to <Text style={{ fontWeight: 'bold' }}>{forgotEmail}</Text>. Enter the code and your new password.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>6-Digit Verification Code</Text>
                  <View style={styles.inputWrapper}>
                    <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. 123456"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      maxLength={6}
                      value={resetCode}
                      onChangeText={setResetCode}
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, { marginTop: 12 }]}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.inputWrapper}>
                    <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Min 6 characters"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={true}
                      autoCapitalize="none"
                      value={newPassword}
                      onChangeText={setNewPassword}
                    />
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={styles.modalCancelBtn}
                    onPress={() => {
                      setForgotStep(1);
                      setResetCode('');
                      setNewPassword('');
                    }}
                    disabled={isForgotLoading}
                  >
                    <Text style={styles.modalCancelText}>Back</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalSubmitBtn, { backgroundColor: primaryColor }]}
                    onPress={handleResetPassword}
                    disabled={isForgotLoading}
                  >
                    {isForgotLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.modalSubmitText}>Reset Password</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Matches bg-gray-50 from web
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
    marginBottom: 32,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 24,
    padding: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 20,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0047AB',
    textTransform: 'uppercase',
    fontStyle: 'italic',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  form: {
    width: '100%',
    gap: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(229, 231, 235, 0.5)', // bg-gray-200/50
    padding: 6,
    borderRadius: 16,
    gap: 8,
  },
  switchButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
  activeText: {
    color: '#FFFFFF',
  },
  inactiveText: {
    color: '#6B7280',
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151', // text-gray-700
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB', // border-gray-300
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
  eyeButton: {
    padding: 4,
  },
  submitButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 8,
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 2,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 4,
    marginBottom: 4,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  rememberMeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 24, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
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
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#050A18',
    textTransform: 'uppercase',
    fontStyle: 'italic',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalStep: {
    width: '100%',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
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
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#4B5563', // text-gray-600
  },
  signUpText: {
    fontWeight: '700',
  },
});
