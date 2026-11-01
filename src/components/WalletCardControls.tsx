import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { usePrivacyStore } from '../stores/privacyStore';
import { walletCardColors as colors } from './WalletCardSurface';

export function WalletCardPrivacy() {
  const { showValues, toggle } = usePrivacyStore();
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={showValues ? 'Ocultar valores' : 'Mostrar valores'}
      accessibilityHint="Aplica a todas as contas e cartões."
      onPress={toggle}
      activeOpacity={0.65}
      style={styles.iconButton}
    >
      <Feather
        name={showValues ? 'eye' : 'eye-off'}
        size={19}
        color={colors.text}
      />
    </TouchableOpacity>
  );
}

export function WalletCardAction({
  title,
  icon,
  onPress,
}: {
  title: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      activeOpacity={0.65}
      style={styles.action}
    >
      <Text style={styles.actionText}>{title}</Text>
      <Feather name={icon} size={16} color={colors.text} />
    </TouchableOpacity>
  );
}

export function WalletCardStatus({ title }: { title: string }) {
  return (
    <View style={styles.status}>
      <Text style={styles.statusText}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.control,
  },
  action: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.control,
  },
  actionText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
  },
  status: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    backgroundColor: colors.control,
    paddingVertical: 4,
    paddingHorizontal: 7,
  },
  statusText: { color: colors.muted, fontSize: 10, fontWeight: '600' },
});
