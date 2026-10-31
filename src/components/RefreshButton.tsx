import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity } from 'react-native';
import { LoadingSkeleton } from './LoadingSkeleton';
export function RefreshButton({
  onPress,
  loading = false,
}: {
  onPress: () => void;
  loading?: boolean;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Atualizar informações"
      accessibilityState={{ disabled: loading, busy: loading }}
      disabled={loading}
      onPress={onPress}
      className="min-h-11 flex-row items-center justify-center rounded-lg border border-[#E4E7EC] bg-white px-3"
    >
      {loading ? (
        <LoadingSkeleton variant="button" label="Atualizando informações" />
      ) : (
        <>
          <Feather name="refresh-cw" size={16} color="#047857" />
          <Text className="ml-2 text-xs font-semibold text-[#047857]">
            Atualizar
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
