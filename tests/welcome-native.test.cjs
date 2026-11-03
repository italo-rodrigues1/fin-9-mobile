const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const React = require('react');
const ts = require('typescript');

const subscription = () => ({ remove() {} });
const nativeComponent = (name) =>
  Object.assign(() => null, { displayName: name });
const reactNative = {
  View: nativeComponent('View'),
  Text: nativeComponent('Text'),
  Image: nativeComponent('Image'),
  Pressable: nativeComponent('Pressable'),
  TouchableOpacity: nativeComponent('TouchableOpacity'),
  ScrollView: nativeComponent('ScrollView'),
  Animated: { View: nativeComponent('Animated.View') },
  StyleSheet: { create: (styles) => styles },
  useWindowDimensions: () => ({ width: 360, height: 640, fontScale: 1 }),
  Appearance: {
    getColorScheme: () => 'light',
    addChangeListener: subscription,
    setColorScheme() {},
  },
  AppState: { currentState: 'active', addEventListener: subscription },
  AccessibilityInfo: {
    isReduceMotionEnabled: () => Promise.resolve(false),
    addEventListener: subscription,
  },
  Dimensions: {
    get: () => ({ width: 360, height: 640 }),
    addEventListener: subscription,
  },
  PixelRatio: {
    get: () => 1,
    getFontScale: () => 1,
    roundToNearestPixel: (value) => value,
  },
  Platform: {
    OS: 'android',
    select: (options) => options.android ?? options.default,
  },
};

// Run the installed native style resolver, not its web implementation. Only the
// React hooks and native environment are stubbed; style processing is unchanged.
function loadNativeResolver() {
  const originalLoad = Module._load;
  const reactHooks = {
    ...React,
    useContext: (context) => context._currentValue,
    useState: (initial) => [
      typeof initial === 'function' ? initial() : initial,
      () => {},
    ],
    useReducer: (_reducer, initial, init) => [
      init ? init(initial) : initial,
      () => {},
    ],
    useMemo: (factory) => factory(),
    useEffect() {},
  };
  Module._load = function (id, parent, isMain) {
    if (id === 'react-native') return reactNative;
    if (id === 'react') return reactHooks;
    return originalLoad.call(this, id, parent, isMain);
  };
  try {
    const {
      interop,
    } = require('react-native-css-interop/dist/runtime/native/native-interop');
    const {
      getNormalizeConfig,
    } = require('react-native-css-interop/dist/runtime/config');
    const configs = getNormalizeConfig({ className: 'style' });
    return (element) =>
      interop(element.type, configs, element.props, undefined).props;
  } finally {
    Module._load = originalLoad;
  }
}

const resolveNativeProps = loadNativeResolver();

function renderWelcome() {
  const filename = path.resolve(__dirname, '../app/(auth)/welcome.tsx');
  const screen = new Module(filename, module);
  screen.filename = filename;
  screen.paths = Module._nodeModulePaths(path.dirname(filename));
  const routes = [];
  const animatedValue = { interpolate: () => 0 };
  screen.require = function (id) {
    if (id === 'react-native') return reactNative;
    if (id === 'expo-router')
      return { useRouter: () => ({ push: (route) => routes.push(route) }) };
    if (id === 'expo-status-bar')
      return { StatusBar: nativeComponent('StatusBar') };
    if (id === '@expo/vector-icons')
      return { Feather: nativeComponent('Feather') };
    if (id === 'react-native-safe-area-context')
      return {
        SafeAreaView: nativeComponent('SafeAreaView'),
        useSafeAreaInsets: () => ({ top: 24, bottom: 24, left: 0, right: 0 }),
      };
    if (id.endsWith('/WelcomeArtwork'))
      return { WelcomeArtwork: nativeComponent('WelcomeArtwork') };
    if (id.endsWith('/useWelcomeMotion'))
      return {
        useWelcomeMotion: () => ({
          hero: animatedValue,
          copy: animatedValue,
          drift: animatedValue,
          isFocused: true,
        }),
      };
    if (id.endsWith('.png')) return 1;
    return Module.prototype.require.call(this, id);
  };
  screen._compile(
    ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText,
    filename,
  );
  return { tree: screen.exports.default(), routes };
}

function findElement(tree, predicate) {
  if (!tree || typeof tree !== 'object') return undefined;
  if (Array.isArray(tree)) {
    for (const child of tree) {
      const found = findElement(child, predicate);
      if (found) return found;
    }
  } else {
    if (predicate(tree)) return tree;
    return findElement(tree.props?.children, predicate);
  }
}

function luminance(hex) {
  const channels = hex
    .slice(1)
    .match(/../g)
    .map((channel) => {
      const value = parseInt(channel, 16) / 255;
      return value <= 0.04045
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

test('the welcome actions retain their visible surface, readable label and login/registration destinations on native', () => {
  const { tree, routes } = renderWelcome();
  const button = findElement(
    tree,
    (element) =>
      element.props?.accessibilityLabel === 'Começar agora, fazer login',
  );
  assert.ok(button, 'Welcome must expose its login button');
  const props = resolveNativeProps(button);
  assert.equal(props.style.backgroundColor, '#D5F588');
  assert.equal(props.style.minHeight, 62);
  const label = findElement(
    button,
    (element) =>
      element.type === reactNative.Text &&
      element.props.children === 'Começar agora',
  );
  assert.ok(label, 'The visible button label must remain present');
  const textStyle = resolveNativeProps(label).style;
  const background = luminance(props.style.backgroundColor);
  const foreground = luminance(textStyle.color);
  assert.ok(
    (Math.max(background, foreground) + 0.05) /
      (Math.min(background, foreground) + 0.05) >=
      4.5,
  );
  assert.equal(typeof props.onPress, 'function');
  props.onPress();
  const registerButton = findElement(
    tree,
    (element) =>
      element.props?.accessibilityLabel === 'Não tem uma conta? Cadastrar',
  );
  assert.ok(registerButton, 'Welcome must expose its registration button');
  resolveNativeProps(registerButton).onPress();
  assert.deepEqual(routes, ['/(auth)/login', '/(auth)/register']);
});
