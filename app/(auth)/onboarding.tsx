import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BrandLogo } from "../../src/components/BrandLogo";

const { width, height } = Dimensions.get("window");

const PRIMARY = "#169670";
const PRIMARY_DARK = "#12785A";
const BACKGROUND = "#F7F8FA";
const TEXT = "#111111";
const TEXT_SECONDARY = "#667085";

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Entrance animations
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const blob1Anim = useRef(new Animated.Value(0)).current;
  const blob2Anim = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(40)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.94)).current;

  // Subtle floating animation for decorative blobs
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Background fade in
    Animated.timing(bgOpacity, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    // Blobs entrance with stagger
    Animated.stagger(150, [
      Animated.timing(blob1Anim, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(blob2Anim, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Content slide up
    Animated.parallel([
      Animated.timing(contentSlide, {
        toValue: 0,
        duration: 700,
        delay: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 700,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Button scale in
    Animated.spring(buttonScale, {
      toValue: 1,
      delay: 500,
      tension: 60,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Continuous subtle float
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const blob1TranslateY = blob1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 0],
  });
  const blob2TranslateX = blob2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 0],
  });
  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  const handleGetStarted = () => {
    router.push("/(auth)/login");
  };

  return (
    <View style={[styles.container, { backgroundColor: BACKGROUND }]}>
      <StatusBar style="dark" />

      {/* ─── Decorative Abstract Background ─── */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgOpacity }]}>
        {/* Large primary glow — top right */}
        <Animated.View
          style={[
            styles.blob,
            styles.blob1,
            {
              opacity: blob1Anim,
              transform: [{ translateY: blob1TranslateY }, { translateY: floatY }],
            },
          ]}
        />

        {/* Secondary accent — bottom left */}
        <Animated.View
          style={[
            styles.blob,
            styles.blob2,
            {
              opacity: blob2Anim,
              transform: [{ translateX: blob2TranslateX }],
            },
          ]}
        />

        {/* Subtle mid ring */}
        <Animated.View
          style={[
            styles.ringOuter,
            {
              opacity: blob1Anim,
              transform: [{ translateY: floatY }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.ringInner,
            {
              opacity: blob2Anim,
              transform: [
                {
                  translateY: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 8],
                  }),
                },
              ],
            },
          ]}
        />

        {/* Horizontal divider line accent */}
        <View style={styles.lineAccent} />
      </Animated.View>

      {/* ─── Top Bar ─── */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <BrandLogo />
      </View>

      {/* ─── Main Content ─── */}
      <Animated.View
        style={[
          styles.content,
          {
            paddingBottom: insets.bottom + 32,
            opacity: contentOpacity,
            transform: [{ translateY: contentSlide }],
          },
        ]}
      >
        {/* Headline block */}
        <View style={styles.headlineBlock}>
          <Text style={styles.headline}>
            {"Controle seu\ndinheiro com "}
            <Text style={styles.headlineAccent}>clareza</Text>
            {" e foco"}
          </Text>
          <Text style={styles.subheadline}>
            Organize suas finanças, acompanhe seus gastos e construa hábitos melhores todo dia.
          </Text>
        </View>

        {/* CTA Button */}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            onPress={handleGetStarted}
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityLabel="Vamos lá"
            style={[
              styles.ctaButton,
              { backgroundColor: PRIMARY },
            ]}
          >
            <Text style={styles.ctaText}>Vamos lá</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const BLOB_SIZE = width * 1.1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ── Decorative elements ──
  blob: {
    position: "absolute",
    borderRadius: BLOB_SIZE,
  },
  blob1: {
    width: BLOB_SIZE,
    height: BLOB_SIZE,
    top: -BLOB_SIZE * 0.38,
    right: -BLOB_SIZE * 0.28,
    backgroundColor: `${PRIMARY}18`,
    // Mimic soft glow with a smaller bright core
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 90,
    elevation: 0,
  },
  blob2: {
    width: width * 0.72,
    height: width * 0.72,
    bottom: height * 0.28,
    left: -width * 0.2,
    backgroundColor: `${PRIMARY}10`,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 60,
    elevation: 0,
  },
  ringOuter: {
    position: "absolute",
    width: width * 0.78,
    height: width * 0.78,
    top: -(width * 0.1),
    right: -(width * 0.2),
    borderRadius: width * 0.39,
    borderWidth: 1,
    borderColor: `${PRIMARY}22`,
  },
  ringInner: {
    position: "absolute",
    width: width * 0.52,
    height: width * 0.52,
    bottom: height * 0.35,
    left: width * 0.55,
    borderRadius: width * 0.26,
    borderWidth: 1,
    borderColor: `${PRIMARY}18`,
  },
  lineAccent: {
    position: "absolute",
    bottom: "34%",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: `${PRIMARY}10`,
  },

  // ── Top bar ──
  topBar: {
    paddingHorizontal: 28,
    paddingBottom: 8,
  },

  // ── Content ──
  content: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 28,
    gap: 20,
  },
  headlineBlock: {
    marginBottom: 8,
    gap: 14,
  },
  headline: {
    fontSize: 42,
    fontWeight: "800",
    color: TEXT,
    lineHeight: 50,
    letterSpacing: -1.0,
  },
  headlineAccent: {
    color: PRIMARY,
  },
  subheadline: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    lineHeight: 23,
    fontWeight: "400",
    letterSpacing: 0.1,
    maxWidth: "88%",
  },

  // ── CTA ──
  ctaButton: {
    backgroundColor: PRIMARY,
    borderRadius: 100,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PRIMARY_DARK,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 8,
  },
  ctaButtonPressed: {
    backgroundColor: PRIMARY_DARK,
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
