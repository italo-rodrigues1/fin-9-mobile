import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { QueryState } from '../../src/components/QueryState';
import { Input } from '../../src/components/ui/Input';
import { Select } from '../../src/components/ui/Select';
import { Button } from '../../src/components/ui/Button';
import {
  DateInput,
  getLocalDateValue,
  isValidDateValue,
} from '../../src/components/ui/DateInput';
import { useResource } from '../../src/hooks/useResource';
import { cardService } from '../../src/services/cardService';
import { categoryService } from '../../src/services/categoryService';
import { usePrivacyStore } from '../../src/stores/privacyStore';
import { notify } from '../../src/stores/feedbackStore';
import { confirmAction } from '../../src/utils/confirmAction';
import { errorMessage } from '../../src/utils/errorMessage';
import {
  formatCurrency,
  formatCurrencyInput,
  formatDate,
  parseCurrencyInput,
  sanitizeCurrencyInput,
  MAX_MONEY_VALUE,
} from '../../src/utils/format';
import { previewCardSchedule } from '../../src/utils/cardSchedule';
export default function Purchase() {
  const { cardId, id } = useLocalSearchParams<{
      cardId: string;
      id?: string;
    }>(),
    router = useRouter(),
    busy = useRef(false),
    seeded = useRef(false),
    requestId = useRef(
      Date.now().toString(36) + '-' + Math.random().toString(36).slice(2),
    ),
    show = usePrivacyStore((s) => s.showValues);
  const [title, setTitle] = useState(''),
    [amount, setAmount] = useState(''),
    [date, setDate] = useState(getLocalDateValue),
    [categoryId, setCategory] = useState(''),
    [count, setCount] = useState('1'),
    [all, setAll] = useState(false),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [saving, setSaving] = useState(false);
  const r = useResource(
    useCallback(async () => {
      const [detail, categories, entry] = await Promise.all([
        cardService.detail(cardId),
        categoryService.getAll(),
        id ? cardService.purchase(cardId, id) : Promise.resolve(null),
      ]);
      return { detail, categories, entry };
    }, [cardId, id]),
  );
  useEffect(() => {
    if (r.data?.entry && !seeded.current) {
      seeded.current = true;
      const p = r.data.entry;
      setTitle(p.title);
      setAmount(formatCurrencyInput(p.amount));
      setDate(p.date.slice(0, 10));
      setCategory(p.categoryId);
      setCount(String(p.installmentCount));
    }
  }, [r.data]);
  const locked = r.data?.entry?.canEdit === false,
    card = r.data?.detail.card,
    preview =
      card && isValidDateValue(date)
        ? previewCardSchedule(
            date,
            card.closingDay,
            card.dueDay,
            Number(count),
            parseCurrencyInput(amount),
          )
        : [];
  const save = async () => {
    if (busy.current) return;
    const next: Record<string, string> = {},
      value = parseCurrencyInput(amount);
    if (!title.trim()) next.title = 'Informe a descrição da compra.';
    if (!categoryId) next.category = 'Selecione uma categoria.';
    if (
      !amount ||
      !Number.isFinite(value) ||
      value <= 0 ||
      value > MAX_MONEY_VALUE ||
      Math.round(value * 100) < Number(count)
    )
      next.amount =
        'Informe um total válido, com ao menos um centavo por parcela.';
    if (
      !isValidDateValue(date) ||
      date > getLocalDateValue() ||
      Number(date.slice(0, 4)) < 1900 ||
      Number(date.slice(0, 4)) > 9990
    )
      next.date = 'Informe uma data válida, sem data futura.';
    setErrors(next);
    if (Object.keys(next).length) return;
    busy.current = true;
    setSaving(true);
    try {
      await cardService.savePurchase(
        cardId,
        {
          title: title.trim(),
          amount: value,
          date,
          categoryId,
          installmentCount: Number(count),
          ...(!id ? { requestId: requestId.current } : {}),
        },
        id,
      );
      notify('Compra salva. O saldo das contas foi mantido.');
      if (router.canGoBack()) router.back();
      else
        router.replace({ pathname: '/cards/detail', params: { id: cardId } });
    } catch (e) {
      notify(errorMessage(e, 'Não foi possível salvar a compra.'));
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };
  const remove = async () => {
    if (
      !id ||
      busy.current ||
      !(await confirmAction(
        'Excluir compra',
        'Todas as parcelas desta compra serão removidas. O saldo das contas será mantido.',
        'Excluir',
      ))
    )
      return;
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    try {
      await cardService.removePurchase(cardId, id);
      notify('Compra excluída.');
      router.replace({ pathname: '/cards/detail', params: { id: cardId } });
    } catch (e) {
      notify(errorMessage(e, 'Não foi possível excluir a compra.'));
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FA]">
      <ScreenHeader title={id ? 'Compra no cartão' : 'Nova compra no cartão'} />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        <QueryState loading={r.loading} error={r.error} retry={r.reload} />
        {!r.loading && !r.error && card ? (
          <View className="rounded-lg bg-white p-4">
            <Text className="mb-4 text-lg font-semibold text-[#101828]">
              {card.name}
            </Text>
            {locked ? (
              <Text className="text-sm leading-6 text-[#667085]">
                Esta compra tem parcelas pagas. Estorne os registros de
                pagamento nas respectivas faturas para alterar ou excluir a
                compra.
              </Text>
            ) : card.isArchived ? (
              <Text className="text-sm leading-6 text-[#667085]">
                Reative o cartão para registrar ou editar compras.
              </Text>
            ) : (
              <>
                <Text className="mb-5 text-sm leading-6 text-[#667085]">
                  Informe o valor total da compra. Parcelas sem juros
                  comprometem o limite agora e compõem as faturas; o saldo só
                  muda ao registrar o pagamento.
                </Text>
                <Input
                  label="Descrição da compra"
                  value={title}
                  onChangeText={setTitle}
                  maxLength={100}
                  error={errors.title}
                />
                <Input
                  label="Valor total da compra (R$)"
                  value={amount}
                  onChangeText={(v) => setAmount(sanitizeCurrencyInput(v))}
                  keyboardType="decimal-pad"
                  error={errors.amount}
                />
                <Select
                  label="Categoria"
                  value={categoryId}
                  options={(r.data?.categories || []).map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                  onChange={setCategory}
                />
                {errors.category ? (
                  <Text className="mb-3 text-[#B42318]">{errors.category}</Text>
                ) : null}
                <DateInput
                  label="Data da compra"
                  value={date}
                  onChange={setDate}
                />
                {errors.date ? (
                  <Text className="mb-3 text-[#B42318]">{errors.date}</Text>
                ) : null}
                <Select
                  label="Parcelamento"
                  value={count}
                  onChange={setCount}
                  options={Array.from({ length: 36 }, (_, i) => ({
                    value: String(i + 1),
                    label: i
                      ? String(i + 1) + ' parcelas sem juros'
                      : 'À vista no crédito · 1 parcela',
                  }))}
                />
                {preview.length ? (
                  <View className="mb-5 rounded-lg bg-[#F2F4F7] p-4">
                    <Text className="mb-3 font-semibold text-[#344054]">
                      Previsão das parcelas
                    </Text>
                    {preview.slice(0, all ? 36 : 3).map((p) => (
                      <Text
                        key={p.number}
                        className="mb-2 text-sm leading-6 text-[#475467]"
                      >
                        {p.number}/{count} ·{' '}
                        {show ? formatCurrency(p.amount) : 'R$ ••••••'}
                        {String.fromCharCode(10)}Vence em{' '}
                        {formatDate(p.dueDate)}
                      </Text>
                    ))}
                    {preview.length > 3 ? (
                      <Button
                        title={
                          all
                            ? 'Mostrar menos parcelas'
                            : 'Ver todas as parcelas'
                        }
                        onPress={() => setAll(!all)}
                        variant="outline"
                      />
                    ) : null}
                    <Text className="mt-2 text-xs leading-5 text-[#667085]">
                      A soma das parcelas preserva o total da compra. Compras no
                      fechamento entram na próxima fatura.
                    </Text>
                  </View>
                ) : null}
                <Button
                  title="Salvar compra"
                  onPress={save}
                  isLoading={saving}
                />
              </>
            )}
            {id && !locked ? (
              <View className="mt-4">
                <Button
                  title="Excluir compra"
                  onPress={remove}
                  disabled={saving}
                  variant="danger"
                />
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
