import { FontAwesome } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export function GoogleButton() {
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
      <TouchableOpacity
        disabled
        accessibilityRole="button"
        accessibilityLabel="Continuar com Google, em breve"
        accessibilityState={{ disabled: true }}
        style={[
          styles.button,
          { borderColor: colors.border, backgroundColor: colors.surface },
        ]}
      >
        <FontAwesome name="google" size={18} color={colors.text} />
        <Text style={[styles.label, { color: colors.text }]}>Google</Text>
        <Text style={[styles.soon, { color: colors.textMuted }]}>Em breve</Text>
      </TouchableOpacity>
    </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  label: { fontSize: 14, fontWeight: '600' },
  soon: { fontSize: 11 },
});
