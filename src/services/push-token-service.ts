import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import { authorizedFetch } from './auth-service';

/**
 * Gets this device's Expo push token and registers it with the backend so
 * server-triggered events (subscription confirmed/renewed/expiring) can
 * reach the phone's actual notification tray, not just the in-app list.
 * Safe to call repeatedly — the backend upserts by token.
 */
export async function registerPushToken() {
  try {
    if (!Device.isDevice) return; // push tokens aren't meaningful on simulators/emulators without setup

    const permission = await Notifications.getPermissionsAsync();
    if (permission.status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      if (requested.status !== 'granted') return;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      console.warn('No EAS projectId found — cannot register for push notifications.');
      return;
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });

    await authorizedFetch('/api/push-tokens', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  } catch (err) {
    console.warn('Could not register push token:', err);
  }
}
