import { Feather } from '@expo/vector-icons';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { CARD_BRAND_LABELS, CARD_BRAND_LOGOS } from '../constants/cardBrands';
import type { CreditCard } from '../types';
import { usePrivacyStore } from '../stores/privacyStore';
import { useTheme } from '../theme/ThemeProvider';
import { formatCurrency } from '../utils/format';
import { creditCardColor } from '../utils/walletCardAppearance';
import {
  WalletCardSurface,
  walletCardColors as colors,
} from './WalletCardSurface';
import {
  WalletCardAction,
  WalletCardPrivacy,
  WalletCardStatus,
} from './WalletCardControls';
import { WalletCardAmount } from './WalletCardAmount';

export function CreditCardSummary({
  card,
  onPress,
  onPurchase,
  onEdit,
  style,
  compact = false,
}: {
  card: CreditCard;
  onPress?: () => void;
  onPurchase?: () => void;
  onEdit?: () => void;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}) {
  const show = usePrivacyStore((s) => s.showValues);
  const theme = useTheme();
  const money = (value: number) => (show ? formatCurrency(value) : 'R$ ••••••');
  const usage =
    card.creditLimit > 0
      ? Math.max(0, Math.min(100, (card.usedLimit / card.creditLimit) * 100))
      : 0;
  return (
    <View style={[styles.container, style]}>
      <WalletCardSurface color={creditCardColor(card.name)}>
        <View style={styles.header}>
          <View style={styles.identity}>
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={styles.symbol}
            >
              <Feather name="credit-card" size={22} color={colors.text} />
            </View>
            <View style={styles.nameGroup}>
              <Text style={styles.eyebrow}>CARTÃO DE CRÉDITO</Text>
              <Text
                numberOfLines={compact ? 2 : undefined}
                style={[styles.name, compact && styles.compactName]}
              >
                {card.name}
              </Text>
            </View>
          </View>
          <WalletCardPrivacy />
        </View>
        {card.isArchived ? <WalletCardStatus title="Arquivado" /> : null}
        <TouchableOpacity
          accessible={Boolean(onPress)}
          disabled={!onPress}
          onPress={onPress}
          accessibilityRole={onPress ? 'button' : undefined}
          accessibilityLabel={
            onPress
              ? `Abrir cartão ${card.name}. Limite disponível: ${show ? formatCurrency(card.availableLimit) : 'oculto'}.`
              : undefined
          }
          activeOpacity={0.8}
          style={styles.balanceArea}
        >
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={styles.cardDetails}
          >
            <View
              accessible={false}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={styles.chip}
            >
              <View style={styles.chipVertical} />
              <View style={styles.chipHorizontal} />
              <View style={styles.chipCenter} />
            </View>
            <Feather
              name="wifi"
              size={21}
              color="rgba(255,255,255,0.66)"
              style={styles.contactless}
            />
          </View>
          <Text style={styles.label}>Limite disponível</Text>
          <WalletCardAmount value={card.availableLimit} size={30} />
        </TouchableOpacity>
        <View style={[styles.dates, compact && { gap: 10 }]}>
          <View style={styles.date}>
            <Text style={styles.dateLabel}>FECHAMENTO</Text>
            <Text style={styles.dateValue}>
              Dia {String(card.closingDay).padStart(2, '0')}
            </Text>
          </View>
          <View style={styles.date}>
            <Text style={styles.dateLabel}>VENCIMENTO</Text>
            <Text style={styles.dateValue}>
              Dia {String(card.dueDay).padStart(2, '0')}
            </Text>
          </View>
          {card.brand ? (
            <Image
              source={CARD_BRAND_LOGOS[card.brand]}
              accessibilityLabel={'Bandeira ' + CARD_BRAND_LABELS[card.brand]}
              accessible
              accessibilityRole="image"
              resizeMode="contain"
              style={styles.brand}
            />
          ) : (
            <Feather
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              name="credit-card"
              size={26}
              color="rgba(255,255,255,0.45)"
            />
          )}
        </View>
        {onPress || onPurchase || onEdit ? (
          <View style={styles.actions}>
            {onPress ? (
              <WalletCardAction
                title="Ver faturas"
                icon="arrow-up-right"
                onPress={onPress}
              />
            ) : null}
            {onPurchase && !card.isArchived ? (
              <WalletCardAction
                title="Nova compra"
                icon="plus"
                onPress={onPurchase}
              />
            ) : null}
            {onEdit ? (
              <WalletCardAction title="Editar" icon="edit-2" onPress={onEdit} />
            ) : null}
          </View>
        ) : null}
      </WalletCardSurface>
      <View style={styles.limits}>
        <View style={styles.limitRow}>
          <View style={styles.limitColumn}>
            <Text
              style={[styles.limitLabel, { color: theme.colors.textMuted }]}
            >
              Comprometido
            </Text>
            <Text style={[styles.limitValue, { color: theme.colors.text }]}>
              {money(card.usedLimit)}
            </Text>
          </View>
          <View style={[styles.limitColumn, styles.limitRight]}>
            <Text
              style={[styles.limitLabel, { color: theme.colors.textMuted }]}
            >
              Limite total
            </Text>
            <Text style={[styles.limitValue, { color: theme.colors.text }]}>
              {money(card.creditLimit)}
            </Text>
          </View>
        </View>
        {show ? (
          <View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel="Limite comprometido"
            accessibilityValue={{ min: 0, max: 100, now: Math.round(usage) }}
            style={[
              styles.track,
              { backgroundColor: theme.colors.surfaceLight },
            ]}
          >
            <View
              style={[
                styles.fill,
                {
                  width: `${usage}%`,
                  backgroundColor: theme.colors.primaryText,
                },
              ]}
            />
          </View>
        ) : (
          <Text style={[styles.hidden, { color: theme.colors.textMuted }]}>
            Valores e proporções ocultos.
          </Text>
        )}
        <Text style={[styles.note, { color: theme.colors.textMuted }]}>
          Inclui todas as parcelas ainda não pagas.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  compactName: { minHeight: 48 },
  brand: { width: 54, height: 36, borderRadius: 4 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 11, flex: 1 },
  symbol: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameGroup: { flex: 1 },
  eyebrow: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1.3,
  },
  name: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    marginTop: 3,
  },
  balanceArea: { marginTop: 10, paddingBottom: 18 },
  cardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 15,
  },
  chip: {
    width: 30,
    height: 24,
    borderRadius: 5,
    backgroundColor: '#C9BA8A',
    borderWidth: 1,
    borderColor: '#DFD1A6',
    overflow: 'hidden',
  },
  chipVertical: {
    position: 'absolute',
    left: 9,
    width: 10,
    height: 24,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#8C7D53',
  },
  chipHorizontal: {
    position: 'absolute',
    top: 10,
    width: 30,
    borderTopWidth: 1,
    borderColor: '#8C7D53',
  },
  chipCenter: {
    position: 'absolute',
    left: 7,
    top: 6,
    width: 14,
    height: 11,
    borderWidth: 1,
    borderRadius: 3,
    borderColor: '#8C7D53',
    backgroundColor: '#C9BA8A',
  },
  contactless: { transform: [{ rotate: '90deg' }] },
  label: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  dates: { flexDirection: 'row', alignItems: 'center', gap: 22 },
  date: { flex: 1 },
  dateLabel: {
    color: colors.muted,
    fontSize: 8,
    letterSpacing: 1.1,
    fontWeight: '600',
  },
  dateValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: 1,
    borderColor: colors.subtle,
    marginTop: 17,
    paddingTop: 14,
  },
  limits: { paddingHorizontal: 4, paddingTop: 13 },
  limitRow: { flexDirection: 'row', gap: 12 },
  limitColumn: { flex: 1 },
  limitRight: { alignItems: 'flex-end' },
  limitLabel: { fontSize: 11, lineHeight: 18 },
  limitValue: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  track: { height: 4, borderRadius: 2, overflow: 'hidden', marginTop: 10 },
  fill: { height: 4, borderRadius: 2 },
  hidden: { fontSize: 11, marginTop: 8 },
  note: { fontSize: 10, lineHeight: 16, marginTop: 6 },
});
