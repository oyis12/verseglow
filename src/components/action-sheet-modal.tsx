import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { fonts, radius, spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

export type ActionSheetButton = {
  label: string;
  onPress: () => void;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  variant?: "brand" | "outline" | "destructive";
};

type ActionSheetModalProps = {
  visible: boolean;
  onRequestClose: () => void;
  icon: IconName;
  title: string;
  body: string;
  actions: ActionSheetButton[];
  dismissLabel?: string;
};

export function ActionSheetModal({
  visible,
  onRequestClose,
  icon,
  title,
  body,
  actions,
  dismissLabel = "Not now",
}: ActionSheetModalProps) {
  const { colors } = useAppTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onRequestClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onRequestClose} />
        <SafeAreaView
          edges={["bottom"]}
          style={[styles.sheet, { backgroundColor: colors.background }]}
        >
          <View style={styles.handle} />
          <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name={icon} size={34} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.body, { color: colors.textMuted }]}>{body}</Text>

          {actions.map((action, index) => {
            const isDestructive = action.variant === "destructive";
            const isOutline = action.variant === "outline";
            return (
              <Pressable
                key={action.label}
                disabled={action.disabled || action.loading}
                onPress={action.onPress}
                style={[
                  styles.button,
                  index > 0 && { marginTop: spacing.sm },
                  isOutline
                    ? {
                        backgroundColor: "transparent",
                        borderWidth: 1.5,
                        borderColor: colors.border,
                      }
                    : {
                        backgroundColor: isDestructive
                          ? "#C4473A"
                          : colors.primary,
                      },
                  { opacity: action.disabled ? 0.6 : 1 },
                ]}
              >
                {action.loading ? (
                  <ActivityIndicator color={isOutline ? colors.text : "#FFF"} />
                ) : (
                  <>
                    {action.icon && (
                      <Ionicons
                        name={action.icon}
                        size={18}
                        color={isOutline ? colors.text : "#FFF"}
                      />
                    )}
                    <Text
                      style={[
                        styles.buttonText,
                        { color: isOutline ? colors.text : "#FFF" },
                      ]}
                    >
                      {action.label}
                    </Text>
                  </>
                )}
              </Pressable>
            );
          })}

          <Pressable onPress={onRequestClose} style={styles.dismiss}>
            <Text style={[styles.dismissText, { color: colors.textMuted }]}>
              {dismissLabel}
            </Text>
          </Pressable>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: spacing.lg,
    alignItems: "center",
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#888",
    opacity: 0.5,
  },
  icon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 27,
    marginTop: spacing.md,
    textAlign: "center",
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  button: {
    width: "100%",
    height: 56,
    borderRadius: radius.md,
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  buttonText: { fontFamily: fonts.sans, fontSize: 14, fontWeight: "800" },
  dismiss: { padding: spacing.md },
  dismissText: { fontFamily: fonts.sans, fontSize: 13, fontWeight: "700" },
});
