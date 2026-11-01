import type { TextInputInstance } from 'react-native';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import {
  FlatList,
  FlatListProps,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewInstance,
  ScrollViewProps,
  TextInput,
} from 'react-native';
import {
  SafeAreaView,
  SafeAreaViewProps,
} from 'react-native-safe-area-context';
import { HeaderHeightContext } from 'expo-router/react-navigation';
const FocusContext = createContext<(input: TextInputInstance | null) => void>(
  () => {},
);
export function useFormInputFocus() {
  return useContext(FocusContext);
}
type Responder = Pick<
  ScrollViewInstance,
  'scrollResponderScrollNativeHandleToKeyboard'
>;
function useReveal(getResponder: () => Responder | null | undefined) {
  const getter = useRef(getResponder),
    active = useRef<TextInputInstance | null>(null),
    frame = useRef<number | undefined>(undefined);
  getter.current = getResponder;
  const reveal = useCallback(() => {
    if (Platform.OS === 'web') return;
    if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const input = active.current;
      if (input?.isFocused())
        getter
          .current()
          ?.scrollResponderScrollNativeHandleToKeyboard(input, 24, true);
    });
  }, []);
  useEffect(() => {
    const shown = Keyboard.addListener('keyboardDidShow', reveal);
    return () => {
      shown.remove();
      if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    };
  }, [reveal]);
  return useCallback(
    (input: TextInputInstance | null) => {
      active.current = input;
      reveal();
    },
    [reveal],
  );
}
export function KeyboardScreen({ children, ...props }: SafeAreaViewProps) {
  const headerHeight = useContext(HeaderHeightContext) ?? 0;
  return (
    <SafeAreaView {...props}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : Platform.OS === 'android'
              ? 'height'
              : undefined
        }
        keyboardVerticalOffset={headerHeight}
      >
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export function KeyboardScrollView(props: ScrollViewProps) {
  const ref = useRef<ScrollViewInstance>(null),
    focus = useReveal(() => ref.current);
  return (
    <FocusContext.Provider value={focus}>
      <ScrollView
        {...props}
        ref={ref}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        automaticallyAdjustKeyboardInsets={false}
      />
    </FocusContext.Provider>
  );
}
export function KeyboardFlatList<ItemT>(props: FlatListProps<ItemT>) {
  const ref = useRef<FlatList<ItemT>>(null),
    focus = useReveal(() => ref.current?.getScrollResponder());
  return (
    <FocusContext.Provider value={focus}>
      <FlatList
        {...props}
        ref={ref}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        automaticallyAdjustKeyboardInsets={false}
      />
    </FocusContext.Provider>
  );
}
