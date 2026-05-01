import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FormScreen } from "../../../src/components/layout/FormScreen";
import { Button } from "../../../src/components/ui/Button";
import { Card } from "../../../src/components/ui/Card";
import { Input } from "../../../src/components/ui/Input";
import { CATEGORY_ICONS } from "../../../src/constants";
import { useAccountStore } from "../../../src/stores/accountStore";
import { useCategoryStore } from "../../../src/stores/categoryStore";
import { useTransactionStore } from "../../../src/stores/transactionStore";
import { useTheme } from "../../../src/theme/useTheme";
import { TransactionType } from "../../../src/types";

export default function CreateTransactionScreen() {
  const params = useLocalSearchParams<{ type?: string; accountId?: string }>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { create } = useTransactionStore();
  const { categories, fetch: fetchCategories } = useCategoryStore();
  const { accounts, fetch: fetchAccounts } = useAccountStore();
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    fetchCategories();
    fetchAccounts();
  }, [fetchCategories, fetchAccounts]);

  useEffect(() => {
    if (params.type === TransactionType.INCOME) {
      setType(TransactionType.INCOME);
    } else if (params.type === TransactionType.EXPENSE) {
      setType(TransactionType.EXPENSE);
    }
  }, [params.type]);

  useEffect(() => {
    if (params.accountId) {
      setAccountId(params.accountId);
    }
  }, [params.accountId]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      return Toast.show({ type: "error", text1: "Atenção", text2: "Informe o título" });
    }
    if (!amount || Number(amount.replace(",", ".")) <= 0) {
      return Toast.show({ type: "error", text1: "Atenção", text2: "Informe um valor válido" });
    }
    if (!categoryId) {
      return Toast.show({ type: "error", text1: "Atenção", text2: "Selecione uma categoria" });
    }
    if (!accountId) {
      return Toast.show({ type: "error", text1: "Atenção", text2: "Selecione uma conta" });
    }

    setIsSubmitting(true);
    try {
      await create({
        title: title.trim(),
        description: description.trim() || undefined,
        amount: Number(amount.replace(",", ".")),
        type,
        date,
        categoryId,
        accountId,
      });
      router.replace("/(tabs)/transactions");
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Erro", text2: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormScreen>
      <Card className="mb-6 p-5">
        {/* Type selector */}
        <View className="mb-8 flex-row gap-4">
          <TouchableOpacity
            className="flex-1 items-center rounded-[16px] border py-4"
            style={{
              backgroundColor:
                type === TransactionType.EXPENSE ? `${colors.danger}12` : colors.surfaceSecondary,
              borderColor: type === TransactionType.EXPENSE ? colors.danger : colors.border,
            }}
            onPress={() => setType(TransactionType.EXPENSE)}
            activeOpacity={0.7}
          >
            <Text
              className="font-semibold text-base"
              style={{ color: type === TransactionType.EXPENSE ? colors.danger : colors.textSecondary }}
            >
              📉 Despesa
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 items-center rounded-[16px] border py-4"
            style={{
              backgroundColor:
                type === TransactionType.INCOME ? `${colors.success}12` : colors.surfaceSecondary,
              borderColor: type === TransactionType.INCOME ? colors.success : colors.border,
            }}
            onPress={() => setType(TransactionType.INCOME)}
            activeOpacity={0.7}
          >
            <Text
              className="font-semibold text-base"
              style={{ color: type === TransactionType.INCOME ? colors.primary : colors.textSecondary }}
            >
              📈 Receita
            </Text>
          </TouchableOpacity>
        </View>

        <Input label="Título" value={title} onChangeText={setTitle} placeholder="Ex: Almoço, Salário..." />
        <Input
          label="Valor (R$)"
          value={amount}
          onChangeText={setAmount}
          placeholder="0,00"
          keyboardType="decimal-pad"
        />
        <Input label="Data" value={date} onChangeText={setDate} placeholder="AAAA-MM-DD" />

        {/* Account selector */}
        <View className="mb-6">
          <Text className="mb-3 ml-1 text-sm font-medium" style={{ color: colors.textSecondary }}>
            Conta
          </Text>
          {accounts.length === 0 ? (
            <Text className="text-sm" style={{ color: colors.textMuted }}>
              Cadastre uma conta antes de criar transações
            </Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3">
                {accounts.map((account) => {
                  const isSelected = accountId === account.id;
                  return (
                    <TouchableOpacity
                      key={account.id}
                      onPress={() => setAccountId(account.id)}
                      className="flex-row items-center rounded-[16px] border px-4 py-3"
                      style={{
                        borderColor: isSelected ? account.color : colors.border,
                        backgroundColor: isSelected ? `${account.color}15` : colors.surfaceSecondary,
                        borderWidth: isSelected ? 2 : 1,
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        className="text-sm"
                        style={{
                          color: isSelected ? colors.text : colors.textSecondary,
                          fontWeight: isSelected ? "600" : "500",
                        }}
                      >
                        {account.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </View>

        {/* Category selector */}
        <View className="mb-6">
          <Text className="mb-3 ml-1 text-sm font-medium" style={{ color: colors.textSecondary }}>
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

      <Button title="Salvar Transação" onPress={handleSubmit} isLoading={isSubmitting} />
    </FormScreen>
  );
}
