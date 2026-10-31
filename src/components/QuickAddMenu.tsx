import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants';
import { TransactionType } from '../types';

export function QuickAddMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const openTransaction = (type: TransactionType) => {
    setIsOpen(false);
    router.push({
      pathname: '/(tabs)/transactions/create',
      params: { type },
    });
  };

  const actions = [
    {
      key: 'expense',
      label: 'Nova Despesa',
      icon: <Feather name="credit-card" size={18} color="#FF5A52" />,
      iconBackground: '#FFF1F1',
      onPress: () => openTransaction(TransactionType.EXPENSE),
    },
    {
      key: 'income',
      label: 'Nova Receita',
      icon: <Feather name="credit-card" size={18} color="#169670" />,
      iconBackground: '#EAFBF0',
      onPress: () => openTransaction(TransactionType.INCOME),
    },
    {
      key: 'account',
      label: 'Nova Conta',
      icon: <MaterialCommunityIcons name="bank-outline" size={18} color="#1D67C1" />,
      iconBackground: '#EAF2FF',
      onPress: () => {
        setIsOpen(false);
        router.push('/accounts/create');
      },
    },
  ];

  const buttonBottom = Math.max(20, insets.bottom + 20);

  return (
    <>
      {isOpen ? (
        <Pressable
          onPress={() => setIsOpen(false)}
          accessibilityLabel="Fechar menu de cadastro"
          className="absolute inset-0 bg-black/10"
          style={{ zIndex: 20 }}
        />
      ) : null}

      {isOpen ? (
        <View
          className="absolute right-4 w-[176px] rounded-[24px] bg-white px-4 py-3 shadow-sm"
          style={{ bottom: buttonBottom + 68, elevation: 8, zIndex: 30 }}
        >
          {actions.map((action) => (
            <TouchableOpacity
              key={action.key}
              onPress={action.onPress}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              className="flex-row items-center py-3"
            >
              <View
                className="mr-3 h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: action.iconBackground }}
              >
                {action.icon}
              </View>
              <Text className="text-[15px] font-medium text-[#344054]">{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      <TouchableOpacity
        onPress={() => setIsOpen((current) => !current)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={isOpen ? 'Fechar menu de cadastro' : 'Abrir menu de cadastro'}
        className="absolute right-4 h-14 w-14 items-center justify-center rounded-full"
        style={{
          backgroundColor: COLORS.primary,
          bottom: buttonBottom,
          elevation: 9,
          zIndex: 40,
        }}
      >
        <Text className="mb-[2px] text-3xl text-white">{isOpen ? '×' : '+'}</Text>
      </TouchableOpacity>
    </>
  );
}
