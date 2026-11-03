import { GOOGLE_UNAVAILABLE_MESSAGE } from './googleConfig';

interface GoogleCredential {
  credential: string;
}
interface GoogleIdentity {
  initialize(options: {
    client_id: string;
    callback: (response: GoogleCredential) => void;
    nonce: string;
    auto_select: boolean;
    button_auto_select: boolean;
    ux_mode: 'popup';
  }): void;
  renderButton(
    element: HTMLElement,
    options: {
      type: 'standard';
      theme: 'outline' | 'filled_black';
      size: 'large';
      text: 'continue_with';
      shape: 'rectangular';
      locale: 'pt-BR';
      width: number;
      click_listener: () => void;
    },
  ): void;
  disableAutoSelect(): void;
}

type GoogleWindow = Window & {
  google?: { accounts?: { id?: GoogleIdentity } };
};
const SCRIPT_URL = 'https://accounts.google.com/gsi/client';
let loading: Promise<GoogleIdentity> | undefined;
interface Receiver {
  credential: (idToken: string) => void;
  error: (error: Error) => void;
}
let current: Receiver | undefined;
let pending: Receiver | undefined;

export function getLoadedGoogleIdentity(): GoogleIdentity | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as GoogleWindow).google?.accounts?.id;
}

export function loadGoogleIdentity(): Promise<GoogleIdentity> {
  const ready = getLoadedGoogleIdentity();
  if (ready) return Promise.resolve(ready);
  if (loading) return loading;
  loading = new Promise<GoogleIdentity>((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error(GOOGLE_UNAVAILABLE_MESSAGE));
      return;
    }
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.defer = true;
    const fail = () => {
      clearTimeout(timeout);
      script.remove();
      reject(
        new Error(
          'Não foi possível carregar o Google. Verifique sua conexão e tente novamente.',
        ),
      );
    };
    const timeout = setTimeout(fail, 15000);
    script.onerror = fail;
    script.onload = () => {
      const client = getLoadedGoogleIdentity();
      if (!client) {
        fail();
        return;
      }
      clearTimeout(timeout);
      resolve(client);
    };
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    loading = undefined;
    throw error;
  });
  return loading;
}

export async function mountGoogleIdentityButton(
  element: HTMLElement,
  webClientId: string,
  dark: boolean,
  receiver: Receiver,
): Promise<() => void> {
  const client = await loadGoogleIdentity();
  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
  // A new mount starts a separate browser attempt. Reconfigure its nonce and callback
  // so a response from a previous screen cannot sign in the current screen.
  client.initialize({
    client_id: webClientId,
    nonce,
    auto_select: false,
    button_auto_select: false,
    ux_mode: 'popup',
    callback: ({ credential }) => {
      if (pending !== receiver || current !== receiver) return;
      try {
        // This checks the browser attempt only. Signature, issuer, audience and expiry are verified by the API.
        const claims = JSON.parse(
          atob(credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')),
        ) as { nonce?: string };
        if (claims.nonce !== nonce) return;
        pending = undefined;
        receiver.credential(credential);
      } catch {
        pending = undefined;
        receiver.error(
          new Error(
            'Não foi possível confirmar o login com Google. Tente novamente.',
          ),
        );
      }
    },
  });
  current = receiver;
  let disposed = false;
  const render = () => {
    if (disposed) return;
    element.replaceChildren();
    client.renderButton(element, {
      type: 'standard',
      theme: dark ? 'filled_black' : 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      locale: 'pt-BR',
      width: Math.max(200, Math.min(400, element.clientWidth)),
      click_listener: () => {
        if (current === receiver) pending = receiver;
      },
    });
  };
  render();
  const observer =
    typeof ResizeObserver === 'undefined'
      ? undefined
      : new ResizeObserver(render);
  observer?.observe(element);
  return () => {
    disposed = true;
    observer?.disconnect();
    element.replaceChildren();
    if (current === receiver) current = undefined;
    if (pending === receiver) pending = undefined;
  };
}
