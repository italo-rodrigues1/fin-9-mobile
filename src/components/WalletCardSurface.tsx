import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { walletCardAppearance } from '../utils/walletCardAppearance';

export const walletCardColors = {
  text: '#FFFFFF',
  muted: '#E0E8E5',
  subtle: 'rgba(255,255,255,0.18)',
  control: 'rgba(255,255,255,0.12)',
};

export function WalletCardSurface({
  children,
  color,
  style,
}: {
  children: ReactNode;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const palette = walletCardAppearance(color);
  return (
    <View
      style={[
        styles.surface,
        {
          backgroundColor: palette.base,
          backgroundImage: `linear-gradient(120deg, ${palette.base} 0%, ${palette.middle} 62%, ${palette.base} 100%)`,
        },
        style,
      ]}
    >
      <View
        pointerEvents="none"
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.decoration}
      >
        <View
          style={[
            styles.glow,
            {
              backgroundImage: `linear-gradient(140deg, transparent 5%, ${palette.glow} 48%, transparent 78%)`,
            },
          ]}
        />
        <View style={styles.sheen} />
        <View style={styles.orbit} />
        <View style={styles.innerOrbit} />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  decoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    borderRadius: 22,
  },
  surface: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    padding: 20,
  },
  glow: {
    position: 'absolute',
    top: -100,
    right: -110,
    width: 340,
    height: 400,
    borderRadius: 180,
    opacity: 0.48,
    transform: [{ rotate: '25deg' }],
  },
  sheen: {
    position: 'absolute',
    top: -140,
    right: 40,
    width: 80,
    height: 420,
    opacity: 0.24,
    transform: [{ rotate: '32deg' }],
    backgroundImage:
      'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.38) 52%, transparent 100%)',
  },
  orbit: {
    position: 'absolute',
    top: -100,
    right: -130,
    width: 320,
    height: 320,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 160,
  },
  innerOrbit: {
    position: 'absolute',
    top: -80,
    right: -110,
    width: 280,
    height: 280,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 140,
  },
});
