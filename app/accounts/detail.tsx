import {
  KeyboardScreen as SafeAreaView,
  KeyboardFlatList as FlatList,
} from '../../src/components/KeyboardForm';
import { useTheme } from '../../src/theme/ThemeProvider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { QueryState } from '../../src/components/QueryState';
import { TransactionItem } from '../../src/components/TransactionItem';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { ColorPicker } from '../../src/components/ui/ColorPicker';
import { ACCOUNT_COLORS, ACCOUNT_ICON_OPTIONS } from '../../src/constants';
import { useResource } from '../../src/hooks/useResource';
import { AccountCard } from '../../src/components/AccountCard';
import { useAccountStore } from '../../src/stores/accountStore';
import { planningService } from '../../src/services/planningService';
import { accountService } from '../../src/services/accountService';
import { notify } from '../../src/stores/feedbackStore';
import { confirmAction } from '../../src/utils/confirmAction';
import { errorMessage } from '../../src/utils/errorMessage';
import { Statement } from '../../src/types';
export default function AccountDetail() {
  const theme = useTheme();
  const { id = '' } = useLocalSearchParams<{ id: string }>(),
    router = useRouter();
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
  const save = async () => {
    if (!account || busy.current) return;
    if (!name.trim() || !institution.trim()) {
      setFormError('Informe nome e instituição.');
      return;
    }
    busy.current = true;
    setSaving(true);
    try {
      await accountService.update(id, {
        name: name.trim(),
        institution: institution.trim(),
        color,
        icon,
      });
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
  const remove = async () => {
    if (!account || busy.current) return;
    if (
      !(await confirmAction(
        'Excluir conta do app',
        'A conta sairá das listas e seu saldo deixará de compor o total atual. O histórico será preservado; lançamentos desta conta ficarão apenas para consulta e as recorrências serão interrompidas. Esta ação não movimenta dinheiro no banco.',
        'Excluir conta',
      ))
    )
      return;
    if (busy.current) return;
    busy.current = true;
    setSaving(true);
    try {
      await useAccountStore.getState().remove(id);
      router.replace('/(tabs)/accounts');
    } catch (err) {
      notify(errorMessage(err, 'Não foi possível excluir a conta.'));
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
    <SafeAreaView className="flex-1 bg-app-background">
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
                <AccountCard
                  account={account}
                  onEdit={!editing ? beginEdit : undefined}
                  onTransfer={() =>
                    router.push({
                      pathname: '/transfer',
                      params: { fromAccountId: account.id },
                    })
                  }
                />
                <Text className="mb-4 text-xs text-app-textMuted">
                  Lançamentos previstos não alteram o saldo atual.
                </Text>
                {editing ? (
                  <View className="mb-4 rounded-lg bg-app-surface p-4">
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
                            borderColor:
                              icon === value
                                ? theme.colors.primary
                                : theme.colors.border,
                          }}
                        >
                          <MaterialCommunityIcons
                            name={value as never}
                            size={22}
                            color={theme.colors.text}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                    {formError ? (
                      <Text className="mb-3 text-app-danger">{formError}</Text>
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
                      title="Excluir conta do app"
                      variant="danger"
                      onPress={remove}
                      isLoading={saving}
                    />
                  </View>
                )}
                <Text className="mb-3 text-lg font-semibold text-app-text">
                  Extrato
                </Text>
                {!resource.data?.entries.length ? (
                  <Text className="mb-5 text-app-textMuted">
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
