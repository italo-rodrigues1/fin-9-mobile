import React from 'react';
import { View } from 'react-native';
import { Skeleton } from './ui/Skeleton';
import { useTheme } from '../theme/useTheme';

export function AccountCardSkeleton() {
  const { colors } = useTheme();

  return (
    <View
      className="mr-3 w-[276px] overflow-hidden rounded-[22px] px-4 pb-5 pt-4"
      style={{ backgroundColor: colors.surface }}
    >
      <View
        className="mb-6 h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: colors.backgroundMuted }}
      >
        <Skeleton width={20} height={20} borderRadius={10} />
      </View>
      <Skeleton width={140} height={28} borderRadius={6} />
      <View className="mt-2" />
      <Skeleton width={100} height={18} borderRadius={4} />
      <View className="mt-8" />
      <Skeleton width={180} height={34} borderRadius={6} />
      <View className="mt-2" />
      <Skeleton width={80} height={18} borderRadius={4} />
      
      <View
        className="absolute bottom-0 left-0 right-0 h-[6px] rounded-b-[22px]"
      >
         <Skeleton width="100%" height={6} borderRadius={0} />
      </View>
    </View>
  );
}
