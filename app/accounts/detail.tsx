import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { QueryState } from '../../src/components/QueryState';
import { TransactionItem } from '../../src/components/TransactionItem';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { ColorPicker } from '../../src/components/ui/ColorPicker';
import { ACCOUNT_COLORS, ACCOUNT_ICON_OPTIONS } from '../../src/constants';
import { useResource } from '../../src/hooks/useResource';
import { usePrivacyStore } from '../../src/stores/privacyStore';
import { useAccountStore } from '../../src/stores/accountStore';
import { planningService } from '../../src/services/planningService';
import { accountService } from '../../src/services/accountService';
import { notify } from '../../src/stores/feedbackStore';
import { confirmAction } from '../../src/utils/confirmAction';
import { errorMessage } from '../../src/utils/errorMessage';
import { formatCurrency } from '../../src/utils/format';
import { Statement } from '../../src/types';
export default function AccountDetail() {
  const { id = '' } = useLocalSearchParams<{ id: string }>(),
    router = useRouter(),
    show = usePrivacyStore((s) => s.showValues);
  const resource = useResource(
    useCallback(() => planningService.statement(id), [id]),
  );
  const account = resource.data?.account;
  const [editing, setEditing] = useState(false),
    [name, setName] = useState(''),
    [institution, setInstitution] = useState(''),
    [color, setColor] = useState(ACCOUNT_COLORS[0]),
    [icon, setIcon] = useState('bank-outline'),
    [saving, setSaving] = useState(false),
    [formError, setFormError] = useState(''),
    [extra, setExtra] = useState<Statement['entries']>([]),
    [hasMore, setHasMore] = useState(false),
    [more, setMore] = useState(false);
  const busy = useRef(false);
  useEffect(() => {
    setExtra([]);
    setHasMore(resource.data?.hasMore || false);
  }, [resource.data]);
  const beginEdit = () => {
    if (!account) return;
    setName(account.name);
    setInstitution(account.institution);
    setColor(account.color);
    setIcon(account.icon);
    setEditing(true);
    setFormError('');
  };
  const save = async (archive?: boolean) => {
    if (!account || busy.current) return;
    if (archive === undefined && (!name.trim() || !institution.trim())) {
      setFormError('Informe nome e instituição.');
      return;
    }
    if (
      archive !== undefined &&
      !(await confirmAction(
        archive ? 'Arquivar conta' : 'Reativar conta',
        archive
          ? 'O saldo e o histórico serão mantidos. A conta sairá da seleção de novos lançamentos.'
          : 'A conta voltará à seleção de lançamentos.',
        archive ? 'Arquivar' : 'Reativar',
      ))
    )
      return;
    busy.current = true;
    setSaving(true);
    try {
      await accountService.update(
        id,
        archive === undefined
          ? { name: name.trim(), institution: institution.trim(), color, icon }
          : { isArchived: archive },
      );
      await useAccountStore.getState().fetch(true);
      setEditing(false);
      await resource.reload();
      notify('Conta atualizada.');
    } catch (err) {
      notify(errorMessage(err, 'Não foi possível salvar a conta.'));
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };
  const loadMore = async () => {
    if (more || !resource.data) return;
    setMore(true);
    try {
      const next = await planningService.statement(
        id,
        resource.data.entries.length + extra.length,
      );
      setExtra((old) => [...old, ...next.entries]);
      setHasMore(next.hasMore);
    } catch (err) {
      notify(errorMessage(err, 'Não foi possível carregar o extrato.'));
    } finally {
      setMore(false);
    }
  };
  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FA]">
      <FlatList
        data={
          !resource.loading && !resource.error
            ? [...(resource.data?.entries || []), ...extra]
            : []
        }
        keyExtractor={(item) => item.kind + item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        renderItem={({ item }) => (
          <TransactionItem
            item={item}
            onPress={() =>
              item.kind === 'TRANSFER'
                ? router.push({
                    pathname: '/transfer',
                    params: { id: item.id },
                  })
                : router.push('/(tabs)/transactions/' + item.id)
            }
          />
        )}
        ListHeaderComponent={
          <View>
            <ScreenHeader title="Detalhes da conta" />
            <QueryState
              loading={resource.loading}
              error={resource.error}
              retry={resource.reload}
            />
            {!resource.loading && !resource.error && account ? (
              <>
                <View
                  className="mb-4 rounded-lg bg-white p-5"
                  style={{ borderTopWidth: 3, borderTopColor: account.color }}
                >
                  <Text className="text-xs text-[#667085]">
                    {account.institution}
                    {account.isArchived ? ' · Arquivada' : ''}
                  </Text>
                  <Text className="mt-1 text-xl font-bold text-[#101828]">
                    {account.name}
                  </Text>
                  <Text className="mt-4 text-3xl font-bold text-[#101828]">
                    {show ? formatCurrency(account.balance) : 'R$ ••••••'}
                  </Text>
                  <Text className="mt-2 text-sm text-[#667085]">
                    Saldo atual · previstos não alteram este valor.
                  </Text>
                </View>
                {editing ? (
                  <View className="mb-4 rounded-lg bg-white p-4">
                    <Input
                      label="Nome"
                      value={name}
                      onChangeText={setName}
                      maxLength={100}
                    />
                    <Input
                      label="Instituição"
                      value={institution}
                      onChangeText={setInstitution}
                      maxLength={100}
                    />
                    <ColorPicker
                      label="Cor"
                      value={color}
                      onChange={setColor}
                      colors={ACCOUNT_COLORS}
                    />
                    <View className="mb-4 flex-row flex-wrap gap-3">
                      {ACCOUNT_ICON_OPTIONS.map((value) => (
                        <TouchableOpacity
                          key={value}
                          onPress={() => setIcon(value)}
                          className="h-11 w-11 items-center justify-center rounded-lg border"
                          style={{
                            borderColor: icon === value ? '#047857' : '#E4E7EC',
                          }}
                        >
                          <MaterialCommunityIcons
                            name={value as never}
                            size={22}
                            color="#344054"
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                    {formError ? (
                      <Text className="mb-3 text-[#B42318]">{formError}</Text>
                    ) : null}
                    <Button
                      title="Salvar alterações"
                      onPress={() => void save()}
                      isLoading={saving}
                    />
                    <View className="mt-3">
                      <Button
                        title="Cancelar"
                        variant="outline"
                        onPress={() => setEditing(false)}
                      />
                    </View>
                  </View>
                ) : (
                  <View className="mb-4 gap-3">
                    <Button
                      title="Editar conta"
                      variant="outline"
                      onPress={beginEdit}
                    />
                    <Button
                      title={
                        account.isArchived ? 'Reativar conta' : 'Arquivar conta'
                      }
                      variant="outline"
                      onPress={() => void save(!account.isArchived)}
                      isLoading={saving}
                    />
                  </View>
                )}
                <Text className="mb-3 text-lg font-semibold text-[#101828]">
                  Extrato
                </Text>
                {!resource.data?.entries.length ? (
                  <Text className="mb-5 text-[#667085]">
                    Nenhuma movimentação nesta conta.
                  </Text>
                ) : null}
              </>
            ) : null}
          </View>
        }
        ListFooterComponent={
          hasMore ? (
            <Button
              title="Carregar mais"
              variant="outline"
              onPress={loadMore}
              isLoading={more}
            />
          ) : undefined
        }
      />
    </SafeAreaView>
  );
}
