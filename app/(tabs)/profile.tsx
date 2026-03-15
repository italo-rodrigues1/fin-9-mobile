import React, { useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/stores/authStore';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Card } from '../../src/components/ui/Card';

export default function ProfileScreen() {
  const { user, logout, updateProfile, deleteAccount } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert('Atenção', 'Informe seu nome');
    setIsSaving(true);
    try {
      await updateProfile(name.trim());
      setIsEditing(false);
      Alert.alert('Sucesso', 'Perfil atualizado!');
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Excluir conta',
      'Essa acao ira apagar permanentemente seu perfil e todos os dados vinculados, incluindo despesas, receitas, contas e categorias. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir conta',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmacao final',
              'Essa exclusao nao pode ser desfeita. Confirma a exclusao total da conta?',
              [
                { text: 'Voltar', style: 'cancel' },
                {
                  text: 'Excluir definitivamente',
                  style: 'destructive',
                  onPress: async () => {
                    setIsDeleting(true);
                    try {
                      await deleteAccount();
                      Alert.alert('Conta excluida', 'Sua conta e todos os dados relacionados foram removidos.');
                    } catch (err: any) {
                      Alert.alert('Erro', err.message);
                    } finally {
                      setIsDeleting(false);
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FA]">
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="items-center pt-10 pb-8">
          <View className="mb-5 h-24 w-24 items-center justify-center rounded-full bg-[#E9FBF3]">
            <Text className="text-3xl font-semibold text-[#169670]">
              {(user?.name || 'EA').slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <Text className="text-2xl font-bold tracking-tight text-[#344054]">{user?.name}</Text>
          <Text className="mt-1 text-sm font-medium text-[#98A2B3]">{user?.email}</Text>
        </View>

        <Card className="mb-6 p-5">
          <Text className="mb-5 flex-row items-center text-xl font-bold text-[#344054]">
            Informações Pessoais
          </Text>

          {isEditing ? (
            <View className="mt-2">
              <Input
                label="Nome"
                value={name}
                onChangeText={setName}
                placeholder="Seu nome completo"
              />
              <View className="flex-row gap-4 mt-2">
                <View className="flex-1">
                  <Button title="Cancelar" onPress={() => { setIsEditing(false); setName(user?.name || ''); }} variant="outline" />
                </View>
                <View className="flex-1">
                  <Button title="Salvar" onPress={handleSave} isLoading={isSaving} />
                </View>
              </View>
            </View>
          ) : (
            <View>
              <View className="flex-row items-center justify-between border-b border-[#EEF2F5] py-4">
                <Text className="text-sm font-medium text-[#98A2B3]">Nome</Text>
                <Text className="text-sm font-semibold text-[#344054]">{user?.name}</Text>
              </View>
              <View className="flex-row justify-between items-center border-b border-[#EEF2F5] py-4">
                <Text className="text-sm font-medium text-[#98A2B3]">E-mail</Text>
                <Text className="text-sm font-semibold text-[#344054]">{user?.email}</Text>
              </View>
              <View className="flex-row justify-between items-center py-4">
                <Text className="text-sm font-medium text-[#98A2B3]">Membro desde</Text>
                <Text className="text-sm font-semibold text-[#169670]">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '-'}
                </Text>
              </View>
              <View className="mt-6">
                <Button title="Editar Perfil" onPress={() => setIsEditing(true)} variant="secondary" />
              </View>
            </View>
          )}
        </Card>

        <Card className="mb-8 p-5">
          <Text className="mb-3 text-lg font-bold text-[#344054]">Sobre o App</Text>
          <Text className="text-sm leading-6 text-[#98A2B3]">
            <Text className="font-bold text-[#667085]">Fin-9 v1.0.0</Text>{'\n'}
            Domine suas finanças pessoais de forma simples, eficiente e elegante.
          </Text>
        </Card>

        <View className="pb-8">
          <Button title="Sair da Conta" onPress={handleLogout} variant="danger" />
        </View>

        <Card className="border border-[#FECACA] bg-[#FFF1F2] p-5">
          <Text className="mb-2 text-lg font-bold text-[#B42318]">Zona de perigo</Text>
          <Text className="mb-5 text-sm leading-6 text-[#B42318]">
            Exclua sua conta para remover permanentemente seu perfil e todas as informacoes financeiras relacionadas.
          </Text>
          <Button
            title="Deletar Conta"
            onPress={handleDeleteAccount}
            variant="danger"
            isLoading={isDeleting}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
