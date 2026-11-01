import {
  KeyboardScreen as SafeAreaView,
  KeyboardScrollView as ScrollView,
} from '../../src/components/KeyboardForm';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { QueryState } from '../../src/components/QueryState';
import { Input } from '../../src/components/ui/Input';
import { Select } from '../../src/components/ui/Select';
import { Button } from '../../src/components/ui/Button';
import { useResource } from '../../src/hooks/useResource';
import { cardService } from '../../src/services/cardService';
import { CARD_BRAND_OPTIONS } from '../../src/constants/cardBrands';
import { notify } from '../../src/stores/feedbackStore';
import { errorMessage } from '../../src/utils/errorMessage';
import {
  formatCurrencyInput,
  parseCurrencyInput,
  sanitizeCurrencyInput,
  MAX_MONEY_VALUE,
} from '../../src/utils/format';
export default function EditCard() {
  const { id } = useLocalSearchParams<{ id?: string }>(),
    router = useRouter(),
    busy = useRef(false),
    seeded = useRef(false);
  const [name, setName] = useState(''),
    [brand, setBrand] = useState(''),
    [limit, setLimit] = useState(''),
    [closing, setClosing] = useState(''),
    [due, setDue] = useState(''),
    [archived, setArchived] = useState('false'),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [saving, setSaving] = useState(false);
  const r = useResource(
    useCallback(
      () => (id ? cardService.detail(id) : Promise.resolve(null)),
      [id],
    ),
  );
  useEffect(() => {
    if (r.data && !seeded.current) {
      seeded.current = true;
      const c = r.data.card;
      setName(c.name);
      setBrand(c.brand || '');
      setLimit(formatCurrencyInput(c.creditLimit));
      setClosing(String(c.closingDay));
      setDue(String(c.dueDay));
      setArchived(String(c.isArchived));
    }
  }, [r.data]);
  const save = async () => {
    if (busy.current) return;
    const next: Record<string, string> = {},
      value = parseCurrencyInput(limit);
    if (!name.trim()) next.name = 'Informe o nome do cartão.';
    if (
      !limit ||
      !Number.isFinite(value) ||
      value <= 0 ||
      value > MAX_MONEY_VALUE
    )
      next.limit = 'Informe um limite válido.';
    if (
      !/^\d{1,2}$/.test(closing) ||
      Number(closing) < 1 ||
      Number(closing) > 31
    )
      next.closing = 'Use um dia de 1 a 31.';
    if (!/^\d{1,2}$/.test(due) || Number(due) < 1 || Number(due) > 31)
      next.due = 'Use um dia de 1 a 31.';
    setErrors(next);
    if (Object.keys(next).length) return;
    busy.current = true;
    setSaving(true);
    try {
      const c = await cardService.save(
        {
          name: name.trim(),
          brand:
            CARD_BRAND_OPTIONS.find((option) => option.value === brand)
              ?.value ?? null,
          creditLimit: value,
          closingDay: Number(closing),
          dueDay: Number(due),
          isArchived: archived === 'true',
        },
        id,
      );
      notify('Cartão salvo.');
      if (id && router.canGoBack()) router.back();
      else router.replace({ pathname: '/cards/detail', params: { id: c.id } });
    } catch (e) {
      notify(errorMessage(e, 'Não foi possível salvar o cartão.'));
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };
  const fixed = Boolean(r.data?.invoices.length);
  return (
    <SafeAreaView className="flex-1 bg-app-background">
      <ScreenHeader title={id ? 'Editar cartão' : 'Novo cartão'} />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        <QueryState loading={r.loading} error={r.error} retry={r.reload} />
        {!r.loading && !r.error ? (
          <View className="rounded-lg bg-app-surface p-4">
            <Input
              label="Nome do cartão"
              value={name}
              onChangeText={setName}
              maxLength={100}
              error={errors.name}
            />
            <Select
              label="Bandeira do cartão"
              value={brand}
              onChange={setBrand}
              options={[
                { value: '', label: 'Não informada' },
                ...CARD_BRAND_OPTIONS,
              ]}
            />
            <Input
              label="Limite total (R$)"
              value={limit}
              onChangeText={(v) => setLimit(sanitizeCurrencyInput(v))}
              keyboardType="decimal-pad"
              error={errors.limit}
            />
            {fixed ? (
              <Text className="mb-5 text-sm leading-6 text-app-textMuted">
                Fechamento dia {closing} e vencimento dia {due}. O ciclo é
                preservado após criar faturas. Para usar outro ciclo, cadastre
                outro cartão.
              </Text>
            ) : (
              <>
                <Input
                  label="Dia do fechamento"
                  value={closing}
                  onChangeText={(v) => setClosing(v.replace(/\D/g, ''))}
                  keyboardType="numeric"
                  maxLength={2}
                  error={errors.closing}
                />
                <Input
                  label="Dia do vencimento"
                  value={due}
                  onChangeText={(v) => setDue(v.replace(/\D/g, ''))}
                  keyboardType="numeric"
                  maxLength={2}
                  error={errors.due}
                />
                <Text className="mb-5 text-sm leading-6 text-app-textMuted">
                  Se o dia do vencimento for menor ou igual ao fechamento, o
                  vencimento será no mês seguinte.
                </Text>
              </>
            )}
            {id ? (
              <Select
                label="Situação do cartão"
                value={archived}
                onChange={setArchived}
                options={[
                  { value: 'false', label: 'Ativo' },
                  {
                    value: 'true',
                    label: 'Arquivado — preserva compras e pagamentos',
                  },
                ]}
              />
            ) : null}
            <Button title="Salvar cartão" onPress={save} isLoading={saving} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
