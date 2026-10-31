import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TransactionType } from '../types';
export function QuickAddMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const openTransaction = (type: TransactionType) => {
    setOpen(false);
    router.push({ pathname: '/(tabs)/transactions/create', params: { type } });
  };
  const actions = [
    {
      label: 'Transferência',
      icon: 'repeat' as const,
      color: '#475467',
      press: () => {
        setOpen(false);
        router.push('/transfer');
      },
    },
    {
      label: 'Nova despesa',
      icon: 'arrow-down-right' as const,
      color: '#B42318',
      press: () => openTransaction(TransactionType.EXPENSE),
    },
    {
      label: 'Nova receita',
      icon: 'arrow-up-right' as const,
      color: '#047857',
      press: () => openTransaction(TransactionType.INCOME),
    },
    {
      label: 'Nova conta',
      icon: 'credit-card' as const,
      color: '#1D67C1',
      press: () => {
        setOpen(false);
        router.push('/accounts/create');
      },
    },
  ];
  return (
    <>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Novo registro"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        className="flex-1 items-center justify-center"
        style={{ minHeight: 56 }}
      >
        <View
          className="mb-1 items-center justify-center rounded-lg bg-[#047857]"
          style={{ width: 38, height: 30 }}
        >
          <Feather name="edit-3" size={20} color="#FFFFFF" />
        </View>
        <Text className="text-center text-[10px] font-semibold text-[#047857]">
          Novo registro
        </Text>
      </TouchableOpacity>
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View className="flex-1 justify-end">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Fechar menu de registro"
            onPress={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <View
            accessibilityViewIsModal
            className="rounded-t-lg border-t border-[#E4E7EC] bg-white px-5 pt-5"
            style={{ paddingBottom: Math.max(16, insets.bottom) }}
          >
            <View className="mb-3 flex-row items-center justify-between">
              <Text
                accessibilityRole="header"
                className="text-xl font-bold text-[#101828]"
              >
                Novo registro
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Fechar"
                onPress={() => setOpen(false)}
                className="h-11 w-11 items-center justify-center"
              >
                <Feather name="x" size={22} color="#667085" />
              </TouchableOpacity>
            </View>
            {actions.map((action) => (
              <TouchableOpacity
                key={action.label}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                onPress={action.press}
                className="flex-row items-center border-t border-[#EAECF0] py-5"
              >
                <Feather name={action.icon} size={22} color={action.color} />
                <Text className="ml-4 flex-1 text-base font-semibold text-[#344054]">
                  {action.label}
                </Text>
                <Feather name="chevron-right" size={20} color="#667085" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
}
