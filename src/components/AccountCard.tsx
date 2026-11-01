import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Account } from '../types';
import { ACCOUNT_ICON_OPTIONS } from '../constants';
import { getInstitutionLogo } from '../constants/institutions';
import { usePrivacyStore } from '../stores/privacyStore';
import { formatCurrency } from '../utils/format';
import { WalletCardAmount } from './WalletCardAmount';
import {
  WalletCardSurface,
  walletCardColors as colors,
} from './WalletCardSurface';
import {
  WalletCardAction,
  WalletCardPrivacy,
  WalletCardStatus,
} from './WalletCardControls';

export function AccountCard({
  account,
  compact = false,
  onPress,
  onTransfer,
  onEdit,
}: {
  account: Account;
  compact?: boolean;
  onPress?: () => void;
  onTransfer?: () => void;
  onEdit?: () => void;
}) {
  const show = usePrivacyStore((state) => state.showValues);
  const logo = getInstitutionLogo(account.institution);
  const icon = ACCOUNT_ICON_OPTIONS.includes(account.icon)
    ? account.icon
    : 'bank-outline';
  return (
    <WalletCardSurface
      color={account.color}
      style={compact ? styles.compact : styles.container}
    >
      <View style={styles.header}>
        <View style={styles.identity}>
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[styles.symbol, logo ? styles.logoBackground : undefined]}
          >
            {logo ? (
              <Image
                source={logo}
                style={styles.logo}
                resizeMode="contain"
                accessible={false}
              />
            ) : (
              <MaterialCommunityIcons
                name={
                  icon as React.ComponentProps<
                    typeof MaterialCommunityIcons
                  >['name']
                }
                size={23}
                color={colors.text}
              />
            )}
          </View>
          <View style={styles.nameGroup}>
            <Text style={styles.institution}>{account.institution}</Text>
            <Text style={styles.name}>{account.name}</Text>
          </View>
        </View>
        <WalletCardPrivacy />
      </View>
      {account.isArchived ? <WalletCardStatus title="Arquivada" /> : null}
      <TouchableOpacity
        accessible={Boolean(onPress)}
        disabled={!onPress}
        onPress={onPress}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={
          onPress
            ? `Detalhes da conta ${account.name}. Saldo atual: ${show ? formatCurrency(account.balance) : 'oculto'}.`
            : undefined
        }
        activeOpacity={0.8}
        style={styles.balanceArea}
      >
        <Text style={styles.label}>Saldo atual</Text>
        <WalletCardAmount value={account.balance} size={compact ? 28 : 32} />
      </TouchableOpacity>
      <View style={styles.footer}>
        <Text style={styles.accountLabel}>CONTA · {account.institution}</Text>
        {onPress || onTransfer || onEdit ? (
          <View style={styles.actions}>
            {onPress ? (
              <WalletCardAction
                title="Ver extrato"
                icon="arrow-up-right"
                onPress={onPress}
              />
            ) : null}
            {onTransfer && !account.isArchived ? (
              <WalletCardAction
                title="Transferir"
                icon="repeat"
                onPress={onTransfer}
              />
            ) : null}
            {onEdit ? (
              <WalletCardAction
                title="Editar conta"
                icon="edit-2"
                onPress={onEdit}
              />
            ) : null}
          </View>
        ) : null}
      </View>
    </WalletCardSurface>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  compact: { width: 280, marginRight: 12 },
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
    overflow: 'hidden',
  },
  logoBackground: { backgroundColor: '#FFFFFF' },
  logo: { width: 42, height: 42 },
  nameGroup: { flex: 1 },
  institution: {
    color: colors.muted,
    fontSize: 9,
    lineHeight: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  name: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    marginTop: 3,
  },
  balanceArea: { paddingTop: 25, paddingBottom: 24 },
  label: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  footer: { borderTopWidth: 1, borderTopColor: colors.subtle, paddingTop: 13 },
  accountLabel: {
    color: colors.muted,
    fontSize: 9,
    lineHeight: 14,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
});
