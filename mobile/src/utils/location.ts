import * as Location from 'expo-location';

/**
 * Request location permission from the device.
 * Returns true if granted, false otherwise.
 */
export async function requestLocationPermissions(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permissions:', error);
    return false;
  }
}

/**
 * Get the current position of the device.
 */
export async function getCurrentLocation(): Promise<Location.LocationObject | null> {
  try {
    const hasPermission = await requestLocationPermissions();
    if (!hasPermission) return null;
    return await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
}

/**
 * Resolve coordinates to a human-readable address description.
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (results && results.length > 0) {
      const place = results[0];
      const parts = [
        place.name,
        place.street,
        place.district,
        place.city
      ].filter(Boolean);
      return parts.join(', ') || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  } catch (error) {
    console.error('Error reverse geocoding:', error);
  }
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

/**
 * Resolve a human-readable address to coordinates.
 */
export async function geocodeAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    if (!address.trim()) return null;
    const results = await Location.geocodeAsync(address);
    if (results && results.length > 0) {
      return {
        latitude: results[0].latitude,
        longitude: results[0].longitude,
      };
    }
  } catch (error) {
    console.error(`Error geocoding address "${address}":`, error);
  }
  return null;
}

/**
 * Calculate the Haversine distance in km between two coordinates.
 * Includes a 1.2x road routing multiplier to approximate actual travel distance.
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLineDistance = R * c;
  
  // Apply a 1.2x multiplier to approximate road route distance
  const roadDistance = straightLineDistance * 1.2;
  return Number(roadDistance.toFixed(2));
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Fetch real driving road route distance (in km) from OSRM.
 * Falls back to Haversine straight-line distance with routing factor if fetch fails.
 */
export async function getRoadRouteDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): Promise<number> {
  try {
    // Open Source Routing Machine (OSRM) driving profile
    const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OSRM API response status: ${response.status}`);
    }
    const data = await response.json();
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const distanceInMeters = data.routes[0].distance;
      const distanceInKm = distanceInMeters / 1000;
      console.log(`🎯 [OSRM] Calculated real road distance: ${distanceInKm.toFixed(2)} km`);
      return Number(distanceInKm.toFixed(2));
    }
  } catch (error) {
    console.error('Error fetching road distance from OSRM, falling back to math estimation:', error);
  }
  // Fallback to standard math calculation
  return calculateDistance(lat1, lon1, lat2, lon2);
}

/**
 * Calculate estimated delivery fee: 50 base + 10 per km
 */
export function calculateDeliveryFee(distanceKm: number): number {
  const baseFee = 50.00;
  const perKmFee = 10.00;
  return Number((baseFee + distanceKm * perKmFee).toFixed(2));
}
