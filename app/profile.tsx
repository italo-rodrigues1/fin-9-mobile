import {
  KeyboardScreen as SafeAreaView,
  KeyboardScrollView as ScrollView,
} from '../src/components/KeyboardForm';
import { useThemeStore } from '../src/stores/themeStore';
import { Select } from '../src/components/ui/Select';
import { useRouter } from 'expo-router';
import { confirmAction } from '../src/utils/confirmAction';
import { notify } from '../src/stores/feedbackStore';
import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useAuthStore } from '../src/stores/authStore';
import { Button } from '../src/components/ui/Button';
import { Input } from '../src/components/ui/Input';
import { Card } from '../src/components/ui/Card';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { INPUT_LIMITS } from '../src/constants';

export default function ProfileScreen() {
  const themePreference = useThemeStore((s) => s.preference),
    setThemePreference = useThemeStore((s) => s.setPreference);
  const router = useRouter();
  const { user, logout, updateProfile, deleteAccount } = useAuthStore();
  const [nameError, setNameError] = useState('');
  const [name, setName] = useState(user?.name || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    if (isSaving) return;
    if (!name.trim()) return setNameError('Informe seu nome');
    setNameError('');
    setIsSaving(true);
    try {
      await updateProfile(name.trim());
      setIsEditing(false);
      notify('Perfil atualizado com sucesso.');
    } catch (err: any) {
      notify(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    if (await confirmAction('Sair', 'Tem certeza que deseja sair?', 'Sair')) {
      try {
        await logout();
      } catch {
        notify('Não foi possível sair. Tente novamente.');
      }
    }
  };
  const handleDeleteAccount = async () => {
    if (isDeleting) return;
    if (
      !(await confirmAction(
        'Excluir perfil e dados',
        'Seu perfil e todos os seus dados financeiros serão apagados permanentemente.',
        'Continuar',
      ))
    )
      return;
    if (
      !(await confirmAction(
        'Confirmação final',
        'Essa exclusão não pode ser desfeita. Deseja continuar?',
        'Excluir definitivamente',
      ))
    )
      return;
    setIsDeleting(true);
    try {
      await deleteAccount();
      notify('Conta excluída com sucesso.');
    } catch (err: any) {
      notify(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-app-background">
      <ScreenHeader title="Perfil" />
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="items-center pb-8 pt-4">
          <View className="mb-5 h-24 w-24 items-center justify-center rounded-full bg-app-primaryLight">
            <Text className="text-3xl font-semibold text-app-primaryText">
              {(user?.name || 'EA').slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <Text className="text-2xl font-bold tracking-tight text-app-text">
            {user?.name}
          </Text>
          <Text className="mt-1 text-sm font-medium text-app-textMuted">
            {user?.email}
          </Text>
        </View>

        <Card className="mb-6 p-5">
          <Text className="mb-5 flex-row items-center text-xl font-bold text-app-text">
            Informações Pessoais
          </Text>

          {isEditing ? (
            <View className="mt-2">
              <Input
                label="Nome"
                error={nameError}
                value={name}
                onChangeText={setName}
                placeholder="Seu nome completo"
                maxLength={INPUT_LIMITS.name}
              />
              <View className="flex-row gap-4 mt-2">
                <View className="flex-1">
                  <Button
                    title="Cancelar"
                    onPress={() => {
                      setIsEditing(false);
                      setName(user?.name || '');
                    }}
                    variant="outline"
                  />
                </View>
                <View className="flex-1">
                  <Button
                    title="Salvar"
                    onPress={handleSave}
                    isLoading={isSaving}
                  />
                </View>
              </View>
            </View>
          ) : (
            <View>
              <View className="flex-row items-center justify-between border-b border-app-border py-4">
                <Text className="text-sm font-medium text-app-textMuted">
                  Nome
                </Text>
                <Text className="text-sm font-semibold text-app-text">
                  {user?.name}
                </Text>
              </View>
              <View className="flex-row justify-between items-center border-b border-app-border py-4">
                <Text className="text-sm font-medium text-app-textMuted">
                  E-mail
                </Text>
                <Text className="text-sm font-semibold text-app-text">
                  {user?.email}
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-4">
                <Text className="text-sm font-medium text-app-textMuted">
                  Membro desde
                </Text>
                <Text className="text-sm font-semibold text-app-primaryText">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('pt-BR')
                    : '-'}
                </Text>
              </View>
              <View className="mt-6">
                <Button
                  title="Editar Perfil"
                  onPress={() => setIsEditing(true)}
                  variant="secondary"
                />
              </View>
            </View>
          )}
        </Card>

        <Card className="mb-6 p-5">
          <Text className="mb-4 text-lg font-bold text-app-text">
            Aparência
          </Text>
          <Select
            label="Tema do aplicativo"
            value={themePreference}
            options={[
              { value: 'system', label: 'Seguir o sistema' },
              { value: 'light', label: 'Claro' },
              { value: 'dark', label: 'Escuro' },
            ]}
            onChange={(value) => {
              void setThemePreference(
                value as 'system' | 'light' | 'dark',
              ).catch(() =>
                notify(
                  'Tema aplicado, mas não foi possível salvar a preferência.',
                ),
              );
            }}
          />
          <Text className="text-sm leading-6 text-app-textMuted">
            A preferência vale para todo o aplicativo e será mantida nas
            próximas aberturas.
          </Text>
        </Card>
        <Card className="mb-8 p-5">
          <Text className="mb-3 text-lg font-bold text-app-text">
            Sobre o App
          </Text>
          <Text className="text-sm leading-6 text-app-textMuted">
            <Text className="font-bold text-app-textMuted">Fin-9 v1.0.0</Text>
            {'\n'}
            Domine suas finanças pessoais de forma simples, eficiente e
            elegante.
          </Text>
        </Card>

        <View className="pb-8">
          <Button
            title="Sair da Conta"
            onPress={handleLogout}
            variant="primary"
          />
        </View>

        <Card className="border border-app-dangerBorder bg-app-dangerBackground p-5">
          <Text className="mb-2 text-lg font-bold text-app-danger">
            Zona de perigo
          </Text>
          <Text className="mb-5 text-sm leading-6 text-app-danger">
            Exclua sua conta para remover permanentemente seu perfil e todas as
            informacoes financeiras relacionadas.
          </Text>
          <Button
            title="Excluir perfil e dados"
            onPress={handleDeleteAccount}
            variant="danger"
            isLoading={isDeleting}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
