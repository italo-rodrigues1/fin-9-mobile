import { create } from 'zustand';
export const useFeedbackStore = create<{
  message: string;
  show: (message: string) => void;
  clear: () => void;
}>((set) => ({
  message: '',
  show: (message) => set({ message }),
  clear: () => set({ message: '' }),
}));
export const notify = (message: string) =>
  useFeedbackStore.getState().show(message);
