import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform, TurboModuleRegistry, type TurboModule } from 'react-native';
import { getGoogleConfiguration } from './googleConfig';

type GoogleSdk = typeof import('@react-native-google-signin/google-signin');
let sdk: GoogleSdk | undefined;

async function getSdk(): Promise<GoogleSdk> {
  const configuration = getGoogleConfiguration(Platform.OS);
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    throw new Error(
      'Para entrar com Google, use uma versão instalada do fin-9. O Expo Go não oferece esse recurso.',
    );
  }
  if (!sdk) {
    // Metro can report a fatal error while evaluating the SDK's getEnforcing(),
    // before a rejected dynamic import reaches our catch. Check without throwing first.
    if (!TurboModuleRegistry.get<TurboModule>('RNGoogleSignin')) {
      throw new Error(
        'Esta versão do fin-9 não inclui o login com Google. Instale uma nova build do aplicativo para continuar.',
      );
    }
    try {
      const loaded = await import('@react-native-google-signin/google-signin');
      loaded.GoogleSignin.configure({ ...configuration, offlineAccess: false });
      sdk = loaded;
    } catch {
      throw new Error(
        'Atualize a versão instalada do fin-9 para entrar com Google.',
      );
    }
  }
  return sdk;
}

export const googleAuth = {
  async signIn(): Promise<string | null> {
    const { GoogleSignin, statusCodes, isErrorWithCode } = await getSdk();
    try {
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });
      }
      // Remove only the app's cached Google selection, so a new attempt can choose another account.
      await GoogleSignin.signOut();
      const result = await GoogleSignin.signIn();
      if (result.type === 'cancelled') return null;
      if (!result.data.idToken) throw new Error('Missing Google ID token');
      return result.data.idToken;
    } catch (error) {
      if (isErrorWithCode(error)) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) return null;
        if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          throw new Error(
            'Atualize o Google Play Services para entrar com Google.',
          );
        }
        if (error.code === statusCodes.IN_PROGRESS) {
          throw new Error(
            'Já existe uma tentativa de login com Google em andamento.',
          );
        }
      }
      throw new Error('Não foi possível entrar com Google. Tente novamente.');
    }
  },

  async signOut(): Promise<void> {
    // Do not load a native module just to end an email/password session.
    if (sdk) await sdk.GoogleSignin.signOut();
  },
};
