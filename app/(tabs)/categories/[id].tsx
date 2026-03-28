import React, { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FormScreen } from "../../../src/components/layout/FormScreen";
import { Button } from "../../../src/components/ui/Button";
import { Card } from "../../../src/components/ui/Card";
import { Input } from "../../../src/components/ui/Input";
import { categoryService } from "../../../src/services/categoryService";
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

export default function EditCategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const { update, remove } = useCategoryStore();
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const categories = await categoryService.getAll();
        const category = categories.find((entry) => entry.id === id);

        if (!category) {
          throw new Error("Categoria não encontrada");
        }

        setName(category.name);
        setSelectedColor(category.color);
        setIsDefault(category.isDefault);
      } catch (err: any) {
        Alert.alert("Erro", err.message || "Categoria não encontrada");
        router.replace("/(tabs)/categories");
      }
    };

    loadCategory();
  }, [id, router]);

  const handleSave = async () => {
    if (!name.trim()) {
      return Alert.alert("Atenção", "Informe o nome da categoria");
    }

    setIsSubmitting(true);
    try {
      await update(id, { name: name.trim(), color: selectedColor });
      router.replace("/(tabs)/categories");
    } catch (err: any) {
      Alert.alert("Erro", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Excluir", "Tem certeza que deseja excluir esta categoria?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          setIsDeleting(true);
          try {
            await remove(id);
            router.replace("/(tabs)/categories");
          } catch (err: any) {
            Alert.alert("Erro", err.message);
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  return (
    <FormScreen>
      <View className="mb-6">
        <Text className="text-2xl font-bold" style={{ color: colors.text }}>
          Editar categoria
        </Text>
        <Text className="mt-1 text-sm" style={{ color: colors.textSecondary }}>
          Ajuste o nome e a cor para manter seu padrão visual consistente.
        </Text>
      </View>

      <Card className="p-5">
        <Input
          label="Nome da categoria"
          value={name}
          onChangeText={setName}
          placeholder="Nome da categoria"
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

      <View className="mt-6 gap-4">
        <Button
          title="Salvar categoria"
          onPress={handleSave}
          isLoading={isSubmitting}
        />
        {!isDefault ? (
          <Button
            title="Excluir categoria"
            onPress={handleDelete}
            variant="danger"
            isLoading={isDeleting}
          />
        ) : null}
      </View>
    </FormScreen>
  );
}
