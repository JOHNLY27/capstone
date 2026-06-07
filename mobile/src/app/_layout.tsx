import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import { useColorScheme, Platform } from 'react-native';
import { useEffect } from 'react';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { authStore } from '../utils/auth-store';
import { API_URL } from '../constants/api';

// Conditionally require expo-notifications only if not in Expo Go and not on Web
let Notifications: any = null;
const isExpoGo = Constants.executionEnvironment === 'storeClient';

if (!isExpoGo && Platform.OS !== 'web') {
  try {
    Notifications = require('expo-notifications');
  } catch (err) {
    console.warn('⚠️ [PushService] Failed to load expo-notifications:', err);
  }
}

// Configure foreground notifications
if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

async function registerForPushNotificationsAsync() {
  if (!Notifications) {
    console.log('ℹ️ [PushService] Notifications not supported in current environment (Expo Go or Web).');
    return null;
  }

  let token;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    try {
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('Got Expo Push Token:', token);
    } catch (e) {
      console.error('Error fetching Expo Push Token:', e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

async function registerAndSavePushToken() {
  try {
    const token = await registerForPushNotificationsAsync();
    if (!token) return;

    const authToken = authStore.getToken();
    if (!authToken) return;

    const response = await fetch(`${API_URL}/api/auth/push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log('Successfully registered push token with backend:', data);
    } else {
      console.error('Failed to register push token with backend:', data.error);
    }
  } catch (err) {
    console.error('Error registering push token:', err);
  }
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Check initially on mount
    if (authStore.isAuthenticated()) {
      registerAndSavePushToken();
    }

    // Subscribe to future session shifts
    const unsubscribe = authStore.subscribe(() => {
      if (authStore.isAuthenticated()) {
        registerAndSavePushToken();
      }
    });

    // Set up notification listeners only if supported
    let notificationSubscription: any = null;
    let responseSubscription: any = null;

    if (Notifications) {
      notificationSubscription = Notifications.addNotificationReceivedListener((notification: any) => {
        console.log('Foreground notification received:', notification);
      });

      responseSubscription = Notifications.addNotificationResponseReceivedListener((response: any) => {
        console.log('Notification tapped response:', response);
      });
    }

    return () => {
      unsubscribe();
      if (notificationSubscription) notificationSubscription.remove();
      if (responseSubscription) responseSubscription.remove();
    };
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </ThemeProvider>
  );
}
