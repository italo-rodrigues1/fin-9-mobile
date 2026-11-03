import { useTheme } from '../theme/ThemeProvider';
import { Fragment, useEffect, useState } from 'react';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Feather } from '@expo/vector-icons';
import { Keyboard, Text, TouchableOpacity, View } from 'react-native';
import { QuickAddMenu } from './QuickAddMenu';
const icons: Record<string, 'home' | 'list' | 'credit-card' | 'menu'> = {
  index: 'home',
  transactions: 'list',
  accounts: 'credit-card',
  more: 'menu',
};
export function AppTabBar({
  state,
  descriptors,
  emitter,
  navigateToTab,
  insets,
}: BottomTabBarProps) {
  const theme = useTheme();
  const [keyboardOpen, setKeyboardOpen] = useState(Keyboard.isVisible());
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () =>
        setKeyboardOpen(true),
      ),
      hide = Keyboard.addListener('keyboardDidHide', () =>
        setKeyboardOpen(false),
      );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  if (keyboardOpen) return null;
  return (
    <View
      className="flex-row border-t border-app-border bg-app-surface"
      style={{
        paddingTop: 2,
        paddingBottom: Math.max(4, insets.bottom),
      }}
    >
      {state.routes.map((route, index) => {
        const selected = state.index === index;
        const title = descriptors[route.key].options.title || route.name;
        const color = selected
          ? theme.colors.primaryText
          : theme.colors.textMuted;
        return (
          <Fragment key={route.key}>
            {index === 2 ? <QuickAddMenu /> : null}
            <TouchableOpacity
              accessibilityRole="tab"
              accessibilityLabel={title}
              accessibilityState={{ selected }}
              onPress={() => {
                const event = emitter.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!selected && !event.defaultPrevented)
                  navigateToTab(route.key);
              }}
              onLongPress={() =>
                emitter.emit({ type: 'tabLongPress', target: route.key })
              }
              className="flex-1 items-center justify-center"
              style={{ minHeight: 48 }}
            >
              <Feather
                name={icons[route.name] || 'menu'}
                size={22}
                color={color}
              />
              <Text
                style={{
                  color,
                  marginTop: 5,
                  fontSize: 10,
                  fontWeight: selected ? '700' : '500',
                }}
              >
                {title}
              </Text>
            </TouchableOpacity>
          </Fragment>
        );
      })}
    </View>
  );
}
