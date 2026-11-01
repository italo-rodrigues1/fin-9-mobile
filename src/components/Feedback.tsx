import { useEffect } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useFeedbackStore } from '../stores/feedbackStore';
export function Feedback() {
  const { message, clear } = useFeedbackStore();
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(clear, 5000);
    return () => clearTimeout(timer);
  }, [message, clear]);
  return message ? (
    <TouchableOpacity
      onPress={clear}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      className="absolute left-4 right-4 top-14 rounded-lg bg-app-inverse p-4"
      style={{ zIndex: 1000, elevation: 30 }}
    >
      <Text className="text-app-onInverse">{message}</Text>
    </TouchableOpacity>
  ) : null;
}
