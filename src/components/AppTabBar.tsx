import { Fragment } from 'react';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
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
  return (
    <View
      className="flex-row border-t border-[#E4E7EC] bg-white"
      style={{
        paddingTop: 4,
        paddingBottom: Math.max(8, insets.bottom),
        minHeight: 64 + insets.bottom,
      }}
    >
      {state.routes.map((route, index) => {
        const selected = state.index === index;
        const title = descriptors[route.key].options.title || route.name;
        const color = selected ? '#047857' : '#667085';
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
              style={{ minHeight: 56 }}
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
