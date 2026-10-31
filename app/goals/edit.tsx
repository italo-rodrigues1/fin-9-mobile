import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { QueryState } from '../../src/components/QueryState';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { DateInput, isValidDateValue } from '../../src/components/ui/DateInput';
import { useResource } from '../../src/hooks/useResource';
import { goalService } from '../../src/services/goalService';
import { notify } from '../../src/stores/feedbackStore';
import { errorMessage } from '../../src/utils/errorMessage';
import {
  formatCurrencyInput,
  parseCurrencyInput,
  sanitizeCurrencyInput,
  MAX_MONEY_VALUE,
} from '../../src/utils/format';
export default function EditGoal() {
  const { id } = useLocalSearchParams<{ id?: string }>(),
    router = useRouter(),
    busy = useRef(false),
    seeded = useRef(false);
  const [name, setName] = useState(''),
    [target, setTarget] = useState(''),
    [deadline, setDeadline] = useState(''),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [saving, setSaving] = useState(false);
  const resource = useResource(
    useCallback(
      () => (id ? goalService.detail(id) : Promise.resolve(null)),
      [id],
    ),
  );
  useEffect(() => {
    if (resource.data && !seeded.current) {
      seeded.current = true;
      const g = resource.data.goal;
      setName(g.name);
      setTarget(formatCurrencyInput(g.targetAmount));
      setDeadline(g.deadline?.slice(0, 10) || '');
    }
  }, [resource.data]);
  const save = async () => {
    if (busy.current) return;
    const next: Record<string, string> = {},
      value = parseCurrencyInput(target);
    if (!name.trim()) next.name = 'Informe o nome da meta.';
    if (
      !target ||
      !Number.isFinite(value) ||
      value <= 0 ||
      value > MAX_MONEY_VALUE
    )
      next.target = 'Informe um valor-alvo válido.';
    if (deadline && !isValidDateValue(deadline))
      next.deadline = 'Informe uma data válida ou deixe em branco.';
    setErrors(next);
    if (Object.keys(next).length) return;
    busy.current = true;
    setSaving(true);
    try {
      const g = await goalService.save(
        { name: name.trim(), targetAmount: value, deadline: deadline || null },
        id,
      );
      notify('Meta salva.');
      if (id && router.canGoBack()) router.back();
      else router.replace({ pathname: '/goals/detail', params: { id: g.id } });
    } catch (err) {
      notify(errorMessage(err, 'Não foi possível salvar a meta.'));
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FA]">
      <ScreenHeader title={id ? 'Editar meta' : 'Nova meta'} />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        <QueryState
          loading={resource.loading}
          error={resource.error}
          retry={resource.reload}
        />
        {!resource.loading && !resource.error ? (
          <View className="rounded-lg bg-white p-4">
            <Input
              label="Nome da meta"
              value={name}
              onChangeText={setName}
              maxLength={100}
              error={errors.name}
            />
            <Input
              label="Valor-alvo (R$)"
              value={target}
              onChangeText={(v) => setTarget(sanitizeCurrencyInput(v))}
              keyboardType="decimal-pad"
              error={errors.target}
            />
            <DateInput
              label="Prazo (opcional)"
              value={deadline}
              onChange={setDeadline}
            />
            {errors.deadline ? (
              <Text className="mb-3 text-[#B42318]">{errors.deadline}</Text>
            ) : null}
            {deadline ? (
              <View className="mb-4">
                <Button
                  title="Remover prazo"
                  variant="outline"
                  onPress={() => setDeadline('')}
                />
              </View>
            ) : null}
            <Text className="mb-5 text-sm leading-6 text-[#667085]">
              O valor-alvo pode ser alterado depois. As contribuições já
              registradas serão preservadas.
            </Text>
            <Button title="Salvar meta" onPress={save} isLoading={saving} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
