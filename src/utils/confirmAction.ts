import { Alert, Platform } from 'react-native';

export function confirmAction(
  title: string,
  message: string,
  confirmText = 'Confirmar',
): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(globalThis.window?.confirm(`${title}\n\n${message}`) ?? false);
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
      { text: confirmText, style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}
