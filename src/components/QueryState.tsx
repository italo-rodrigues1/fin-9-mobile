import { Text, View } from 'react-native';
import { Button } from './ui/Button';
import { LoadingSkeleton } from './LoadingSkeleton';
export function QueryState({
  loading,
  error,
  retry,
}: {
  loading?: boolean;
  error?: string | null;
  retry: () => void;
}) {
  if (loading) return <LoadingSkeleton />;
  if (!error) return null;
  return (
    <View
      className="m-4 rounded-lg border border-[#D0D5DD] bg-white p-5"
      accessibilityLiveRegion="polite"
    >
      <Text className="mb-4 text-[#B42318]">{error}</Text>
      <Button title="Tentar novamente" onPress={retry} />
    </View>
  );
}
