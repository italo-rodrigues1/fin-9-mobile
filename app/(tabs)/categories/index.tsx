import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "../../../src/components/EmptyState";
import { CATEGORY_ICONS } from "../../../src/constants";
import { useCategoryStore } from "../../../src/stores/categoryStore";
import { useTheme } from "../../../src/theme/useTheme";
import { Category } from "../../../src/types";

export default function CategoriesScreen() {
  const { categories, fetch, remove } = useCategoryStore();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { colors } = useTheme();

  useFocusEffect(
    useCallback(() => {
      fetch();
    }, [fetch]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetch();
    setRefreshing(false);
  }, [fetch]);

  const handleDelete = useCallback(
    (category: Category) => {
      Toast.show({
        type: "confirm",
        text1: "Excluir",
        text2: `Deseja excluir "${category.name}"?`,
        position: "bottom",
        autoHide: false,
        props: {
          confirmText: "Excluir",
          onConfirm: async () => {
            try {
              await remove(category.id);
            } catch (err: any) {
              Toast.show({
                type: "error",
                text1: "Erro",
                text2: err.message,
              });
            }
          },
        },
      });
    },
    [remove],
  );

  const renderItem = useCallback(
    ({ item }: { item: Category }) => {
      const icon = CATEGORY_ICONS[item.icon] || "🏷️";

      return (
        <View
          className="mb-3 flex-row items-center rounded-[24px] border px-4 py-4"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <View
            className="mr-4 h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: `${item.color}20` }}
          >
            <Text className="text-xl">{icon}</Text>
          </View>

          <View className="flex-1">
            <Text
              className="mb-1 text-base font-semibold"
              style={{ color: colors.text }}
            >
              {item.name}
            </Text>
            <Text className="text-xs font-medium" style={{ color: colors.textMuted }}>
              {item.isDefault ? "Padrão" : "Personalizada"}
            </Text>
          </View>

          <View className="ml-3 flex-row gap-2">
            <TouchableOpacity
              onPress={() => router.push(`/(tabs)/categories/${item.id}`)}
              className="rounded-full px-4 py-2"
              style={{ backgroundColor: colors.backgroundMuted }}
            >
              <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                Editar
              </Text>
            </TouchableOpacity>
            {!item.isDefault ? (
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                className="rounded-full px-4 py-2"
                style={{ backgroundColor: `${colors.danger}18` }}
              >
                <Text className="text-sm font-semibold" style={{ color: colors.danger }}>
                  Excluir
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      );
    },
    [colors, handleDelete, router],
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View className="px-4 pb-4 pt-4">
            <View
              className="rounded-[24px] border px-5 py-5"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <Text className="text-xl font-bold" style={{ color: colors.text }}>
                Organize suas categorias
              </Text>
              <Text
                className="mt-2 text-sm leading-6"
                style={{ color: colors.textSecondary }}
              >
                Crie categorias personalizadas para manter receitas e despesas
                ainda mais fáceis de identificar.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/categories/create")}
                className="mt-5 self-start rounded-full px-5 py-3"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-sm font-semibold" style={{ color: colors.white }}>
                  Nova categoria
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="px-4 pt-8">
            <View
              className="rounded-[24px] p-6"
              style={{ backgroundColor: colors.surface }}
            >
              <EmptyState
                icon="🏷️"
                title="Nenhuma categoria"
                description="Categorias padrão serão criadas ao registrar."
              />
            </View>
          </View>
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
