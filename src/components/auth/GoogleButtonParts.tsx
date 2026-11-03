import type { ReactNode } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { LoadingSkeleton } from '../LoadingSkeleton';

export function GoogleButtonFrame({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <View style={styles.divider}>
        <View style={[styles.line, { backgroundColor: colors.border }]} />
        <Text style={[styles.dividerText, { color: colors.textMuted }]}>
          ou continue com
        </Text>
        <View style={[styles.line, { backgroundColor: colors.border }]} />
      </View>
      {children}
    </View>
  );
}

export function GoogleAction({
  onPress,
  isLoading = false,
}: {
  onPress: () => void;
  isLoading?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel="Continuar com Google"
      accessibilityState={{ disabled: isLoading, busy: isLoading }}
      style={[
        styles.button,
        { borderColor: colors.border, backgroundColor: colors.surface },
      ]}
    >
      {isLoading ? (
        <LoadingSkeleton variant="button" label="Entrando com Google" />
      ) : (
        <>
          <FontAwesome name="google" size={18} color={colors.text} />
          <Text style={[styles.label, { color: colors.text }]}>
            Continuar com Google
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24 },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  line: { height: 1, flex: 1 },
  dividerText: { fontSize: 12, lineHeight: 18 },
  button: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'center',
  },
});
