import * as Notifications from "expo-notifications";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
  Stack,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { useAppTheme } from "@/hooks/use-app-theme";
import { configureGoogleSignIn } from "@/services/auth-service";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const { resolved, colors } = useAppTheme();

  useEffect(() => {
    configureGoogleSignIn();
    // Notifications.requestPermissionsAsync().catch(() => {
    // });
    SplashScreen.hide();
  }, []);

  const navigationTheme = resolved === "dark" ? DarkTheme : DefaultTheme;

  return (
    <NavigationThemeProvider
      value={{
        ...navigationTheme,
        colors: {
          ...navigationTheme.colors,
          background: colors.background,
          card: colors.surface,
          border: colors.border,
          primary: colors.primary,
          text: colors.text,
        },
      }}
    >
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="verse-selector"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="designer"
          options={{
            presentation: "modal",
            animation: "slide_from_right",
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="subscription"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
            gestureEnabled: true,
          }}
        />
      </Stack>
    </NavigationThemeProvider>
  );
}

// import * as Notifications from "expo-notifications";
// import {
//   DarkTheme,
//   DefaultTheme,
//   ThemeProvider as NavigationThemeProvider,
//   Stack,
// } from "expo-router";
// import * as SplashScreen from "expo-splash-screen";
// import { useEffect } from "react";

// import { useAppTheme } from "@/hooks/use-app-theme";
// import { configureGoogleSignIn } from "@/services/auth-service";

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowBanner: true,
//     shouldShowList: true,
//     shouldPlaySound: false,
//     shouldSetBadge: false,
//   }),
// });

// export default function RootLayout() {
//   const { resolved, colors } = useAppTheme();

//   useEffect(() => {
//     const initializeApp = async () => {
//       try {
//         configureGoogleSignIn();

//         const permissions = await Notifications.getPermissionsAsync();

//         if (!permissions.granted) {
//           await Notifications.requestPermissionsAsync();
//         }
//       } catch (error) {
//         console.warn("Notification initialization failed:", error);
//       } finally {
//         SplashScreen.hide();
//       }
//     };

//     initializeApp();
//   }, []);

//   const navigationTheme = resolved === "dark" ? DarkTheme : DefaultTheme;

//   return (
//     <NavigationThemeProvider
//       value={{
//         ...navigationTheme,
//         colors: {
//           ...navigationTheme.colors,
//           background: colors.background,
//           card: colors.surface,
//           border: colors.border,
//           primary: colors.primary,
//           text: colors.text,
//         },
//       }}
//     >
//       <Stack
//         screenOptions={{
//           headerShown: false,
//           contentStyle: {
//             backgroundColor: colors.background,
//           },
//         }}
//       >
//         <Stack.Screen name="index" />

//         <Stack.Screen name="onboarding" />

//         <Stack.Screen name="sign-in" />

//         <Stack.Screen name="(tabs)" />

//         <Stack.Screen
//           name="verse-selector"
//           options={{
//             presentation: "modal",
//             animation: "slide_from_bottom",
//             gestureEnabled: true,
//           }}
//         />

//         <Stack.Screen
//           name="designer"
//           options={{
//             presentation: "modal",
//             animation: "slide_from_right",
//             gestureEnabled: true,
//           }}
//         />

//         <Stack.Screen
//           name="subscription"
//           options={{
//             presentation: "modal",
//             animation: "slide_from_bottom",
//             gestureEnabled: true,
//           }}
//         />
//       </Stack>
//     </NavigationThemeProvider>
//   );
// }
