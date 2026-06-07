import { API_URL } from '../constants/api';
import { authStore } from './auth-store';

export interface FareRate {
  baseFee: number;
  perKmFee: number;
}

class SettingsStore {
  private fares: Record<string, FareRate> = {
    PABILI: { baseFee: 50, perKmFee: 10 },
    PAHATOD: { baseFee: 50, perKmFee: 10 },
    PAKUHA: { baseFee: 50, perKmFee: 10 },
    PASUGO: { baseFee: 50, perKmFee: 10 },
    Motorcycle: { baseFee: 50, perKmFee: 10 },
    "Bao-Bao": { baseFee: 60, perKmFee: 12 },
    "4-wheels": { baseFee: 100, perKmFee: 20 }
  };

  async loadSettings(): Promise<void> {
    const token = authStore.getToken();
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/auth/system-settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await response.json();
      if (response.ok && resData.success && resData.data.fares) {
        const loadedFares = resData.data.fares;
        Object.keys(loadedFares).forEach((key) => {
          this.fares[key] = {
            baseFee: Number(loadedFares[key].baseFee ?? loadedFares[key].base ?? 50),
            perKmFee: Number(loadedFares[key].perKmFee ?? loadedFares[key].perKm ?? 10)
          };
        });
        console.log('🎯 [SettingsStore] Loaded dynamic fare rates successfully:', this.fares);
      }
    } catch (err) {
      console.error('Error loading dynamic system settings:', err);
    }
  }

  getDeliveryFee(distanceKm: number, serviceOrVehicleType: string): number {
    const rate = this.fares[serviceOrVehicleType] || this.fares['Motorcycle'];
    return Number((rate.baseFee + distanceKm * rate.perKmFee).toFixed(2));
  }
}

export const settingsStore = new SettingsStore();
