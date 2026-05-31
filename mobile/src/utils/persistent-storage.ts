import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

class PersistentStorage {
  private memoryCache = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    // 1. Direct Web local storage check
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
      } catch (e) {
        console.warn('[PersistentStorage] Web localStorage get failed:', e);
      }
    }

    // 2. Native AsyncStorage query with graceful recovery
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (err) {
      // Quiet fallback message instead of visual yellow console warnings
      console.log(`[PersistentStorage] Native module not loaded, using web/local storage fallback.`);
      
      // Secondary fallback to window.localStorage if available
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
      } catch (localErr) {
        // Suppress nested warning
      }

      // Tertiary fallback to in-memory cache
      return this.memoryCache.get(key) || null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    // Update memory cache immediately
    this.memoryCache.set(key, value);

    // 1. Direct Web local storage check
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
          return;
        }
      } catch (e) {
        console.warn('[PersistentStorage] Web localStorage set failed:', e);
      }
    }

    // 2. Native AsyncStorage save with graceful recovery
    try {
      await AsyncStorage.setItem(key, value);
    } catch (err) {
      // Quiet fallback message instead of visual yellow console warnings
      console.log(`[PersistentStorage] Native module not loaded, using web/local storage fallback.`);
      
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      } catch (localErr) {
        // Suppress nested warning
      }
    }
  }

  async removeItem(key: string): Promise<void> {
    // Update memory cache immediately
    this.memoryCache.delete(key);

    // 1. Direct Web local storage check
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
          return;
        }
      } catch (e) {
        console.warn('[PersistentStorage] Web localStorage remove failed:', e);
      }
    }

    // 2. Native AsyncStorage remove with graceful recovery
    try {
      await AsyncStorage.removeItem(key);
    } catch (err) {
      // Quiet fallback message instead of visual yellow console warnings
      console.log(`[PersistentStorage] Native module not loaded, using web/local storage fallback.`);
      
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      } catch (localErr) {
        // Suppress nested warning
      }
    }
  }
}

export const persistentStorage = new PersistentStorage();
