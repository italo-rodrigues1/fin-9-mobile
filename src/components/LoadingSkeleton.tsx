import { useTheme } from '../theme/ThemeProvider';
import { useEffect, useRef } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Platform,
  View,
  type DimensionValue,
} from 'react-native';

function Block({
  width = '100%',
  height = 16,
  light = false,
}: {
  width?: DimensionValue;
  height?: number;
  light?: boolean;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        width,
        height,
        borderRadius: 6,
        backgroundColor: light ? 'rgba(255,255,255,0.6)' : theme.colors.border,
      }}
    />
  );
}
export function LoadingSkeleton({
  variant = 'list',
  label = 'Carregando informações',
  light = false,
}: {
  variant?: 'list' | 'screen' | 'form' | 'field' | 'button';
  label?: string;
  light?: boolean;
}) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    let active = true;
    let animation: Animated.CompositeAnimation | undefined;
    const update = (reduce: boolean) => {
      animation?.stop();
      opacity.setValue(1);
      if (reduce || !active) return;
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.45,
            duration: 700,
            isInteraction: false,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 700,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]),
      );
      animation.start();
    };
    void AccessibilityInfo.isReduceMotionEnabled()
      .then(update)
      .catch(() => {});
    const listener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      update,
    );
    return () => {
      active = false;
      animation?.stop();
      listener.remove();
    };
  }, [opacity]);
  return (
    <Animated.View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
      style={{ opacity, alignSelf: 'stretch' }}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{
          gap: 16,
          padding: variant === 'button' || variant === 'field' ? 0 : 16,
        }}
      >
        {variant === 'button' ? (
          <View style={{ alignItems: 'center' }}>
            <Block width={90} height={18} light={light} />
          </View>
        ) : variant === 'field' ? (
          <Block height={52} />
        ) : (
          <>
            {variant === 'screen' ? (
              <>
                <Block width={100} height={24} />
                <Block height={120} />
              </>
            ) : null}
            {Array.from({ length: variant === 'form' ? 5 : 3 }, (_, index) => (
              <View
                key={index}
                style={{
                  gap: 12,
                  padding: 16,
                  backgroundColor: theme.colors.surface,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: theme.colors.surfaceLight,
                }}
              >
                <Block width={index % 2 === 0 ? '44%' : '60%'} height={14} />
                <Block
                  width={variant === 'form' ? '100%' : '75%'}
                  height={variant === 'form' ? 40 : 20}
                />
              </View>
            ))}
          </>
        )}
      </View>
    </Animated.View>
  );
}
