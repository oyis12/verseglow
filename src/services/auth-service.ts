import { useAuthStore, type AuthUser } from "@/store/auth-store";
import { NativeModules } from "react-native";

type AuthResponse = {
  success: boolean;
  message?: string;
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

// Check if native module is linked in binary
const isGoogleSigninAvailable = (): boolean => {
  return (
    !!NativeModules.RNGoogleSignin ||
    !!NativeModules.RNGoogleSigninModule ||
    !!NativeModules.RNGoogleSignIn
  );
};

// Lazy dynamic import to prevent TurboModuleRegistry.getEnforcing crash on app launch
async function getGoogleSigninModule() {
  if (!isGoogleSigninAvailable()) {
    throw new Error(
      "Google Sign-In native module is not available in this build. Please run 'npx expo run:android' or 'npx expo run:ios' to build the native binary.",
    );
  }
  return await import("@react-native-google-signin/google-signin");
}

function getApiUrl() {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error(
      "The backend URL is not configured. Add EXPO_PUBLIC_API_URL to your .env file.",
    );
  }
  return apiUrl.replace(/\/$/, "");
}

export async function configureGoogleSignIn() {
  try {
    if (!isGoogleSigninAvailable()) {
      console.warn("Google Sign-In skipped: Native module not linked.");
      return;
    }
    const { GoogleSignin } = await getGoogleSigninModule();
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      offlineAccess: false,
    });
  } catch (error) {
    console.warn(
      "Google Sign-In configuration skipped or failed native initialization:",
      error,
    );
  }
}

export async function signInWithGoogle(): Promise<AuthUser> {
  const { GoogleSignin, isSuccessResponse } = await getGoogleSigninModule();

  await GoogleSignin.hasPlayServices();
  const response = await GoogleSignin.signIn();

  if (!isSuccessResponse(response)) {
    throw new Error("Google sign-in was cancelled.");
  }

  const idToken = response.data.idToken;
  if (!idToken) {
    throw new Error(
      "Google did not return an ID token. Check your webClientId configuration.",
    );
  }

  const apiResponse = await fetch(`${getApiUrl()}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ idToken }),
  });

  const result = (await apiResponse.json()) as AuthResponse;

  if (!apiResponse.ok || !result.success) {
    throw new Error(result.message || "Unable to sign in right now.");
  }

  useAuthStore.getState().setSession({
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });

  return result.user;
}

export async function signOut() {
  try {
    if (isGoogleSigninAvailable()) {
      const { GoogleSignin } = await getGoogleSigninModule();
      await GoogleSignin.signOut();
    }
  } catch {
    // Ignore — clear local session even if this fails.
  }
  useAuthStore.getState().signOut();
}

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) return null;

  const response = await fetch(`${getApiUrl()}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    useAuthStore.getState().signOut();
    return null;
  }

  const result = (await response.json()) as { accessToken: string };
  useAuthStore.getState().setAccessToken(result.accessToken);
  return result.accessToken;
}

export async function authorizedFetch(path: string, options: RequestInit = {}) {
  const doFetch = (token: string | null) =>
    fetch(`${getApiUrl()}${path}`, {
      ...options,
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

  let { accessToken } = useAuthStore.getState();
  let response = await doFetch(accessToken);

  if (response.status === 401) {
    accessToken = await refreshAccessToken();
    if (accessToken) {
      response = await doFetch(accessToken);
    }
  }

  return response;
}
