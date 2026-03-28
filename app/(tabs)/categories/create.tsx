import React, { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { FormScreen } from "../../../src/components/layout/FormScreen";
import { Button } from "../../../src/components/ui/Button";
import { Card } from "../../../src/components/ui/Card";
import { Input } from "../../../src/components/ui/Input";
import { useCategoryStore } from "../../../src/stores/categoryStore";
import { useTheme } from "../../../src/theme/useTheme";

const CATEGORY_COLORS = [
  "#ef4444",
  "#3b82f6",
  "#14b8a6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
  "#22c55e",
  "#6b7280",
  "#f97316",
];

export default function CreateCategoryScreen() {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { create } = useCategoryStore();
  const router = useRouter();
  const { colors } = useTheme();

  const handleSave = async () => {
    if (!name.trim()) {
      return Alert.alert("Atenção", "Informe o nome da categoria");
    }

    setIsSubmitting(true);
    try {
      await create({ name: name.trim(), color: selectedColor });
      router.replace("/(tabs)/categories");
    } catch (err: any) {
      Alert.alert("Erro", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormScreen>
      <View className="mb-6">
        <Text className="text-2xl font-bold" style={{ color: colors.text }}>
          Nova categoria
        </Text>
        <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
          Escolha um nome e uma cor para personalizar seus lançamentos.
        </Text>
      </View>

      <Card className="p-5">
        <Input
          label="Nome da categoria"
          value={name}
          onChangeText={setName}
          placeholder="Ex: Mercado, Transporte, Estudos"
        />

        <Text
          className="mb-3 ml-1 mt-2 text-sm font-medium"
          style={{ color: colors.textSecondary }}
        >
          Cor de identificação
        </Text>

        <View className="mb-2 flex-row flex-wrap gap-3">
          {CATEGORY_COLORS.map((color) => {
            const selected = selectedColor === color;

            return (
              <TouchableOpacity
                key={color}
                onPress={() => setSelectedColor(color)}
                className="h-11 w-11 rounded-full"
                style={{
                  backgroundColor: color,
                  borderWidth: selected ? 3 : 0,
                  borderColor: colors.surface,
                }}
              />
            );
          })}
        </View>
      </Card>

      <View className="mt-6">
        <Button
          title="Criar categoria"
          onPress={handleSave}
          isLoading={isSubmitting}
        />
      </View>
    </FormScreen>
  );
}
