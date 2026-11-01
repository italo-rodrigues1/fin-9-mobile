import { useTheme } from '../theme/ThemeProvider';
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
  const theme = useTheme();
  const change = (offset: number) => {
    const date = new Date(year, month - 1 + offset, 1);
    onChange({ month: date.getMonth() + 1, year: date.getFullYear() });
  };
  return (
    <View className="mb-4 flex-row items-center justify-between rounded-lg border border-app-border bg-app-surface px-2 py-1">
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Mês anterior"
        onPress={() => change(-1)}
        className="h-11 w-11 items-center justify-center"
      >
        <Feather
          name="chevron-left"
          size={22}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>
      <Text className="font-semibold capitalize text-app-text">
        {getMonthName(month)} {year}
      </Text>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Próximo mês"
        onPress={() => change(1)}
        className="h-11 w-11 items-center justify-center"
      >
        <Feather
          name="chevron-right"
          size={22}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
}
