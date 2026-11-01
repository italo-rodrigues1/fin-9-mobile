import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  AccessibilityInfo,
  Animated,
  AppState,
  Easing,
  Platform,
} from 'react-native';

const nativeDriver = Platform.OS !== 'web';

export function useWelcomeMotion() {
  const hero = useRef(new Animated.Value(0)).current;
  const copy = useRef(new Animated.Value(0)).current;
  const drift = useRef(new Animated.Value(0)).current;
  const [isFocused, setIsFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      let disposed = false;
      let reduced = true;
      let resolved = false;
      let entered = false;
      let appActive =
        AppState.currentState !== 'background' &&
        AppState.currentState !== 'inactive';
      let entrance: Animated.CompositeAnimation | undefined;
      let floating: Animated.CompositeAnimation | undefined;

      const stop = () => {
        entrance?.stop();
        floating?.stop();
        drift.setValue(0);
      };
      const showContent = () => {
        [hero, copy].forEach((value) => value.setValue(1));
      };
      const update = () => {
        if (disposed) return;
        stop();
        if (!resolved || reduced || !appActive) {
          showContent();
          return;
        }
        if (!entered) {
          entered = true;
          [hero, copy].forEach((value) => value.setValue(0));
          entrance = Animated.stagger(
            110,
            [hero, copy].map((value) =>
              Animated.timing(value, {
                toValue: 1,
                duration: 650,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: nativeDriver,
                isInteraction: false,
              }),
            ),
          );
          entrance.start();
        } else {
          showContent();
        }
        floating = Animated.loop(
          Animated.sequence([
            Animated.timing(drift, {
              toValue: 1,
              duration: 3300,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: nativeDriver,
              isInteraction: false,
            }),
            Animated.timing(drift, {
              toValue: -1,
              duration: 6600,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: nativeDriver,
              isInteraction: false,
            }),
            Animated.timing(drift, {
              toValue: 0,
              duration: 3300,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: nativeDriver,
              isInteraction: false,
            }),
          ]),
        );
        floating.start();
      };

      void AccessibilityInfo.isReduceMotionEnabled()
        .then((value) => {
          reduced = value;
          resolved = true;
          update();
        })
        .catch(() => {
          if (!disposed) showContent();
        });

      const motionListener = AccessibilityInfo.addEventListener(
        'reduceMotionChanged',
        (value) => {
          reduced = value;
          resolved = true;
          update();
        },
      );
      const appListener = AppState.addEventListener('change', (state) => {
        appActive = state === 'active';
        update();
      });

      return () => {
        disposed = true;
        stop();
        showContent();
        setIsFocused(false);
        motionListener.remove();
        appListener.remove();
      };
    }, [hero, copy, drift]),
  );

  return { hero, copy, drift, isFocused };
}
