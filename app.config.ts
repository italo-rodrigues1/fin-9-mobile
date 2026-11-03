import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();
  const plugins = [...(config.plugins ?? [])];

  // Android autolinks the module. This plugin adds the iOS callback URL scheme.
  if (iosClientId) {
    if (!/^[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(iosClientId)) {
      throw new Error(
        'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID deve ser um Client ID OAuth do tipo iOS.',
      );
    }
    plugins.push([
      '@react-native-google-signin/google-signin',
      { iosUrlScheme: iosClientId.split('.').reverse().join('.') },
    ]);
  }

  return {
    ...config,
    name: config.name ?? 'Fin-9',
    slug: config.slug ?? 'fin-9',
    plugins,
  };
};
