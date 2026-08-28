import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { fonts, radius, spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

type VerseCardProps = {
  reference: string;
  translation: string;
  verse: string;
  insight: string;
};

export function VerseCard({ reference, translation, verse, insight }: VerseCardProps) {
  const { colors } = useAppTheme();

  return (
    <Animated.View entering={FadeInDown.duration(650).springify()}>
      <LinearGradient
        colors={[colors.cardStart, colors.cardEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}>
        <View style={styles.glow} />
        <View style={styles.meta}>
          <Text style={styles.reference}>{reference}</Text>
          <Text style={styles.translation}>{translation}</Text>
        </View>
        <Text style={styles.verse}>“{verse}”</Text>
        <View style={styles.rule} />
        <Text style={styles.eyebrow}>TODAY&apos;S INSIGHT</Text>
        <Text style={styles.insight}>{insight}</Text>
        <Text style={styles.brand}>DAILY INSIGHT</Text>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 430,
    borderRadius: radius.lg,
    padding: spacing.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(217,100,34,0.20)',
    top: -80,
    right: -70,
  },
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reference: { color: '#F0A15E', fontFamily: fonts.sans, fontSize: 15, fontWeight: '700' },
  translation: {
    color: '#D9D2C8',
    fontFamily: fonts.sans,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  verse: {
    color: '#FFF8ED',
    fontFamily: fonts.serif,
    fontSize: 31,
    lineHeight: 42,
    marginTop: spacing.xl,
  },
  rule: { width: 36, height: 2, backgroundColor: '#D96422', marginVertical: spacing.lg },
  eyebrow: {
    color: '#E8A46D',
    fontFamily: fonts.sans,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  insight: {
    color: '#E9E3DA',
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 25,
    marginTop: spacing.sm,
  },
  brand: {
    color: '#8F8A83',
    fontFamily: fonts.sans,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2.2,
    marginTop: 'auto',
  },
});
