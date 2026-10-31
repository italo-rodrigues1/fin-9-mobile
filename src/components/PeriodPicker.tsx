import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { getMonthName } from '../utils/format';
export function PeriodPicker({
  month,
  year,
  onChange,
}: {
  month: number;
  year: number;
  onChange: (value: { month: number; year: number }) => void;
}) {
  const change = (offset: number) => {
    const date = new Date(year, month - 1 + offset, 1);
    onChange({ month: date.getMonth() + 1, year: date.getFullYear() });
  };
  return (
    <View className="mb-4 flex-row items-center justify-between rounded-lg border border-[#E4E7EC] bg-white px-2 py-1">
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Mês anterior"
        onPress={() => change(-1)}
        className="h-11 w-11 items-center justify-center"
      >
        <Feather name="chevron-left" size={22} color="#475467" />
      </TouchableOpacity>
      <Text className="font-semibold capitalize text-[#344054]">
        {getMonthName(month)} {year}
      </Text>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Próximo mês"
        onPress={() => change(1)}
        className="h-11 w-11 items-center justify-center"
      >
        <Feather name="chevron-right" size={22} color="#475467" />
      </TouchableOpacity>
    </View>
  );
}
