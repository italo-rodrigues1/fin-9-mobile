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
      className="m-4 rounded-lg border border-app-border bg-app-surface p-5"
      accessibilityLiveRegion="polite"
    >
      <Text className="mb-4 text-app-danger">{error}</Text>
      <Button title="Tentar novamente" onPress={retry} />
    </View>
  );
}
