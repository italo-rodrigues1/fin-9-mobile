import { useConfirmationStore } from '../stores/confirmationStore';
export function confirmAction(
  title: string,
  message: string,
  confirmText = 'Confirmar',
): Promise<boolean> {
  return useConfirmationStore.getState().ask(title, message, confirmText);
}
