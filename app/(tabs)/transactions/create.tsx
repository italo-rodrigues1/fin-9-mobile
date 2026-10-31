import { usePrivacyStore } from '../../../src/stores/privacyStore';
import { LoadingSkeleton } from '../../../src/components/LoadingSkeleton';
import { QueryState } from '../../../src/components/QueryState';
import { notify } from '../../../src/stores/feedbackStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../../src/components/ui/Button';
import {
  DateInput,
  getLocalDateValue,
  isValidDateValue,
} from '../../../src/components/ui/DateInput';
import { Input } from '../../../src/components/ui/Input';
import { Select } from '../../../src/components/ui/Select';
import { CATEGORY_ICONS, INPUT_LIMITS } from '../../../src/constants';
import {
  amountSchema,
  normalizeAmountForValidation,
} from '../../../src/schemas/transactionSchema';
import { transactionService } from '../../../src/services/transactionService';
import { useAccountStore } from '../../../src/stores/accountStore';
import { useCategoryStore } from '../../../src/stores/categoryStore';
import { useTransactionStore } from '../../../src/stores/transactionStore';
import { Transaction, TransactionType } from '../../../src/types';
import { confirmAction } from '../../../src/utils/confirmAction';
import {
  formatCurrency,
  formatCurrencyInput,
  parseCurrencyInput,
  sanitizeCurrencyInput,
} from '../../../src/utils/format';

export default function CreateTransactionScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    type?: string;
    status?: string;
  }>();
  const transactionId = params.id;
  const isEditing = Boolean(transactionId);
  const saving = React.useRef(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'CONFIRMED' | 'PLANNED'>(
    params.status === 'PLANNED' ? 'PLANNED' : 'CONFIRMED',
  );
  const [cardPayment, setCardPayment] =
    useState<Transaction['cardPayment']>(null);
  const [recurrenceId, setRecurrenceId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(getLocalDateValue);
  const [isLoadingTransaction, setIsLoadingTransaction] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { create, update, remove } = useTransactionStore();
  const {
    categories,
    fetch: fetchCategories,
    isLoading: loadingCategories,
    error: categoryError,
  } = useCategoryStore();
  const {
    accounts,
    fetch: fetchAccounts,
    isLoading: isLoadingAccounts,
    error: accountError,
  } = useAccountStore();
  const router = useRouter();
  const showValues = usePrivacyStore((state) => state.showValues);
  const accountOptions = accounts
    .filter(
      (account) =>
        !account.isArchived || (isEditing && account.id === accountId),
    )
    .map((account) => ({
      value: account.id,
      label: account.name,
      subtitle: `${account.institution} • ${showValues ? formatCurrency(account.balance) : 'R$ ••••••'}`,
    }));

  useFocusEffect(
    useCallback(() => {
      void fetchCategories();
      void fetchAccounts();
    }, [fetchAccounts, fetchCategories]),
  );

  React.useEffect(() => {
    setAccountId((current) =>
      accounts.some(
        (account) =>
          account.id === current && (!account.isArchived || isEditing),
      )
        ? current
        : (accounts.find((account) => !account.isArchived)?.id ?? ''),
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
        setCardPayment(transaction.cardPayment || null);
        setStatus(transaction.status || 'CONFIRMED');
        setRecurrenceId(transaction.recurrenceId || null);
        setTitle(transaction.title);
        setDescription(transaction.description ?? '');
        setAmount(formatCurrencyInput(transaction.amount));
        setType(transaction.type);
        setDate(transaction.date.split('T')[0]);
        setCategoryId(transaction.categoryId);
        setAccountId(transaction.accountId);
      })
      .catch(() => {
        Alert.alert('Erro', 'Transação não encontrada');
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
    if (saving.current) return;
    const amountResult = amountSchema.safeParse(
      normalizeAmountForValidation(amount),
    );

    const next: Record<string, string> = {};
    if (!title.trim()) next.title = 'Informe o título';
    if (!amountResult.success)
      next.amount =
        amountResult.error.issues[0]?.message ?? 'Informe um valor válido';
    if (!accountId) next.accountId = 'Selecione uma conta';
    if (!categoryId) next.categoryId = 'Selecione uma categoria';
    if (!isValidDateValue(date)) next.date = 'Informe uma data válida';
    setErrors(next);
    if (Object.keys(next).length) return;
    const parsedAmount = Number(amountResult.data);
    saving.current = true;
    setIsSubmitting(true);
    try {
      const payload = {
        status,
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
      notify(err.message);
    } finally {
      saving.current = false;
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!transactionId || saving.current) return;

    const confirmed = await confirmAction(
      'Excluir transação',
      'Tem certeza que deseja excluir esta transação?',
      'Excluir',
    );
    if (!confirmed) return;

    saving.current = true;
    setIsSubmitting(true);
    try {
      await remove(transactionId);
      router.back();
    } catch (err: any) {
      notify(err.message);
    } finally {
      saving.current = false;
      setIsSubmitting(false);
    }
  };

  if (isLoadingTransaction) {
    return (
      <View className="flex-1 bg-[#F7F8FA] pt-8">
        <LoadingSkeleton variant="form" label="Carregando lançamento" />
      </View>
    );
  }

  if (cardPayment)
    return (
      <>
        <Stack.Screen options={{ title: 'Pagamento de fatura' }} />
        <SafeAreaView className="flex-1 bg-[#F7F8FA]">
          <View className="p-4">
            <Text className="mb-3 text-lg font-semibold text-[#101828]">
              {title}
            </Text>
            <Text className="mb-3 text-2xl font-bold text-[#101828]">
              {showValues
                ? formatCurrency(parseCurrencyInput(amount))
                : 'R$ ••••••'}
            </Text>
            <Text className="mb-5 text-sm leading-6 text-[#667085]">
              Este lançamento faz parte de um pagamento integral de fatura. Para
              preservar o saldo e as parcelas, gerencie o pagamento pela fatura
              do cartão.
            </Text>
            <Button
              title="Abrir fatura do cartão"
              onPress={() =>
                router.push({
                  pathname: '/cards/invoice',
                  params: {
                    cardId: cardPayment.invoice.cardId,
                    id: cardPayment.invoiceId,
                  },
                })
              }
            />
          </View>
        </SafeAreaView>
      </>
    );
  return (
    <>
      <Stack.Screen
        options={{
          title: `${isEditing ? 'Editar' : 'Nova'} ${type === TransactionType.EXPENSE ? 'Despesa' : 'Receita'}`,
        }}
      />
      <SafeAreaView
        className="flex-1 bg-[#F7F8FA]"
        edges={['left', 'right', 'bottom']}
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            className="flex-1 px-4"
            contentContainerStyle={{ paddingBottom: 60, paddingTop: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="mb-6 rounded-lg bg-white p-5">
              <Text className="mb-3 ml-1 text-sm font-medium text-[#667085]">
                Tipo de transação
              </Text>
              <View className="mb-8 flex-row rounded-lg bg-[#F2F4F7] p-1">
                <TouchableOpacity
                  className={`flex-1 flex-row items-center justify-center rounded-lg py-3 ${
                    type === TransactionType.EXPENSE ? 'bg-white' : ''
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
                      type === TransactionType.EXPENSE ? '#FF6B6B' : '#667085'
                    }
                  />
                  <Text
                    className={`font-semibold text-base ${type === TransactionType.EXPENSE ? 'text-[#FF6B6B]' : 'text-[#667085]'}`}
                  >
                    {'  '}Despesa
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 flex-row items-center justify-center rounded-lg py-3 ${
                    type === TransactionType.INCOME ? 'bg-white' : ''
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
                      type === TransactionType.INCOME ? '#169670' : '#667085'
                    }
                  />
                  <Text
                    className={`font-semibold text-base ${type === TransactionType.INCOME ? 'text-[#169670]' : 'text-[#667085]'}`}
                  >
                    {'  '}Receita
                  </Text>
                </TouchableOpacity>
              </View>

              <Select
                label="Situação"
                value={status}
                options={[
                  { value: 'CONFIRMED', label: 'Confirmado — altera o saldo' },
                  {
                    value: 'PLANNED',
                    label: 'Previsto — ainda não pago ou recebido',
                  },
                ]}
                onChange={(value) =>
                  setStatus(value as 'CONFIRMED' | 'PLANNED')
                }
              />
              {recurrenceId ? (
                <View className="mb-4">
                  <Button
                    title="Editar próximas da recorrência"
                    variant="outline"
                    onPress={() =>
                      router.push({
                        pathname: '/recurrence',
                        params: { id: recurrenceId },
                      })
                    }
                  />
                  <Text className="mt-2 text-sm text-[#667085]">
                    Salvar aqui altera somente esta ocorrência.
                  </Text>
                </View>
              ) : null}
              <Input
                label="Título"
                error={errors.title}
                value={title}
                onChangeText={setTitle}
                placeholder="Ex: Almoço, Salário..."
                maxLength={INPUT_LIMITS.transactionTitle}
              />
              <Input
                label="Valor (R$)"
                error={errors.amount}
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
              {errors.date ? (
                <Text className="mb-2 text-sm text-[#B42318]">
                  {errors.date}
                </Text>
              ) : null}
              <DateInput label="Data" value={date} onChange={setDate} />

              <View className="mb-6">
                <Text className="mb-3 ml-1 text-sm font-medium text-[#667085]">
                  Conta
                </Text>
                {errors.accountId ? (
                  <Text className="mb-2 text-sm text-[#B42318]">
                    {errors.accountId}
                  </Text>
                ) : null}
                {isLoadingAccounts ? (
                  <LoadingSkeleton variant="field" label="Carregando contas" />
                ) : accountError ? (
                  <View className="rounded-lg border border-[#FFB4B4] bg-[#FFF1F1] px-4 py-4">
                    <Text className="text-sm text-[#B42318]">
                      {accountError}
                    </Text>
                    <TouchableOpacity onPress={() => void fetchAccounts(true)}>
                      <Text className="mt-2 font-semibold text-[#047857]">
                        Tentar novamente
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : accounts.length === 0 ? (
                  <TouchableOpacity
                    onPress={() => router.push('/accounts/create')}
                    className="rounded-lg border border-dashed border-[#169670] bg-[#EAFBF0] px-4 py-4"
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
                {accounts.length > 0 ? (
                  <TouchableOpacity
                    accessibilityRole="button"
                    onPress={() => router.push('/accounts/create')}
                    className="py-3"
                  >
                    <Text className="font-semibold text-[#047857]">
                      Cadastrar nova conta
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              <View className="mb-6">
                <Text className="mb-3 ml-1 text-sm font-medium text-[#667085]">
                  Categoria de Lançamento
                </Text>
                <QueryState
                  loading={loadingCategories}
                  error={categoryError}
                  retry={() => void fetchCategories(true)}
                />
                {errors.categoryId ? (
                  <Text className="mb-2 text-sm text-[#B42318]">
                    {errors.categoryId}
                  </Text>
                ) : null}
                <View className="flex-row flex-wrap gap-3">
                  {categories.map((cat) => {
                    const icon = CATEGORY_ICONS[cat.icon] || '🏷️';
                    const isSelected = categoryId === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => setCategoryId(cat.id)}
                        className={`flex-row items-center rounded-lg border px-4 py-3 ${
                          isSelected
                            ? 'border-2'
                            : 'border-[#EAECF0] bg-[#F9FAFB]'
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
                          className={`text-sm ${isSelected ? 'font-semibold text-[#344054]' : 'font-medium text-[#667085]'}`}
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
                    ? 'Salvar Alterações'
                    : type === TransactionType.EXPENSE
                      ? 'Salvar Despesa'
                      : 'Salvar Receita'
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
                  disabled={isSubmitting}
                />
              ) : null}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
