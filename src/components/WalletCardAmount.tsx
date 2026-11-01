import { StyleSheet, Text } from 'react-native';
import { usePrivacyStore } from '../stores/privacyStore';
import { formatCurrency } from '../utils/format';

export function WalletCardAmount({
  value,
  size = 32,
}: {
  value: number;
  size?: number;
}) {
  const show = usePrivacyStore((state) => state.showValues);
  const formatted = show ? formatCurrency(value) : 'R$ ••••••';
  const fontSize = Math.min(
    size,
    formatted.length > 16 ? 22 : formatted.length > 13 ? 26 : size,
  );
  return (
    <Text
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.5}
      style={[styles.amount, { fontSize }]}
    >
      {formatted}
    </Text>
  );
}

const styles = StyleSheet.create({
  amount: {
    color: '#FFFFFF',
    fontWeight: '600',
    letterSpacing: -0.8,
    marginTop: 3,
    fontVariant: ['tabular-nums'],
  },
});
