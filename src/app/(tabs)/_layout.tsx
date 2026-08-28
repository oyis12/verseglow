import { Tabs } from "expo-router";

import { FancyTabBar } from "@/components/fancy-tab-bar";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <FancyTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { paddingBottom: 92 } }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="discover" options={{ title: "Discover" }} />
      <Tabs.Screen name="saved" options={{ title: "Saved" }} />
      <Tabs.Screen name="profile" options={{ title: "You" }} />
    </Tabs>
  );
}
