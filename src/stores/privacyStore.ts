import { create } from 'zustand';
export const usePrivacyStore = create<{
  showValues: boolean;
  toggle: () => void;
}>((set) => ({
  showValues: true,
  toggle: () => set((state) => ({ showValues: !state.showValues })),
}));
