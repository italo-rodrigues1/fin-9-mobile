import { Feather } from '@expo/vector-icons';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';

export function WelcomeArtwork({
  scale,
  drift,
}: {
  scale: number;
  drift: Animated.Value;
}) {
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
      style={{ height: 340 * scale }}
    >
      <View style={[styles.stage, { transform: [{ scale }] }]}>
        <View style={styles.glow} />
        <View style={styles.orbit} />
        <View style={[styles.orbit, styles.orbitInner]} />
        <View style={styles.orbitDot} />

        <Animated.View
          style={[
            styles.backPosition,
            {
              transform: [
                {
                  translateY: drift.interpolate({
                    inputRange: [-1, 1],
                    outputRange: [6, -6],
                  }),
                },
                {
                  rotate: drift.interpolate({
                    inputRange: [-1, 1],
                    outputRange: ['-13deg', '-10deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.backCard}>
            <View style={styles.cardHeader}>
              <Text allowFontScaling={false} style={styles.backBrand}>
                Fin-9.
              </Text>
              <Feather name="arrow-up-right" size={18} color="#A9BFA3" />
            </View>
            <View style={styles.backBody}>
              <View>
                <Text allowFontScaling={false} style={styles.backLabel}>
                  PLANOS QUE GANHAM VIDA
                </Text>
                <Text allowFontScaling={false} style={styles.backTitle}>
                  O futuro começa{'\n'}com uma meta.
                </Text>
              </View>
              <View style={styles.goalRing}>
                <Text allowFontScaling={false} style={styles.goalPercent}>
                  75
                  <Text allowFontScaling={false} style={styles.percentSign}>
                    %
                  </Text>
                </Text>
              </View>
            </View>
            <View style={styles.backFooter}>
              <View style={styles.goalTrack}>
                <View style={styles.goalProgress} />
              </View>
              <Text allowFontScaling={false} style={styles.goalCaption}>
                Cada passo conta.
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.frontPosition,
            {
              transform: [
                {
                  translateY: drift.interpolate({
                    inputRange: [-1, 1],
                    outputRange: [-8, 8],
                  }),
                },
                {
                  rotate: drift.interpolate({
                    inputRange: [-1, 1],
                    outputRange: ['9deg', '12deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.frontCard}>
            <View style={styles.cardSheen} />
            <View style={styles.cardHeader}>
              <Text allowFontScaling={false} style={styles.frontBrand}>
                Fin-9.
              </Text>
              <Image
                source={require('../../../assets/icon.png')}
                style={styles.cardLogo}
                resizeMode="contain"
              />
            </View>
            <Text allowFontScaling={false} style={styles.balanceLabel}>
              SEU SALDO, SOB CONTROLE
            </Text>
            <Text allowFontScaling={false} style={styles.balance}>
              <Text allowFontScaling={false} style={styles.currency}>
                R${' '}
              </Text>
              8.450
              <Text allowFontScaling={false} style={styles.cents}>
                ,00
              </Text>
            </Text>
            <View style={styles.frontFooter}>
              <View>
                <Text allowFontScaling={false} style={styles.cardKicker}>
                  TUDO CONECTADO A VOCÊ
                </Text>
                <Text allowFontScaling={false} style={styles.cardCaption}>
                  Contas · Cartões · Metas
                </Text>
              </View>
              <View style={styles.bars}>
                {[13, 23, 19, 32, 40].map((height, index) => (
                  <View
                    key={index}
                    style={[
                      styles.bar,
                      { height, opacity: 0.28 + index * 0.16 },
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        </Animated.View>

        <Text allowFontScaling={false} style={[styles.spark, styles.sparkTop]}>
          ✦
        </Text>
        <Text
          allowFontScaling={false}
          style={[styles.spark, styles.sparkBottom]}
        >
          ✦
        </Text>
        <View style={styles.smallSpark} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    width: 360,
    height: 340,
    position: 'absolute',
    left: '50%',
    marginLeft: -180,
    top: 0,
    transformOrigin: 'top center',
  },
  glow: {
    position: 'absolute',
    width: 420,
    height: 380,
    left: -30,
    top: -25,
    backgroundImage:
      'radial-gradient(ellipse at center, rgba(107, 157, 60, 0.18) 0%, rgba(11, 18, 16, 0) 68%)',
  },
  orbit: {
    position: 'absolute',
    width: 395,
    height: 244,
    top: 20,
    left: -18,
    borderWidth: 1,
    borderColor: '#2B3D2C',
    borderRadius: '50%',
    transform: [{ rotate: '-32deg' }],
  },
  orbitInner: {
    width: 351,
    height: 208,
    top: 38,
    left: 4,
    borderColor: '#1C2C20',
  },
  orbitDot: {
    position: 'absolute',
    top: 29,
    right: 53,
    width: 5,
    height: 5,
    backgroundColor: '#79915D',
    borderRadius: 3,
  },
  backPosition: {
    position: 'absolute',
    left: 23,
    top: 38,
  },
  backCard: {
    width: 278,
    height: 175,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#485349',
    backgroundColor: '#27332B',
    backgroundImage:
      'linear-gradient(125deg, #3C453A 0%, #1A2922 60%, #17231D 100%)',
    padding: 20,
    overflow: 'hidden',
    boxShadow: '0 16px 35px rgba(0, 0, 0, 0.25)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBrand: {
    color: '#F0F1E5',
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -1.1,
  },
  backBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
  },
  backLabel: {
    fontSize: 6,
    color: '#B9C6B7',
    letterSpacing: 1.2,
    fontWeight: '600',
  },
  backTitle: {
    color: '#EFF0E6',
    fontSize: 15,
    lineHeight: 19,
    marginTop: 6,
    fontWeight: '500',
    letterSpacing: -0.4,
  },
  goalRing: {
    width: 49,
    height: 49,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#C9E99A',
    borderRightColor: '#52644C',
    transform: [{ rotate: '-30deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalPercent: {
    color: '#DCEBC9',
    fontWeight: '600',
    fontSize: 14,
    transform: [{ rotate: '30deg' }],
  },
  percentSign: {
    fontSize: 8,
  },
  backFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  goalTrack: {
    width: 80,
    height: 3,
    backgroundColor: '#475645',
    borderRadius: 2,
  },
  goalProgress: {
    width: '75%',
    height: 3,
    backgroundColor: '#C9E99A',
    borderRadius: 2,
  },
  goalCaption: {
    color: '#A8B4A3',
    fontSize: 7,
  },
  frontPosition: {
    position: 'absolute',
    left: 61,
    top: 142,
  },
  frontCard: {
    width: 280,
    height: 176,
    borderRadius: 19,
    backgroundColor: '#ADDA9A',
    backgroundImage:
      'linear-gradient(115deg, #E1EDBB 0%, #B1DE9C 42%, #70AE83 100%)',
    borderWidth: 1,
    borderColor: '#C2E7AE',
    padding: 20,
    overflow: 'hidden',
    boxShadow: '0 20px 35px rgba(0, 0, 0, 0.35)',
  },
  cardSheen: {
    position: 'absolute',
    width: 250,
    height: 260,
    top: -165,
    left: 85,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 125,
    transform: [{ rotate: '30deg' }],
  },
  frontBrand: {
    color: '#183C29',
    fontSize: 23,
    fontWeight: '700',
    letterSpacing: -1.2,
  },
  cardLogo: {
    width: 24,
    height: 24,
    borderRadius: 7,
  },
  balanceLabel: {
    marginTop: 16,
    color: '#2D5238',
    fontWeight: '600',
    fontSize: 7,
    letterSpacing: 1.2,
  },
  balance: {
    color: '#143E28',
    fontSize: 31,
    fontWeight: '500',
    letterSpacing: -1.2,
    marginTop: 4,
  },
  currency: {
    fontSize: 20,
    fontWeight: '400',
  },
  cents: {
    fontSize: 22,
  },
  frontFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  cardKicker: {
    color: '#315C3D',
    fontWeight: '600',
    fontSize: 5,
    letterSpacing: 1,
  },
  cardCaption: {
    color: '#214A30',
    fontSize: 8,
    marginTop: 5,
    fontWeight: '500',
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  bar: {
    width: 8,
    borderRadius: 3,
    backgroundColor: '#22563A',
  },
  spark: {
    position: 'absolute',
    color: '#D5F588',
    fontSize: 28,
  },
  sparkTop: {
    top: 6,
    left: 14,
    transform: [{ rotate: '12deg' }],
  },
  sparkBottom: {
    bottom: 2,
    right: 18,
    fontSize: 20,
  },
  smallSpark: {
    position: 'absolute',
    left: 41,
    bottom: 5,
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#758F5B',
  },
});
