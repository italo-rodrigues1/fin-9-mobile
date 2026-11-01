import { useCallback, useState, type ReactNode } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BackButton } from '../BackButton';
import { KeyboardScreen, KeyboardScrollView } from '../KeyboardForm';
import { useTheme } from '../../theme/ThemeProvider';

interface AuthScreenProps {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  registration?: boolean;
}

export function AuthScreen({
  title,
  subtitle,
  children,
  registration = false,
}: AuthScreenProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [focused, setFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  return (
    <KeyboardScreen
      edges={['left', 'right', 'bottom']}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      {focused ? <StatusBar style="light" /> : null}
      <View
        style={{ height: insets.top, backgroundColor: colors.primaryDark }}
      />
      <KeyboardScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.page}>
          <View
            style={[
              styles.hero,
              {
                paddingTop: registration ? 28 : 52,
                paddingBottom: registration ? 64 : 76,
                backgroundColor: colors.primaryDark,
                backgroundImage: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 100%)`,
              },
            ]}
          >
            <View
              pointerEvents="none"
              accessible={false}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={StyleSheet.absoluteFill}
            >
              <View style={styles.upperCircle} />
              <View style={styles.lowerCircle} />
            </View>
            <View style={styles.back}>
              <BackButton
                color={colors.onPrimary}
                backgroundColor="rgba(255,255,255,0.14)"
                fallbackHref={
                  registration ? '/(auth)/login' : '/(auth)/welcome'
                }
              />
            </View>
            <View accessible accessibilityLabel="Fin-9" style={styles.brand}>
              <Image
                source={require('../../../assets/icon.png')}
                style={[styles.logo, registration && styles.compactLogo]}
                resizeMode="contain"
                accessible={false}
              />
              <Text style={[styles.brandName, { color: colors.onPrimary }]}>
                Fin-9.
              </Text>
            </View>
            <Text style={[styles.tagline, { color: colors.onPrimary }]}>
              Entenda para onde vai o seu dinheiro
            </Text>
          </View>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                boxShadow: isDark
                  ? '0 12px 32px rgba(0,0,0,0.22)'
                  : '0 12px 32px rgba(6,78,59,0.09)',
              },
            ]}
          >
            <Text
              accessibilityRole="header"
              style={[styles.title, { color: colors.text }]}
            >
              {title}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {subtitle}
            </Text>
            <View style={styles.form}>{children}</View>
          </View>
        </View>
      </KeyboardScrollView>
    </KeyboardScreen>
  );
}

export function AuthError({ message }: { message: string | null }) {
  const { colors } = useTheme();
  if (!message) return null;
  return (
    <View
      style={[
        styles.error,
        {
          backgroundColor: colors.dangerBackground,
          borderColor: colors.dangerBorder,
        },
      ]}
    >
      <Text
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={{ color: colors.danger, fontSize: 13, lineHeight: 20 }}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 36 },
  page: { width: '100%', maxWidth: 480, alignSelf: 'center' },
  hero: {
    alignItems: 'center',
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  upperCircle: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    right: -114,
    top: -108,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  lowerCircle: {
    position: 'absolute',
    width: 156,
    height: 156,
    borderRadius: 78,
    left: -84,
    bottom: -34,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  back: { position: 'absolute', left: 16, top: 16, zIndex: 1 },
  brand: { alignItems: 'center' },
  logo: { width: 64, height: 64, borderRadius: 16 },
  compactLogo: { width: 56, height: 56, borderRadius: 14 },
  brandName: {
    marginTop: 12,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -1,
  },
  tagline: { marginTop: 6, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  card: { marginHorizontal: 20, marginTop: -48, padding: 24, borderRadius: 20 },
  title: {
    textAlign: 'center',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  subtitle: { marginTop: 6, textAlign: 'center', fontSize: 13, lineHeight: 21 },
  form: { marginTop: 26 },
  error: { marginBottom: 16, padding: 12, borderWidth: 1, borderRadius: 8 },
});
