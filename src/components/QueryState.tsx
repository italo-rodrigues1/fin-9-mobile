import { ActivityIndicator, Text, View } from 'react-native';
import { Button } from './ui/Button';
export function QueryState({
  loading,
  error,
  retry,
}: {
  loading?: boolean;
  error?: string | null;
  retry: () => void;
}) {
  if (!loading && !error) return null;
  return (
    <View
      className="m-4 rounded-lg border border-[#D0D5DD] bg-white p-5"
      accessibilityLiveRegion="polite"
    >
      {loading ? (
        <>
          <ActivityIndicator color="#047857" />
          <Text className="mt-3 text-center text-[#475467]">
            Carregando informações...
          </Text>
        </>
      ) : (
        <>
          <Text className="mb-4 text-[#B42318]">{error}</Text>
          <Button title="Tentar novamente" onPress={retry} />
        </>
      )}
    </View>
  );
}
