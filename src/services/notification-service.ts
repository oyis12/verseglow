// import * as Notifications from 'expo-notifications';

// export async function notifyDownloadComplete(title: string, body: string) {
//   try {
//     await Notifications.scheduleNotificationAsync({
//       content: { title, body },
//       trigger: null, // fire immediately
//     });
//   } catch {
//     // Non-fatal — the in-app confirmation modal already told them either way.
//   }
// }

import * as Notifications from "expo-notifications";

export async function notifyDownloadComplete(title: string, body: string) {
  try {
    const permissions = await Notifications.getPermissionsAsync();

    let granted = permissions.granted;

    if (!granted) {
      const requested = await Notifications.requestPermissionsAsync();
      granted = requested.granted;
    }

    if (!granted) {
      console.warn(
        "Notification permission was not granted. Download notification was skipped.",
      );
      return false;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: false,
      },
      trigger: null,
    });

    return true;
  } catch (error) {
    console.warn("Could not schedule download-complete notification:", error);

    return false;
  }
}
