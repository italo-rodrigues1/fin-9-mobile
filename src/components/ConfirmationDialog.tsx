import { Modal, Pressable, Text, View } from 'react-native';
import { useConfirmationStore } from '../stores/confirmationStore';
import { Button } from './ui/Button';
export function ConfirmationDialog() {
  const { request, answer } = useConfirmationStore();
  if (!request) return null;
  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={() => answer(false)}
    >
      <View className="flex-1 items-center justify-center px-6">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancelar confirmação"
          onPress={() => answer(false)}
          className="absolute inset-0 bg-black/40"
        />
        <View
          accessibilityViewIsModal
          className="w-full max-w-[440px] rounded-lg bg-white p-6"
        >
          <Text
            accessibilityRole="header"
            className="text-xl font-bold text-[#101828]"
          >
            {request.title}
          </Text>
          <Text className="mb-6 mt-3 text-base leading-6 text-[#475467]">
            {request.message}
          </Text>
          <Button title={request.confirmText} onPress={() => answer(true)} />
          <View className="mt-3">
            <Button
              title="Cancelar"
              variant="secondary"
              onPress={() => answer(false)}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
