import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
  Switch,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Key, EyeOff, ShieldAlert, Trash2, ChevronRight, Lock, Eye, EyeOff as EyeIcon } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authStore } from '../../utils/auth-store';
import { API_URL } from '../../constants/api';

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    dataSharing: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fetchPrivacySettings = async () => {
    const token = authStore.getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/auth/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await response.json();
      if (response.ok && resData.success) {
        const s = resData.settings || {};
        setSettings({
          twoFactorAuth: s.twoFactorAuth || false,
          dataSharing: s.dataSharing !== undefined ? s.dataSharing : true,
        });
      }
    } catch (e) {
      console.error('Error fetching privacy settings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrivacySettings();
  }, []);

  const toggleSetting = async (key: keyof typeof settings) => {
    const updatedSettings = {
      ...settings,
      [key]: !settings[key]
    };
    
    setSettings(updatedSettings);

    const token = authStore.getToken();
    if (!token) return;

    try {
      // We pull current settings to merge, then PUT
      const response = await fetch(`${API_URL}/api/auth/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await response.json();
      const currentFullSettings = response.ok && resData.success ? (resData.settings || {}) : {};

      const fullSettings = {
        ...currentFullSettings,
        ...updatedSettings
      };

      await fetch(`${API_URL}/api/auth/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings: fullSettings })
      });
    } catch (e) {
      setSettings(settings); // Rollback on error
      Alert.alert('Error', 'Unable to sync privacy configurations.');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Validation Error', 'Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Validation Error', 'New password and confirm password do not match.');
      return;
    }

    setIsSubmitting(true);
    const token = authStore.getToken();

    try {
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const resData = await response.json();

      if (response.ok && resData.success) {
        Alert.alert('Success', 'Your password has been successfully updated!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordModal(false);
      } else {
        Alert.alert('Error', resData.error || 'Failed to change password.');
      }
    } catch (e) {
      console.error('Password change error:', e);
      Alert.alert('Error', 'Unable to update password. Connection failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "🚨 DANGER: Account Deletion",
      "Are you absolutely sure you want to permanently delete your FetchMeUp account? All your transaction logs, saved addresses, and profile details will be completely wiped from our servers. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Permanently Delete",
          style: "destructive",
          onPress: async () => {
            const token = authStore.getToken();
            try {
              const response = await fetch(`${API_URL}/api/auth/delete-account`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
              });

              if (response.ok) {
                Alert.alert('Wiped', 'Your account has been deleted successfully.');
                authStore.clearSession();
                router.replace('/login');
              } else {
                Alert.alert('Error', 'Failed to delete account.');
              }
            } catch (e) {
              Alert.alert('Error', 'Unable to reach the server.');
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerAlign]}>
        <ActivityIndicator size="large" color="#0047AB" />
        <Text style={styles.loadingText}>Syncing security settings...</Text>
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
            onPress={() => router.push('/customer/profile' as any)}
          >
            <ArrowLeft size={20} color="#D4AF37" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy & Security</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SECURITY</Text>
          
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.actionRow} 
              activeOpacity={0.7}
              onPress={() => setShowPasswordModal(true)}
            >
              <View style={styles.actionInfo}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(0, 71, 171, 0.1)' }]}>
                  <Key size={20} color="#0047AB" />
                </View>
                <View>
                  <Text style={styles.actionLabel}>Change Password</Text>
                  <Text style={styles.actionDesc}>Update your login credentials</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#C7C7CC" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.actionRow}>
              <View style={styles.actionInfo}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(212, 175, 55, 0.1)' }]}>
                  <ShieldAlert size={20} color="#D4AF37" />
                </View>
                <View>
                  <Text style={styles.actionLabel}>Two-Factor Auth</Text>
                  <Text style={styles.actionDesc}>Add an extra layer of security</Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: "#E5E7EB", true: "rgba(212, 175, 55, 0.5)" }}
                thumbColor={settings.twoFactorAuth ? "#D4AF37" : "#FFFFFF"}
                ios_backgroundColor="#E5E7EB"
                onValueChange={() => toggleSetting('twoFactorAuth')}
                value={settings.twoFactorAuth}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRIVACY</Text>
          
          <View style={styles.card}>
            <View style={styles.actionRow}>
              <View style={styles.actionInfo}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(107, 114, 128, 0.1)' }]}>
                  <EyeOff size={20} color="#6B7280" />
                </View>
                <View>
                  <Text style={styles.actionLabel}>Data Sharing</Text>
                  <Text style={styles.actionDesc}>Manage analytics and tracking</Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: "#E5E7EB", true: "rgba(107, 114, 128, 0.5)" }}
                thumbColor={settings.dataSharing ? "#6B7280" : "#FFFFFF"}
                ios_backgroundColor="#E5E7EB"
                onValueChange={() => toggleSetting('dataSharing')}
                value={settings.dataSharing}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>DANGER ZONE</Text>
          
          <View style={[styles.card, { borderColor: 'rgba(239, 68, 68, 0.3)' }]}>
            <TouchableOpacity 
              style={styles.actionRow} 
              activeOpacity={0.7}
              onPress={handleDeleteAccount}
            >
              <View style={styles.actionInfo}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                  <Trash2 size={20} color="#EF4444" />
                </View>
                <View style={styles.deleteLabelContainer}>
                  <Text style={[styles.actionLabel, { color: '#EF4444' }]}>Delete Account</Text>
                  <Text style={styles.actionDesc}>Permanently remove your data</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            
            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Current Password</Text>
              <View style={styles.passwordInputContainer}>
                <Lock size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.modalTextInput}
                  secureTextEntry={true}
                  placeholder="Enter current password"
                  placeholderTextColor="#9CA3AF"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
              </View>
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>New Password</Text>
              <View style={styles.passwordInputContainer}>
                <Lock size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.modalTextInput}
                  secureTextEntry={true}
                  placeholder="Enter new password"
                  placeholderTextColor="#9CA3AF"
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
              </View>
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Confirm New Password</Text>
              <View style={styles.passwordInputContainer}>
                <Lock size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.modalTextInput}
                  secureTextEntry={true}
                  placeholder="Re-type new password"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelBtn}
                onPress={() => {
                  setShowPasswordModal(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalSubmitBtn}
                disabled={isSubmitting}
                onPress={handleChangePassword}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#0047AB',
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#0047AB',
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  actionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  actionDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  deleteLabelContainer: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 72,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 24, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalInputGroup: {
    marginBottom: 16,
  },
  modalInputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4B5563',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  modalTextInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#4B5563',
    fontSize: 13,
    fontWeight: '700',
  },
  modalSubmitBtn: {
    flex: 1,
    backgroundColor: '#0047AB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
