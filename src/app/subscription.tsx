import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActionSheetModal } from "@/components/action-sheet-modal";
import { fonts, radius, spacing } from "@/constants/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  devActivateSubscription,
  devCancelSubscription,
  fetchSubscription,
  type SubscriptionInfo,
} from "@/services/subscription-service";
import { useUsageStore } from "@/store/usage-store";

const benefits = [
  "No rewarded ads — generate freely up to a generous daily cap",
  "Download cards to your photo gallery",
  "Premium card themes and fonts",
  "A much higher daily generation limit",
];

// Display prices only — once real Google Play Billing is wired, actual
// pricing (and any per-country variation) comes from what's configured in
// Play Console, not from this array.
const plans: {
  id: "monthly" | "yearly";
  label: string;
  price: string;
  note?: string;
}[] = [
  { id: "monthly", label: "Monthly", price: "$4.99 / month" },
  {
    id: "yearly",
    label: "Yearly",
    price: "$29.99 / year",
    note: "Best value · save 50%",
  },
];

export default function SubscriptionScreen() {
  const { colors } = useAppTheme();
  const applyUsageSnapshot = useUsageStore((state) => state.applySnapshot);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">(
    "yearly",
  );
  const [statusModal, setStatusModal] = useState<{
    title: string;
    body: string;
  } | null>(null);

  const load = () => {
    setIsLoading(true);
    fetchSubscription()
      .then(setSubscription)
      .catch(() =>
        setSubscription({
          isPro: false,
          plan: null,
          currentPeriodEnd: null,
          provider: null,
        }),
      )
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const isActive = subscription?.isPro ?? false;
  const isTrial = subscription?.plan === "trial";
  const statusCopy = isTrial
    ? "You're on your free 3-day Pro trial. Enjoy the full experience while it lasts."
    : isActive
      ? `Your Pro access is active${subscription?.plan ? ` (${subscription.plan})` : ""}. Enjoy the full experience.`
      : "Your current plan is Free. Pro removes the daily ad-unlock cycle and unlocks downloads.";

  const handleSubscribe = async () => {
    setIsProcessing(true);
    try {
      // TEMPORARY: activates Pro directly for testing. Will be replaced with
      // a real Google Play purchase flow (react-native-iap) once Play
      // Console subscription products are set up.
      const usageSnapshot = await devActivateSubscription(selectedPlan);
      applyUsageSnapshot(usageSnapshot);
      load();
      setStatusModal({
        title: "Pro activated",
        body: "This is using the test activation path — real billing comes later.",
      });
    } catch (error) {
      setStatusModal({
        title: "Could not activate",
        body: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    setIsProcessing(true);
    try {
      const usageSnapshot = await devCancelSubscription();
      applyUsageSnapshot(usageSnapshot);
      load();
    } catch (error) {
      setStatusModal({
        title: "Could not cancel",
        body: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Close subscription"
            onPress={() => router.back()}
            style={[styles.close, { backgroundColor: colors.surface }]}
          >
            <Ionicons name="close" size={22} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Your plan
          </Text>
          <View style={styles.close} />
        </View>

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            <View style={[styles.hero, { backgroundColor: colors.surface }]}>
              <View
                style={[styles.crown, { backgroundColor: colors.primarySoft }]}
              >
                <Ionicons name="sparkles" size={30} color={colors.primary} />
              </View>
              <Text style={[styles.eyebrow, { color: colors.primary }]}>
                DAILY INSIGHT PRO
              </Text>
              <Text style={[styles.title, { color: colors.text }]}>
                Generate without limits.
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                {statusCopy}
              </Text>
            </View>

            <View
              style={[styles.benefits, { backgroundColor: colors.surface }]}
            >
              {benefits.map((benefit) => (
                <View key={benefit} style={styles.benefit}>
                  <View
                    style={[
                      styles.check,
                      { backgroundColor: colors.primarySoft },
                    ]}
                  >
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={colors.primary}
                    />
                  </View>
                  <Text style={[styles.benefitText, { color: colors.text }]}>
                    {benefit}
                  </Text>
                </View>
              ))}
            </View>

            {!isActive &&
              plans.map((plan) => (
                <Pressable
                  key={plan.id}
                  onPress={() => setSelectedPlan(plan.id)}
                  style={[
                    styles.priceCard,
                    {
                      borderColor:
                        selectedPlan === plan.id
                          ? colors.primary
                          : colors.border,
                      backgroundColor: colors.surface,
                    },
                  ]}
                >
                  <View>
                    <Text
                      style={[styles.priceLabel, { color: colors.textMuted }]}
                    >
                      {plan.label.toUpperCase()}{" "}
                      {plan.note ? `· ${plan.note.toUpperCase()}` : ""}
                    </Text>
                    <Text style={[styles.price, { color: colors.text }]}>
                      {plan.price}
                    </Text>
                  </View>
                  <Ionicons
                    name={
                      selectedPlan === plan.id
                        ? "radio-button-on"
                        : "radio-button-off"
                    }
                    size={24}
                    color={colors.primary}
                  />
                </Pressable>
              ))}

            <Pressable
              disabled={isProcessing}
              onPress={isActive ? handleCancel : handleSubscribe}
              style={[
                styles.upgrade,
                {
                  backgroundColor: isActive ? "#C4473A" : colors.primary,
                  opacity: isProcessing ? 0.7 : 1,
                },
              ]}
            >
              {isProcessing ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.upgradeText}>
                  {isActive
                    ? "Cancel Pro (testing)"
                    : `Start ${selectedPlan} plan`}
                </Text>
              )}
            </Pressable>

            {isActive && subscription?.currentPeriodEnd && (
              <Text style={[styles.renewal, { color: colors.textMuted }]}>
                Renews{" "}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </Text>
            )}
            {!isActive && (
              <Text style={[styles.renewal, { color: colors.textMuted }]}>
                This is a test activation — real Google Play billing will
                replace this before launch.
              </Text>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
      <ActionSheetModal
        visible={!!statusModal}
        onRequestClose={() => setStatusModal(null)}
        icon={
          statusModal?.title.startsWith("Could not")
            ? "alert-circle-outline"
            : "checkmark-circle-outline"
        }
        title={statusModal?.title ?? ""}
        body={statusModal?.body ?? ""}
        actions={[{ label: "OK", onPress: () => setStatusModal(null) }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safe: { flex: 1 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    height: 62,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  close: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontFamily: fonts.sans, fontSize: 15, fontWeight: "800" },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  hero: { borderRadius: radius.lg, padding: spacing.xl, alignItems: "center" },
  crown: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    fontFamily: fonts.sans,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.8,
    marginTop: spacing.lg,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 30,
    lineHeight: 38,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  benefits: { borderRadius: radius.md, padding: spacing.md, gap: spacing.md },
  benefit: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  check: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  benefitText: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: "600",
  },
  priceCard: {
    borderWidth: 2,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceLabel: {
    fontFamily: fonts.sans,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  price: { fontFamily: fonts.serif, fontSize: 18, marginTop: 3 },
  upgrade: {
    height: 58,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  upgradeText: {
    color: "#FFF",
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: "800",
  },
  renewal: {
    fontFamily: fonts.sans,
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
  },
});
