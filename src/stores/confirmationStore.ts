import { create } from 'zustand';
type Request = {
  title: string;
  message: string;
  confirmText: string;
  resolve: (confirmed: boolean) => void;
};
interface ConfirmationState {
  request: Request | null;
  ask: (
    title: string,
    message: string,
    confirmText: string,
  ) => Promise<boolean>;
  answer: (confirmed: boolean) => void;
}
export const useConfirmationStore = create<ConfirmationState>((set, get) => ({
  request: null,
  ask: (title, message, confirmText) => {
    if (get().request) return Promise.resolve(false);
    return new Promise<boolean>((resolve) =>
      set({ request: { title, message, confirmText, resolve } }),
    );
  },
  answer: (confirmed) => {
    const request = get().request;
    if (!request) return;
    set({ request: null });
    request.resolve(confirmed);
  },
}));
