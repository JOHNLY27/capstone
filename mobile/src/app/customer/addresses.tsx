import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Plus, Home, Briefcase, MoreHorizontal, CheckCircle, Trash2, Star, Check } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authStore } from '../../utils/auth-store';
import { API_URL } from '../../constants/api';

export default function AddressesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [label, setLabel] = useState('');
  const [addressText, setAddressText] = useState('');
  const [detailsText, setDetailsText] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const fetchAddresses = async () => {
    const token = authStore.getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/addresses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const resData = await response.json();

      if (response.ok && resData.success) {
        setAddresses(resData.addresses || []);
      } else {
        Alert.alert('Error', resData.error || 'Failed to fetch saved addresses.');
      }
    } catch (e) {
      console.error('Error fetching addresses:', e);
      Alert.alert('Connection Error', 'Unable to reach the server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddAddress = async () => {
    if (!label.trim() || !addressText.trim()) {
      Alert.alert('Validation Error', 'Label and full address are required.');
      return;
    }

    setIsSubmitting(true);
    const token = authStore.getToken();
    try {
      const response = await fetch(`${API_URL}/api/addresses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          label: label.trim(),
          address: addressText.trim(),
          details: detailsText.trim() || null,
          isDefault
        })
      });
      const resData = await response.json();

      if (response.ok && resData.success) {
        Alert.alert('Success', 'Address added successfully!');
        setLabel('');
        setAddressText('');
        setDetailsText('');
        setIsDefault(false);
        setShowAddForm(false);
        fetchAddresses();
      } else {
        Alert.alert('Failed to Add', resData.error || 'Error saving address.');
      }
    } catch (e) {
      console.error('Add address error:', e);
      Alert.alert('Error', 'Unable to complete network request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOptionsPress = (addr: any) => {
    Alert.alert(
      "Address Options",
      `Manage your location: "${addr.label}"`,
      [
        {
          text: "Set as Default",
          disabled: addr.isDefault,
          onPress: async () => {
            const token = authStore.getToken();
            try {
              const response = await fetch(`${API_URL}/api/addresses/${addr.id}/default`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (response.ok) {
                Alert.alert('Success', 'Default address updated.');
                fetchAddresses();
              } else {
                Alert.alert('Error', 'Failed to update default address.');
              }
            } catch (e) {
              Alert.alert('Error', 'Connection failed.');
            }
          }
        },
        {
          text: "Delete Address",
          style: "destructive",
          onPress: async () => {
            Alert.alert(
              "Delete Confirmation",
              `Are you sure you want to permanently delete "${addr.label}"?`,
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: async () => {
                    const token = authStore.getToken();
                    try {
                      const response = await fetch(`${API_URL}/api/addresses/${addr.id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      if (response.ok) {
                        Alert.alert('Deleted', 'Address removed successfully.');
                        fetchAddresses();
                      } else {
                        Alert.alert('Error', 'Failed to delete address.');
                      }
                    } catch (e) {
                      Alert.alert('Error', 'Connection failed.');
                    }
                  }
                }
              ]
            );
          }
        },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const getAddressIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('home')) return Home;
    if (l.includes('work') || l.includes('office') || l.includes('job')) return Briefcase;
    return MapPin;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerAlign]}>
        <ActivityIndicator size="large" color="#0047AB" />
        <Text style={styles.loadingText}>Syncing addresses...</Text>
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
          <Text style={styles.headerTitle}>Saved Addresses</Text>
          <TouchableOpacity 
            style={styles.addButton} 
            activeOpacity={0.8}
            onPress={() => setShowAddForm(true)}
          >
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Toggle Form Block */}
        {showAddForm && (
          <View style={styles.addAddressFormCard}>
            <Text style={styles.formCardTitle}>Add New Location</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Label / Tag Name</Text>
              <TextInput 
                style={styles.textInput}
                placeholder="e.g. Home, Work, Parents"
                placeholderTextColor="#9CA3AF"
                value={label}
                onChangeText={setLabel}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Address</Text>
              <TextInput 
                style={styles.textInput}
                placeholder="e.g. Buhangin, Butuan City"
                placeholderTextColor="#9CA3AF"
                value={addressText}
                onChangeText={setAddressText}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Pickup/Drop-off Instructions (Optional)</Text>
              <TextInput 
                style={[styles.textInput, styles.instructionsInput]}
                placeholder="e.g. Near blue gate, leave at guard"
                placeholderTextColor="#9CA3AF"
                multiline={true}
                value={detailsText}
                onChangeText={setDetailsText}
              />
            </View>

            <TouchableOpacity 
              style={styles.checkboxRow}
              activeOpacity={0.8}
              onPress={() => setIsDefault(!isDefault)}
            >
              <View style={[styles.checkbox, isDefault && styles.checkboxActive]}>
                {isDefault && <Check size={14} color="#FFF" />}
              </View>
              <Text style={styles.checkboxLabel}>Set as default delivery address</Text>
            </TouchableOpacity>

            <View style={styles.formActions}>
              <TouchableOpacity 
                style={styles.cancelFormButton}
                onPress={() => {
                  setShowAddForm(false);
                  setLabel('');
                  setAddressText('');
                  setDetailsText('');
                  setIsDefault(false);
                }}
              >
                <Text style={styles.cancelFormText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.submitFormButton}
                disabled={isSubmitting}
                onPress={handleAddAddress}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.submitFormText}>Save Location</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>YOUR LOCATIONS</Text>
        
        {addresses.length === 0 ? (
          <View style={styles.emptyCard}>
            <MapPin size={40} color="#D1D5DB" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>No Saved Addresses</Text>
            <Text style={styles.emptyDesc}>
              Keep your frequently requested errands quick! Tap the plus icon or button below to add your home, school, or office coordinates.
            </Text>
          </View>
        ) : (
          addresses.map((addr) => {
            const Icon = getAddressIcon(addr.label);
            return (
              <View key={addr.id} style={[styles.addressCard, addr.isDefault && styles.defaultCard]}>
                <View style={[styles.iconContainer, addr.isDefault && styles.defaultIconContainer]}>
                  <Icon size={22} color={addr.isDefault ? "#0047AB" : "#6B7280"} />
                </View>
                <View style={styles.addressInfo}>
                  <View style={styles.labelRow}>
                    <Text style={styles.addressLabel}>{addr.label}</Text>
                    {addr.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.addressText}>{addr.address}</Text>
                  {addr.details ? (
                    <Text style={styles.detailsText}>Note: {addr.details}</Text>
                  ) : null}
                </View>
                <TouchableOpacity 
                  style={styles.moreButton}
                  onPress={() => handleOptionsPress(addr)}
                >
                  <MoreHorizontal size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            );
          })
        )}
        
        {!showAddForm && (
          <TouchableOpacity 
            style={styles.addNewCard} 
            activeOpacity={0.8}
            onPress={() => setShowAddForm(true)}
          >
            <View style={styles.addNewIcon}>
              <Plus size={22} color="#0047AB" />
            </View>
            <Text style={styles.addNewText}>Add New Address</Text>
          </TouchableOpacity>
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#D4AF37',
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
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  defaultCard: {
    borderColor: 'rgba(0, 71, 171, 0.25)',
    borderWidth: 1.5,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  defaultIconContainer: {
    backgroundColor: 'rgba(0, 71, 171, 0.08)',
  },
  addressInfo: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  addressLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
  },
  defaultBadge: {
    backgroundColor: 'rgba(0, 71, 171, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  defaultText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0047AB',
    textTransform: 'uppercase',
  },
  addressText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
    fontWeight: '500',
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  moreButton: {
    padding: 4,
  },
  addNewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 71, 171, 0.04)',
    padding: 18,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(0, 71, 171, 0.1)',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addNewIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  addNewText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0047AB',
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
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
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

  // Add Address Form Card
  addAddressFormCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  formCardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4B5563',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '500',
  },
  instructionsInput: {
    height: 60,
    textAlignVertical: 'top',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    borderColor: '#0047AB',
    backgroundColor: '#0047AB',
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelFormButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelFormText: {
    color: '#4B5563',
    fontSize: 13,
    fontWeight: '700',
  },
  submitFormButton: {
    flex: 1,
    backgroundColor: '#0047AB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitFormText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
