import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FormScreen } from "../../../src/components/layout/FormScreen";
import { Button } from "../../../src/components/ui/Button";
import { Card } from "../../../src/components/ui/Card";
import { Input } from "../../../src/components/ui/Input";
import { CATEGORY_ICONS } from "../../../src/constants";
import { transactionService } from "../../../src/services/transactionService";
import { useCategoryStore } from "../../../src/stores/categoryStore";
import { useTransactionStore } from "../../../src/stores/transactionStore";
import { useTheme } from "../../../src/theme/useTheme";
import { TransactionType } from "../../../src/types";

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { update, remove } = useTransactionStore();
  const { categories, fetch: fetchCategories } = useCategoryStore();
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    loadTransaction();
    fetchCategories();
  }, [fetchCategories, id]);

  const loadTransaction = async () => {
    try {
      const tx = await transactionService.getById(id);
      setTitle(tx.title);
      setDescription(tx.description || '');
      setAmount(String(tx.amount));
      setType(tx.type);
      setCategoryId(tx.categoryId);
      setDate(tx.date.split('T')[0]);
    } catch {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Transação não encontrada",
      });
      router.replace("/(tabs)/transactions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!title.trim()) {
      return Toast.show({
        type: "error",
        text1: "Atenção",
        text2: "Informe o título",
      });
    }
    if (!amount || Number(amount.replace(",", ".")) <= 0) {
      return Toast.show({
        type: "error",
        text1: "Atenção",
        text2: "Informe um valor válido",
      });
    }

    setIsSubmitting(true);
    try {
      await update(id, {
        title: title.trim(),
        description: description.trim() || undefined,
        amount: Number(amount.replace(",", ".")),
        type,
        date,
        categoryId,
      });
      router.replace("/(tabs)/transactions");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    Toast.show({
      type: "confirm",
      text1: "Excluir",
      text2: "Tem certeza que deseja excluir esta transação?",
      position: "bottom",
      autoHide: false,
      props: {
        confirmText: "Excluir",
        onConfirm: async () => {
          try {
            await remove(id);
            router.replace("/(tabs)/transactions");
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
  };

  if (isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <FormScreen>
      <View className="mb-6">
        <Text className="text-2xl font-bold" style={{ color: colors.text }}>
          Editar Transação
        </Text>
        <Text className="mt-1 text-sm" style={{ color: colors.textMuted }}>
          Atualize os dados do lançamento sem sair do padrão do app.
        </Text>
      </View>

      <Card className="mb-6 p-5">
        <View className="mb-8 flex-row gap-4">
          <TouchableOpacity
            className="flex-1 items-center rounded-[16px] border py-4"
            style={{
              backgroundColor:
                type === TransactionType.EXPENSE ? `${colors.danger}12` : colors.surfaceSecondary,
              borderColor:
                type === TransactionType.EXPENSE ? colors.danger : colors.border,
            }}
            onPress={() => setType(TransactionType.EXPENSE)}
            activeOpacity={0.7}
          >
            <Text
              className="font-semibold text-base"
              style={{
                color:
                  type === TransactionType.EXPENSE ? colors.danger : colors.textSecondary,
              }}
            >
              📉 Despesa
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 items-center rounded-[16px] border py-4"
            style={{
              backgroundColor:
                type === TransactionType.INCOME ? `${colors.success}12` : colors.surfaceSecondary,
              borderColor:
                type === TransactionType.INCOME ? colors.success : colors.border,
            }}
            onPress={() => setType(TransactionType.INCOME)}
            activeOpacity={0.7}
          >
            <Text
              className="font-semibold text-base"
              style={{
                color:
                  type === TransactionType.INCOME ? colors.primary : colors.textSecondary,
              }}
            >
              📈 Receita
            </Text>
          </TouchableOpacity>
        </View>

        <Input
          label="Título"
          value={title}
          onChangeText={setTitle}
          placeholder="Ex: Almoço, Salário..."
        />
        <Input
          label="Valor (R$)"
          value={amount}
          onChangeText={setAmount}
          placeholder="0,00"
          keyboardType="decimal-pad"
        />
        <Input label="Data" value={date} onChangeText={setDate} placeholder="AAAA-MM-DD" />

        <View className="mb-6">
          <Text
            className="mb-3 ml-1 text-sm font-medium"
            style={{ color: colors.textSecondary }}
          >
            Categoria de Lançamento
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {categories.map((cat) => {
              const icon = CATEGORY_ICONS[cat.icon] || "🏷️";
              const isSelected = categoryId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setCategoryId(cat.id)}
                  className="flex-row items-center rounded-[16px] border px-4 py-3"
                  style={{
                    borderColor: isSelected ? cat.color : colors.border,
                    backgroundColor: isSelected ? `${cat.color}15` : colors.surfaceSecondary,
                    borderWidth: isSelected ? 2 : 1,
                  }}
                  activeOpacity={0.8}
                >
                  <Text className="mr-2 text-lg">{icon}</Text>
                  <Text
                    className="text-sm"
                    style={{
                      color: isSelected ? colors.text : colors.textSecondary,
                      fontWeight: isSelected ? "600" : "500",
                    }}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Input
          label="Descrição (opcional)"
          value={description}
          onChangeText={setDescription}
          placeholder="Detalhes adicionais..."
          multiline
        />
      </Card>

      <View className="gap-4">
        <Button
          title="Salvar Alterações"
          onPress={handleUpdate}
          isLoading={isSubmitting}
        />
        <Button title="Excluir Transação" onPress={handleDelete} variant="danger" />
      </View>
    </FormScreen>
  );
}
