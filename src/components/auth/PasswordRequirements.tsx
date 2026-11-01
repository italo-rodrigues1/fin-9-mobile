import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export function PasswordRequirements({ password }: { password: string }) {
  const { colors } = useTheme();
  const requirements = [
    { label: 'Mínimo de 8 caracteres', met: password.length >= 8 },
    { label: 'Uma letra maiúscula', met: /[A-Z]/.test(password) },
    { label: 'Um número', met: /[0-9]/.test(password) },
  ];
  return (
    <View style={styles.list}>
      {requirements.map(({ label, met }) => (
        <View
          key={label}
          accessible
          accessibilityLabel={`${label}: ${met ? 'atendido' : 'pendente'}`}
          style={styles.row}
        >
          <Feather
            name={met ? 'check-circle' : 'circle'}
            size={14}
            color={met ? colors.success : colors.textMuted}
          />
          <Text
            style={[
              styles.text,
              { color: met ? colors.success : colors.textMuted },
            ]}
          >
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 4, marginTop: -6, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  text: { fontSize: 12, lineHeight: 17, flexShrink: 1 },
});
