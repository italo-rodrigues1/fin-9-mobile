import { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { BackButton } from './BackButton';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  dark?: boolean;
}

export function ScreenHeader({ title, subtitle, right, dark = false }: ScreenHeaderProps) {
  const titleColor = dark ? 'text-white' : 'text-[#344054]';
  const subtitleColor = dark ? 'text-slate-400' : 'text-[#98A2B3]';

  return (
    <View className="flex-row items-start px-4 pb-4 pt-3">
      <BackButton
        color={dark ? '#F8FAFC' : '#344054'}
        backgroundColor={dark ? '#1E293B' : '#FFFFFF'}
      />
      <View className="ml-3 flex-1 pt-1">
        <Text className={`text-2xl font-bold ${titleColor}`}>{title}</Text>
        {subtitle ? (
          <Text className={`mt-1 text-sm leading-5 ${subtitleColor}`}>{subtitle}</Text>
        ) : null}
      </View>
      {right ? <View className="ml-3">{right}</View> : null}
    </View>
  );
}
