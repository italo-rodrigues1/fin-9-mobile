export const GOOGLE_UNAVAILABLE_MESSAGE =
  'O login com Google está indisponível no momento. Entre com e-mail e senha.';

const CLIENT_ID_PATTERN = /^[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/;

export function getGoogleConfiguration(platform: string): {
  webClientId: string;
  iosClientId?: string;
} {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();

  if (!webClientId || !CLIENT_ID_PATTERN.test(webClientId)) {
    throw new Error(GOOGLE_UNAVAILABLE_MESSAGE);
  }
  if (
    platform === 'ios' &&
    (!iosClientId || !CLIENT_ID_PATTERN.test(iosClientId))
  ) {
    throw new Error(GOOGLE_UNAVAILABLE_MESSAGE);
  }
  return { webClientId, ...(iosClientId ? { iosClientId } : {}) };
}
