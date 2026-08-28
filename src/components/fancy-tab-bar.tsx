import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { router, Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fonts, radius } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

type FancyTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const tabIcons = {
  index: ['home-outline', 'home'],
  discover: ['compass-outline', 'compass'],
  saved: ['bookmark-outline', 'bookmark'],
  profile: ['person-outline', 'person'],
} as const;

const tabLabels = {
  index: 'Home',
  discover: 'Discover',
  saved: 'Saved',
  profile: 'You',
} as const;

export function FancyTabBar({ state, descriptors, navigation }: FancyTabBarProps) {
  const { colors, resolved } = useAppTheme();
  const insets = useSafeAreaInsets();
  const firstHalf = state.routes.slice(0, 2);
  const secondHalf = state.routes.slice(2);

  const renderRoute = (route: (typeof state.routes)[number]) => {
    const index = state.routes.indexOf(route);
    const focused = state.index === index;
    const options = descriptors[route.key].options;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!focused && !event.defaultPrevented) {
        Haptics.selectionAsync();
        navigation.navigate(route.name, route.params);
      }
    };

    const onLongPress = () =>
      navigation.emit({ type: 'tabLongPress', target: route.key });

    return (
      <TabItem
        key={route.key}
        routeName={route.name}
        focused={focused}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        onPress={onPress}
        onLongPress={onLongPress}
      />
    );
  };

  const createInsight = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/verse-selector');
  };

  return (
    <View pointerEvents="box-none" style={[styles.positioner, { bottom: Math.max(insets.bottom, 12) }]}>
      <View
        style={[
          styles.shadow,
          {
            shadowColor: resolved === 'dark' ? '#000' : '#70523D',
            borderColor: colors.border,
          },
        ]}>
        <BlurView
          intensity={resolved === 'dark' ? 55 : 80}
          tint={resolved === 'dark' ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: `${colors.tab}D9` }]} />
        <View style={styles.row}>
          {firstHalf.map(renderRoute)}
          <View style={styles.createSlot} />
          {secondHalf.map(renderRoute)}
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Create a new insight"
        onPress={createInsight}
        style={({ pressed }) => [
          styles.createButton,
          {
            backgroundColor: colors.primary,
            borderColor: colors.background,
            transform: [{ scale: pressed ? 0.94 : 1 }],
          },
        ]}>
        <View style={styles.createShine} />
        <Ionicons name="sparkles" size={25} color="#FFF" />
      </Pressable>
      <Text pointerEvents="none" style={[styles.createLabel, { color: colors.textMuted }]}>
        Create
      </Text>
    </View>
  );
}

function TabItem({
  routeName,
  focused,
  accessibilityLabel,
  onPress,
  onLongPress,
}: {
  routeName: string;
  focused: boolean;
  accessibilityLabel?: string;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const { colors } = useAppTheme();
  const progress = useDerivedValue(() =>
    withSpring(focused ? 1 : 0, { damping: 16, stiffness: 180 }),
  );
  const animatedIcon = useAnimatedStyle(() => {
    const value = progress.get();
    return {
      transform: [
        { translateY: interpolate(value, [0, 1], [0, -10]) },
        { scale: interpolate(value, [0, 1], [1, 1.18]) },
      ],
      shadowOpacity: interpolate(value, [0, 1], [0, 0.3]),
    };
  });

  const iconPair = tabIcons[routeName as keyof typeof tabIcons] ?? tabIcons.index;
  const label = tabLabels[routeName as keyof typeof tabLabels] ?? routeName;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tab}>
      <Animated.View
        style={[
          styles.iconBubble,
          focused && { backgroundColor: colors.primarySoft },
          animatedIcon,
        ]}>
        <Ionicons
          name={iconPair[focused ? 1 : 0]}
          size={21}
          color={focused ? colors.primary : colors.textMuted}
        />
        {focused && <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />}
      </Animated.View>
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          { color: focused ? colors.primary : colors.textMuted },
          focused && styles.activeLabel,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  positioner: {
    position: 'absolute',
    left: 14,
    right: 14,
    height: 78,
  },
  shadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 70,
    borderRadius: 25,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowOpacity: 0.2,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 18,
  },
  row: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5 },
  tab: { flex: 1, height: 66, alignItems: 'center', justifyContent: 'center', gap: 1 },
  createSlot: { width: 68 },
  iconBubble: {
    width: 44,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D96422',
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  activeDot: {
    position: 'absolute',
    bottom: -4,
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  label: { fontFamily: fonts.sans, fontSize: 9, fontWeight: '600' },
  activeLabel: { fontWeight: '800' },
  createButton: {
    position: 'absolute',
    top: -5,
    alignSelf: 'center',
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D96422',
    shadowOpacity: 0.38,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 20,
    overflow: 'hidden',
  },
  createShine: {
    position: 'absolute',
    width: 42,
    height: 22,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    top: 3,
    left: 4,
    transform: [{ rotate: '-12deg' }],
  },
  createLabel: {
    position: 'absolute',
    bottom: 5,
    alignSelf: 'center',
    fontFamily: fonts.sans,
    fontSize: 9,
    fontWeight: '700',
  },
});
