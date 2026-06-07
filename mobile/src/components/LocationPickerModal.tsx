import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
  Platform
} from 'react-native';
import { X, Search, MapPin, Navigation } from 'lucide-react-native';
import { getCurrentLocation, reverseGeocode } from '../utils/location';

import LocationPickerMap from './LocationPickerMap';

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (address: string, coords: { latitude: number; longitude: number }) => void;
  title: string;
}

export default function LocationPickerModal({
  visible,
  onClose,
  onConfirm,
  title
}: LocationPickerModalProps) {
  // Default centered in Butuan City
  const defaultCoords = { latitude: 8.9475, longitude: 125.5406 };
  const [coords, setCoords] = useState(defaultCoords);
  const [address, setAddress] = useState('Loading address...');
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  
  const mapRef = useRef<any>(null);
  const webIframeRef = useRef<any>(null);

  // Trigger geocoding when coordinates change
  useEffect(() => {
    if (!visible) return;
    let isMounted = true;
    const updateAddress = async () => {
      setIsGeocoding(true);
      try {
        const resolved = await reverseGeocode(coords.latitude, coords.longitude);
        if (isMounted) {
          setAddress(resolved);
        }
      } catch (err) {
        console.error('Reverse geocode error:', err);
      } finally {
        if (isMounted) setIsGeocoding(false);
      }
    };

    const timer = setTimeout(updateAddress, 600);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [coords, visible]);

  // Initial location sync
  useEffect(() => {
    if (visible) {
      handleLocateMe();
    }
  }, [visible]);

  // Handle address searches via Nominatim API (Free and no keys)
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        searchQuery
      )}+Butuan+City&format=json&limit=5`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'FetchMeUp-CapstoneApp'
        }
      });
      const data = await response.json();
      const results = data.map((item: any) => ({
        display_name: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon)
      }));
      setSuggestions(results);
    } catch (err) {
      console.error('Nominatim search query error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = (item: any) => {
    const target = { latitude: item.latitude, longitude: item.longitude };
    setCoords(target);
    setSuggestions([]);
    setSearchQuery('');
    
    if (Platform.OS === 'web') {
      if (webIframeRef.current) {
        webIframeRef.current.contentWindow.postMessage(
          { type: 'SET_CENTER', latitude: item.latitude, longitude: item.longitude },
          '*'
        );
      }
    } else if (mapRef.current) {
      mapRef.current.animateToRegion({
        ...target,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005
      }, 1000);
    }
  };

  async function handleLocateMe() {
    const loc = await getCurrentLocation();
    if (loc) {
      const target = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setCoords(target);
      if (Platform.OS === 'web') {
        if (webIframeRef.current) {
          webIframeRef.current.contentWindow.postMessage(
            { type: 'SET_CENTER', latitude: loc.coords.latitude, longitude: loc.coords.longitude },
            '*'
          );
        }
      } else if (mapRef.current) {
        mapRef.current.animateToRegion({
          ...target,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005
        }, 1000);
      }
    }
  }

  // Listen for Leaflet Map moves on Web browser builds
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleWebMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'MAP_MOVE') {
        setCoords({
          latitude: event.data.latitude,
          longitude: event.data.longitude
        });
      }
    };

    window.addEventListener('message', handleWebMessage);
    return () => {
      window.removeEventListener('message', handleWebMessage);
    };
  }, []);

  const handleConfirm = () => {
    onConfirm(address, coords);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        
        {/* Header bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={20} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search Container */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search location in Butuan City..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
              {isSearching ? (
                <ActivityIndicator size="small" color="#0047AB" />
              ) : (
                <Search size={18} color="#0047AB" />
              )}
            </TouchableOpacity>
          </View>

          {/* Autocomplete Dropdown List */}
          {suggestions.length > 0 && (
            <View style={styles.suggestionsList}>
              <FlatList
                data={suggestions}
                keyExtractor={(item, idx) => idx.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => handleSelectSuggestion(item)}
                  >
                    <MapPin size={16} color="#6B7280" style={{ marginRight: 10 }} />
                    <Text style={styles.suggestionText} numberOfLines={2}>
                      {item.display_name}
                    </Text>
                  </TouchableOpacity>
                )}
                keyboardShouldPersistTaps="handled"
              />
            </View>
          )}
        </View>

        {/* Map Body Content */}
        <View style={styles.mapWrapper}>
          <LocationPickerMap
            coords={coords}
            onRegionChangeComplete={(newCoords) => setCoords(newCoords)}
            mapRef={mapRef}
            webIframeRef={webIframeRef}
          />

          {/* Central Pin overlay for Native Maps */}
          {Platform.OS !== 'web' && (
            <View style={styles.nativePinContainer} pointerEvents="none">
              <View style={styles.nativePinPulse} />
              <MapPin size={32} color="#0047AB" style={{ marginBottom: 16 }} />
            </View>
          )}

          {/* Locate Me Floating Button */}
          <TouchableOpacity style={styles.locateButton} onPress={handleLocateMe}>
            <Navigation size={20} color="#0047AB" />
          </TouchableOpacity>
        </View>

        {/* Footer Details Card */}
        <View style={styles.footer}>
          <Text style={styles.footerLabel}>SELECTED LOCATION PIN:</Text>
          <View style={styles.addressWrapper}>
            {isGeocoding ? (
              <View style={styles.loadingAddress}>
                <ActivityIndicator size="small" color="#D4AF37" style={{ marginRight: 8 }} />
                <Text style={styles.addressTextLoading}>Geocoding coordinates...</Text>
              </View>
            ) : (
              <Text style={styles.addressText} numberOfLines={3}>
                {address}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.confirmButton, isGeocoding && styles.confirmButtonDisabled]}
            onPress={handleConfirm}
            disabled={isGeocoding}
          >
            <Text style={styles.confirmButtonText}>CONFIRM PIN LOCATION</Text>
          </TouchableOpacity>
        </View>

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: { paddingTop: 12, height: 68 }
    })
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6'
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 76 : 64,
    left: 16,
    right: 16,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 48
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#1F2937',
    height: '100%'
  },
  searchButton: {
    padding: 8
  },
  suggestionsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxHeight: 200,
    overflow: 'hidden'
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  suggestionText: {
    fontSize: 12,
    color: '#374151',
    flex: 1
  },
  mapWrapper: {
    flex: 1,
    position: 'relative'
  },
  nativeMap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  nativePinContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  nativePinPulse: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 71, 171, 0.25)',
    top: '50%',
    marginTop: -10
  },
  locateButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 8
  },
  footerLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 8
  },
  addressWrapper: {
    minHeight: 48,
    marginBottom: 16,
    justifyContent: 'center'
  },
  loadingAddress: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  addressTextLoading: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600'
  },
  addressText: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '700',
    lineHeight: 18
  },
  confirmButton: {
    backgroundColor: '#0047AB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#0047AB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4
  },
  confirmButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1
  }
});
