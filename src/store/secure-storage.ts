import * as SecureStore from 'expo-secure-store';
import type { StateStorage } from 'zustand/middleware';

// Auth tokens are sensitive — unlike preferences-store (AsyncStorage), this
// store persists through expo-secure-store, which uses Keychain on iOS and
// the Keystore-backed EncryptedSharedPreferences on Android.
export const secureStorage: StateStorage = {
  getItem: async (name) => {
    return (await SecureStore.getItemAsync(name)) ?? null;
  },
  setItem: async (name, value) => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name) => {
    await SecureStore.deleteItemAsync(name);
  },
};
