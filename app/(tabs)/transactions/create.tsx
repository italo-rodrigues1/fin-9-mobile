import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../../src/components/ui/Button";
import {
  DateInput,
  getLocalDateValue,
  isValidDateValue,
} from "../../../src/components/ui/DateInput";
import { Input } from "../../../src/components/ui/Input";
import { Select } from "../../../src/components/ui/Select";
import { CATEGORY_ICONS, INPUT_LIMITS } from "../../../src/constants";
import {
  amountSchema,
  normalizeAmountForValidation,
} from "../../../src/schemas/transactionSchema";
import { transactionService } from "../../../src/services/transactionService";
import { useAccountStore } from "../../../src/stores/accountStore";
import { useCategoryStore } from "../../../src/stores/categoryStore";
import { useTransactionStore } from "../../../src/stores/transactionStore";
import { TransactionType } from "../../../src/types";
import { confirmAction } from "../../../src/utils/confirmAction";
import {
  formatCurrency,
  formatCurrencyInput,
  parseCurrencyInput,
  sanitizeCurrencyInput,
} from "../../../src/utils/format";

export default function CreateTransactionScreen() {
  const params = useLocalSearchParams<{ id?: string; type?: string }>();
  const transactionId = params.id;
  const isEditing = Boolean(transactionId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [date, setDate] = useState(getLocalDateValue);
  const [isLoadingTransaction, setIsLoadingTransaction] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { create, update, remove } = useTransactionStore();
  const { categories, fetch: fetchCategories } = useCategoryStore();
  const {
    accounts,
    fetch: fetchAccounts,
    isLoading: isLoadingAccounts,
    error: accountError,
  } = useAccountStore();
  const router = useRouter();
  const accountOptions = accounts.map((account) => ({
    value: account.id,
    label: account.name,
    subtitle: `${account.institution} • ${formatCurrency(account.balance)}`,
  }));

  useFocusEffect(
    useCallback(() => {
      void fetchCategories();
      void fetchAccounts();
    }, [fetchAccounts, fetchCategories]),
  );

  React.useEffect(() => {
    setAccountId((current) =>
      accounts.some((account) => account.id === current)
        ? current
        : (accounts[0]?.id ?? ""),
    );
  }, [accounts]);

  useFocusEffect(
    useCallback(() => {
      if (isEditing) return;

      if (params.type === TransactionType.INCOME) {
        setType(TransactionType.INCOME);
      } else if (params.type === TransactionType.EXPENSE) {
        setType(TransactionType.EXPENSE);
      }
    }, [isEditing, params.type]),
  );

  React.useEffect(() => {
    if (!transactionId) return;

    let isActive = true;
    setIsLoadingTransaction(true);

    void transactionService
      .getById(transactionId)
      .then((transaction) => {
        if (!isActive) return;
        setTitle(transaction.title);
        setDescription(transaction.description ?? "");
        setAmount(formatCurrencyInput(transaction.amount));
        setType(transaction.type);
        setDate(transaction.date.split("T")[0]);
        setCategoryId(transaction.categoryId);
        setAccountId(transaction.accountId);
      })
      .catch(() => {
        Alert.alert("Erro", "Transação não encontrada");
        router.back();
      })
      .finally(() => {
        if (isActive) setIsLoadingTransaction(false);
      });

    return () => {
      isActive = false;
    };
  }, [router, transactionId]);

  const handleSubmit = async () => {
    const amountResult = amountSchema.safeParse(
      normalizeAmountForValidation(amount),
    );

    if (!title.trim()) return Alert.alert("Atenção", "Informe o título");
    if (!amountResult.success) {
      return Alert.alert(
        "Atenção",
        amountResult.error.issues[0]?.message ?? "Informe um valor válido",
      );
    }
    const parsedAmount = Number(amountResult.data);
    if (!accountId) return Alert.alert("Atenção", "Selecione uma conta");
    if (!categoryId) return Alert.alert("Atenção", "Selecione uma categoria");
    if (!isValidDateValue(date))
      return Alert.alert("Atenção", "Informe uma data válida");

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        amount: parsedAmount,
        type,
        date,
        categoryId,
        accountId,
      };

      if (transactionId) {
        await update(transactionId, payload);
      } else {
        await create(payload);
      }
      router.back();
    } catch (err: any) {
      Alert.alert("Erro", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!transactionId) return;

    const confirmed = await confirmAction(
      "Excluir transação",
      "Tem certeza que deseja excluir esta transação?",
      "Excluir",
    );
    if (!confirmed) return;

    try {
      await remove(transactionId);
      router.back();
    } catch (err: any) {
      Alert.alert("Erro", err.message);
    }
  };

  if (isLoadingTransaction) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F7F8FA]">
        <ActivityIndicator size="large" color="#169670" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `${isEditing ? "Editar" : "Nova"} ${type === TransactionType.EXPENSE ? "Despesa" : "Receita"}`,
        }}
      />
      <SafeAreaView
        className="flex-1 bg-[#F7F8FA]"
        edges={["left", "right", "bottom"]}
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            className="flex-1 px-4"
            contentContainerStyle={{ paddingBottom: 60, paddingTop: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="mb-6 rounded-[24px] bg-white p-5">
              <Text className="mb-3 ml-1 text-sm font-medium text-[#667085]">
                Tipo de transação
              </Text>
              <View className="mb-8 flex-row rounded-[18px] bg-[#F2F4F7] p-1">
                <TouchableOpacity
                  className={`flex-1 flex-row items-center justify-center rounded-[14px] py-3 ${
                    type === TransactionType.EXPENSE ? "bg-white" : ""
                  }`}
                  onPress={() => setType(TransactionType.EXPENSE)}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityState={{
                    checked: type === TransactionType.EXPENSE,
                  }}
                >
                  <MaterialCommunityIcons
                    name="arrow-down-circle-outline"
                    size={20}
                    color={
                      type === TransactionType.EXPENSE ? "#FF6B6B" : "#98A2B3"
                    }
                  />
                  <Text
                    className={`font-semibold text-base ${type === TransactionType.EXPENSE ? "text-[#FF6B6B]" : "text-[#667085]"}`}
                  >
                    {"  "}Despesa
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 flex-row items-center justify-center rounded-[14px] py-3 ${
                    type === TransactionType.INCOME ? "bg-white" : ""
                  }`}
                  onPress={() => setType(TransactionType.INCOME)}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityState={{
                    checked: type === TransactionType.INCOME,
                  }}
                >
                  <MaterialCommunityIcons
                    name="arrow-up-circle-outline"
                    size={20}
                    color={
                      type === TransactionType.INCOME ? "#169670" : "#98A2B3"
                    }
                  />
                  <Text
                    className={`font-semibold text-base ${type === TransactionType.INCOME ? "text-[#169670]" : "text-[#667085]"}`}
                  >
                    {"  "}Receita
                  </Text>
                </TouchableOpacity>
              </View>

              <Input
                label="Título"
                value={title}
                onChangeText={setTitle}
                placeholder="Ex: Almoço, Salário..."
                maxLength={INPUT_LIMITS.transactionTitle}
              />
              <Input
                label="Valor (R$)"
                value={amount}
                onChangeText={(value) =>
                  setAmount(sanitizeCurrencyInput(value))
                }
                onBlur={() => {
                  const parsed = parseCurrencyInput(amount);
                  if (amount && Number.isFinite(parsed))
                    setAmount(formatCurrencyInput(parsed));
                }}
                placeholder="0,00"
                keyboardType="decimal-pad"
                maxLength={INPUT_LIMITS.money}
              />
              <DateInput label="Data" value={date} onChange={setDate} />

              <View className="mb-6">
                <Text className="mb-3 ml-1 text-sm font-medium text-[#667085]">
                  Conta
                </Text>
                {isLoadingAccounts ? (
                  <View className="rounded-[16px] bg-[#F9FAFB] px-4 py-4">
                    <Text className="text-sm text-[#98A2B3]">
                      Carregando contas...
                    </Text>
                  </View>
                ) : accountError ? (
                  <View className="rounded-[16px] border border-[#FFB4B4] bg-[#FFF1F1] px-4 py-4">
                    <Text className="text-sm text-[#B42318]">
                      {accountError}
                    </Text>
                  </View>
                ) : accounts.length === 0 ? (
                  <TouchableOpacity
                    onPress={() => router.push("/accounts/create")}
                    className="rounded-[16px] border border-dashed border-[#169670] bg-[#EAFBF0] px-4 py-4"
                    activeOpacity={0.75}
                  >
                    <Text className="text-center font-semibold text-[#169670]">
                      Cadastrar uma conta primeiro
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Select
                    label=""
                    value={accountId}
                    options={accountOptions}
                    onChange={setAccountId}
                    placeholder="Selecione uma conta"
                    modalTitle="Conta"
                  />
                )}
              </View>

              <View className="mb-6">
                <Text className="mb-3 ml-1 text-sm font-medium text-[#667085]">
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
                        className={`flex-row items-center rounded-[16px] border px-4 py-3 ${
                          isSelected
                            ? "border-2"
                            : "border-[#EAECF0] bg-[#F9FAFB]"
                        }`}
                        style={
                          isSelected
                            ? {
                                borderColor: cat.color,
                                backgroundColor: `${cat.color}15`,
                              }
                            : {}
                        }
                        activeOpacity={0.8}
                      >
                        <Text className="mr-2 text-lg">{icon}</Text>
                        <Text
                          className={`text-sm ${isSelected ? "font-semibold text-[#344054]" : "font-medium text-[#667085]"}`}
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
                maxLength={INPUT_LIMITS.transactionDescription}
              />
            </View>

            <View className="flex gap-3 flex-row justify-between">
              <Button
                title={
                  isEditing
                    ? "Salvar Alterações"
                    : type === TransactionType.EXPENSE
                      ? "Salvar Despesa"
                      : "Salvar Receita"
                }
                onPress={handleSubmit}
                isLoading={isSubmitting}
                disabled={!accountId || isLoadingAccounts}
              />
              {isEditing ? (
                <Button
                  title="Excluir Transação"
                  onPress={handleDelete}
                  variant="danger"
                />
              ) : null}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
