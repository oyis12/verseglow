import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fonts, radius, spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

export type SelectOption = { label: string; value: string; subtitle?: string };

export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select',
  searchable = false,
  disabled = false,
  loading = false,
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  loading?: boolean;
}) {
  const { colors } = useAppTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = options.find((item) => item.value === value);
  const filtered = useMemo(
    () => options.filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase())),
    [options, query],
  );

  return (
    <>
      <Pressable
        disabled={disabled || loading}
        onPress={() => setOpen(true)}
        style={[
          styles.field,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: disabled ? 0.5 : 1,
          },
        ]}>
        <View style={styles.fieldCopy}>
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{label}</Text>
          <Text numberOfLines={1} style={[styles.fieldValue, { color: colors.text }]}>
            {loading ? 'Loading…' : selected?.label ?? placeholder}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
          <SafeAreaView
            edges={['bottom']}
            style={[styles.sheet, { backgroundColor: colors.background }]}>
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={[styles.sheetEyebrow, { color: colors.primary }]}>CHOOSE</Text>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>{label}</Text>
              </View>
              <Pressable
                accessibilityLabel="Close selector"
                onPress={() => setOpen(false)}
                style={[styles.close, { backgroundColor: colors.surface }]}>
                <Ionicons name="close" size={21} color={colors.text} />
              </Pressable>
            </View>

            {searchable && (
              <View style={[styles.search, { backgroundColor: colors.surface }]}>
                <Ionicons name="search-outline" size={19} color={colors.textMuted} />
                <TextInput
                  autoFocus
                  value={query}
                  onChangeText={setQuery}
                  placeholder={`Search ${label.toLowerCase()}`}
                  placeholderTextColor={colors.textMuted}
                  style={[styles.searchInput, { color: colors.text }]}
                />
              </View>
            )}

            <FlatList
              data={filtered}
              keyExtractor={(item) => item.value}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const active = item.value === value;
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item.value);
                      setQuery('');
                      setOpen(false);
                    }}
                    style={[
                      styles.option,
                      {
                        backgroundColor: active ? colors.primarySoft : colors.surface,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}>
                    <View style={styles.optionCopy}>
                      <Text style={[styles.optionTitle, { color: colors.text }]}>{item.label}</Text>
                      {item.subtitle && (
                        <Text style={[styles.optionSubtitle, { color: colors.textMuted }]}>
                          {item.subtitle}
                        </Text>
                      )}
                    </View>
                    {active && <Ionicons name="checkmark-circle" size={23} color={colors.primary} />}
                  </Pressable>
                );
              }}
            />
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: 68,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fieldCopy: { flex: 1, gap: 5 },
  fieldLabel: { fontFamily: fonts.sans, fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },
  fieldValue: { fontFamily: fonts.sans, fontSize: 16, fontWeight: '700' },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.46)',
  },
  sheet: {
    height: '76%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: spacing.lg,
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#888',
    opacity: 0.45,
    alignSelf: 'center',
    marginTop: 10,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  sheetEyebrow: { fontFamily: fonts.sans, fontSize: 9, fontWeight: '800', letterSpacing: 1.8 },
  sheetTitle: { fontFamily: fonts.serif, fontSize: 27, marginTop: 3 },
  close: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  search: {
    height: 50,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: { flex: 1, fontFamily: fonts.sans, fontSize: 15 },
  list: { gap: spacing.sm, paddingBottom: spacing.xl },
  option: {
    minHeight: 62,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionCopy: { flex: 1, gap: 3 },
  optionTitle: { fontFamily: fonts.sans, fontSize: 15, fontWeight: '700' },
  optionSubtitle: { fontFamily: fonts.sans, fontSize: 11, lineHeight: 16 },
});
