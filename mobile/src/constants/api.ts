import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getHostIp = () => {
  if (Platform.OS === 'web') {
    return 'localhost';
  }
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    return hostUri.split(':')[0];
  }
  return '192.168.1.18'; // Fallback to current developer host IP
};

const hostIp = getHostIp();

/**
 * Central API URL configuration.
 * 
 * NOTE FOR EMULATORS / SIMULATORS:
 * - iOS Simulator: Use 'http://localhost:5000'
 * - Android Emulator: Use 'http://10.0.2.2:5000' (Android emulators route host machine port here)
 * 
 * NOTE FOR PHYSICAL PHONES (Expo Go):
 * - Dynamically resolved from Metro's hostUri, or falls back to host IP.
 * - Ensure both your phone and computer are connected to the EXACT same Wi-Fi network.
 */
export const API_URL = `http://${hostIp}:5000`;
console.log('[API] Resolved API_URL:', API_URL);
