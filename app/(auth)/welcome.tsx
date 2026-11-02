import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { WelcomeArtwork } from '../../src/components/welcome/WelcomeArtwork';
import { useWelcomeMotion } from '../../src/components/welcome/useWelcomeMotion';

const INK = '#0B1210';
const LIME = '#D5F588';

export default function WelcomeScreen() {
  const router = useRouter();
  const { width, height, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { hero, copy, drift, isFocused } = useWelcomeMotion();
  const pageWidth = Math.min(width, 480);
  const availableHeight = height - insets.top - insets.bottom;
  const compact = availableHeight < 780;
  const artworkScale = Math.min(
    (pageWidth - 24) / 360,
    compact ? 0.78 : 0.98,
    Math.max(0.5, (availableHeight - 470) / 360),
  );
  const titleSize = Math.min(46, (pageWidth - 56) * 0.125, 58 / fontScale);

  const reveal = (progress: Animated.Value, distance = 22) => ({
    opacity: progress,
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [distance, 0],
        }),
      },
    ],
  });

  return (
    <SafeAreaView style={styles.screen}>
      {isFocused ? <StatusBar style="light" /> : null}
      <View pointerEvents="none" style={styles.ambient} />
      <View style={[styles.page, compact && styles.compactPage]}>
        <View style={styles.header}>
          <View style={styles.brand} accessible accessibilityLabel="Fin-9">
            <Image
              source={require('../../assets/icon.png')}
              style={styles.brandMark}
              resizeMode="contain"
              accessible={false}
            />
            <Text style={styles.brandName}>
              Fin-9<Text style={styles.brandDot}>.</Text>
            </Text>
          </View>
          {width >= 350 && fontScale <= 1.2 ? (
            <View style={styles.headerTag}>
              <View style={styles.tagDot} />
              <Text style={styles.headerTagText}>NO SEU CONTROLE</Text>
            </View>
          ) : null}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={false}
        >
          <Animated.View style={[styles.artwork, reveal(hero, 32)]}>
            <WelcomeArtwork scale={artworkScale} drift={drift} />
          </Animated.View>

          <Animated.View style={[styles.copy, reveal(copy)]}>
            <View style={styles.eyebrowRow}>
              <View style={styles.eyebrowLine} />
              <Text style={styles.eyebrow}>
                MENOS LIMITES. MAIS POSSIBILIDADES.
              </Text>
            </View>
            <Text
              accessibilityRole="header"
              style={[
                styles.title,
                { fontSize: titleSize, lineHeight: titleSize * 1.09 },
              ]}
            >
              Seu dinheiro.{'\n'}
              Suas escolhas.{'\n'}
              <Text style={styles.titleAccent}>Seu próximo nível.</Text>
            </Text>
            <Text style={styles.description}>
              Contas, cartões e metas em um só lugar.{'\n'}
              Mais clareza para viver o que importa.
            </Text>
          </Animated.View>
        </ScrollView>
        <View style={styles.actions}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Começar agora, criar uma conta"
            onPress={() => router.push('/(auth)/register')}
            activeOpacity={0.85}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Começar agora</Text>
            <View style={styles.buttonArrow}>
              <Feather name="arrow-up-right" size={22} color={INK} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Já tenho conta, entrar"
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.75}
            style={styles.loginButton}
          >
            <Text style={styles.loginText}>
              Já tem uma conta? <Text style={styles.loginLink}>Entrar</Text>
            </Text>
            <Feather name="arrow-right" size={15} color={LIME} />
          </TouchableOpacity>
          <View style={styles.footer}>
            <Feather name="lock" size={11} color="#A0ADA4" />
            <Text style={styles.footerText}>
              Sua vida financeira merece esse cuidado.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: INK },
  ambient: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100%',
    height: 560,
    backgroundImage:
      'radial-gradient(ellipse at 85% 22%, rgba(60, 104, 54, 0.18) 0%, rgba(11, 18, 16, 0) 70%)',
  },
  scroll: { flex: 1, marginHorizontal: -28 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 28,
    paddingBottom: 4,
  },
  page: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 22,
    paddingBottom: 18,
  },
  compactPage: { paddingTop: 16, paddingBottom: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 11,
  },
  brandName: {
    fontSize: 27,
    fontWeight: '700',
    color: '#F5F7EF',
    letterSpacing: -1.3,
  },
  brandDot: { color: LIME },
  headerTag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tagDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: LIME },
  headerTagText: {
    color: '#A7B3A7',
    fontSize: 8,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  artwork: { marginHorizontal: -28, marginTop: 8, marginBottom: 2 },
  copy: { marginTop: 0 },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  eyebrowLine: { width: 17, height: 1, backgroundColor: LIME },
  eyebrow: {
    color: '#B8CBAB',
    fontSize: 8,
    letterSpacing: 1.4,
    fontWeight: '600',
    flexShrink: 1,
  },
  title: { color: '#F4F5EF', fontWeight: '500', letterSpacing: -2.3 },
  titleAccent: { color: LIME },
  description: {
    color: '#A5B1A9',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 18,
  },
  actions: {
    marginTop: 6,
    paddingTop: 4,
    flexShrink: 0,
  },
  primaryButton: {
    minHeight: 62,
    backgroundColor: LIME,
    borderRadius: 18,
    paddingLeft: 23,
    paddingRight: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  primaryButtonText: {
    color: INK,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: -0.3,
    flexShrink: 1,
  },
  buttonArrow: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(11, 18, 16, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  loginText: {
    color: '#AAB5AE',
    fontSize: 13,
    flexShrink: 1,
    textAlign: 'center',
  },
  loginLink: { color: '#F2F4EA', fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  footerText: { color: '#A0ADA4', fontSize: 10, flexShrink: 1 },
});
