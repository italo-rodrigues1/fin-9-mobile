import React, { useState } from "react";
import { ScrollView, Switch, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import { Input } from "../../src/components/ui/Input";
import { useAuthStore } from "../../src/stores/authStore";
import { useTheme } from "../../src/theme/useTheme";

export default function ProfileScreen() {
  const { user, logout, updateProfile, deleteAccount } = useAuthStore();
  const { colors, isDark, toggleTheme } = useTheme();
  const [name, setName] = useState(user?.name || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return Toast.show({
      type: "error",
      text1: "Atenção",
      text2: "Informe seu nome",
    });
    setIsSaving(true);
    try {
      await updateProfile(name.trim());
      setIsEditing(false);
      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: "Perfil atualizado!",
      });
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: err.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    Toast.show({
      type: "confirm",
      text1: "Sair",
      text2: "Tem certeza que deseja sair?",
      position: "bottom",
      autoHide: false,
      props: {
        confirmText: "Sair",
        onConfirm: logout,
      },
    });
  };

  const handleDeleteAccount = () => {
    Toast.show({
      type: "confirm",
      text1: "Excluir conta",
      text2: "Essa ação irá apagar permanentemente seu perfil e todos os dados vinculados. Deseja continuar?",
      position: "bottom",
      autoHide: false,
      props: {
        confirmText: "Continuar",
        onConfirm: () => {
          Toast.show({
            type: "confirm",
            text1: "Confirmação final",
            text2: "Essa exclusão não pode ser desfeita. Confirma a exclusão total da conta?",
            position: "bottom",
            autoHide: false,
            props: {
              confirmText: "Excluir definitivamente",
              onConfirm: async () => {
                setIsDeleting(true);
                try {
                  await deleteAccount();
                  Toast.show({
                    type: "success",
                    text1: "Conta excluída",
                    text2: "Sua conta e todos os dados relacionados foram removidos.",
                  });
                } catch (err: any) {
                  Toast.show({
                    type: "error",
                    text1: "Erro",
                    text2: err.message,
                  });
                } finally {
                  setIsDeleting(false);
                }
              },
            },
          });
        },
      },
    });
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center pt-10 pb-8">
          <View
            className="mb-5 h-24 w-24 items-center justify-center rounded-full border-2"
            style={{
              backgroundColor: colors.avatar,
              borderColor: colors.borderStrong,
            }}
          >
            <Text className="text-3xl font-semibold" style={{ color: colors.avatarText }}>
              {(user?.name || "EA").slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <Text className="text-2xl font-bold tracking-tight" style={{ color: colors.text }}>
            {user?.name}
          </Text>
          <Text className="mt-1 text-sm font-medium" style={{ color: colors.textMuted }}>
            {user?.email}
          </Text>
        </View>

        <Card className="mb-6 p-5">
          <Text className="mb-5 text-xl font-bold" style={{ color: colors.text }}>
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
              <View className="mt-2 flex-row gap-4">
                <View className="flex-1">
                  <Button
                    title="Cancelar"
                    onPress={() => {
                      setIsEditing(false);
                      setName(user?.name || "");
                    }}
                    variant="outline"
                  />
                </View>
                <View className="flex-1">
                  <Button title="Salvar" onPress={handleSave} isLoading={isSaving} />
                </View>
              </View>
            </View>
          ) : (
            <View>
              <View
                className="flex-row items-center justify-between border-b py-4"
                style={{ borderColor: colors.border }}
              >
                <Text className="text-sm font-medium" style={{ color: colors.textMuted }}>
                  Nome
                </Text>
                <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                  {user?.name}
                </Text>
              </View>
              <View
                className="flex-row items-center justify-between border-b py-4"
                style={{ borderColor: colors.border }}
              >
                <Text className="text-sm font-medium" style={{ color: colors.textMuted }}>
                  E-mail
                </Text>
                <Text className="text-sm font-semibold" style={{ color: colors.text }}>
                  {user?.email}
                </Text>
              </View>
              <View className="flex-row items-center justify-between py-4">
                <Text className="text-sm font-medium" style={{ color: colors.textMuted }}>
                  Membro desde
                </Text>
                <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("pt-BR")
                    : "-"}
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
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-lg font-bold" style={{ color: colors.text }}>
                Aparência
              </Text>
              <Text
                className="mt-2 text-sm leading-6"
                style={{ color: colors.textSecondary }}
              >
                Ative o dark mode para reduzir o brilho e manter o app no seu
                estilo preferido.
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={() => {
                void toggleTheme();
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </Card>

        <Card className="mb-8 p-5">
          <Text className="mb-3 text-lg font-bold" style={{ color: colors.text }}>
            Sobre o App
          </Text>
          <Text className="text-sm leading-6" style={{ color: colors.textMuted }}>
            <Text className="font-bold" style={{ color: colors.textSecondary }}>
              Fin-9 v1.0.0
            </Text>
            {"\n"}
            Domine suas finanças pessoais de forma simples, eficiente e elegante.
          </Text>
        </Card>

        <View className="mb-6">
          <Button
            title="Sair da Conta"
            onPress={handleLogout}
            variant="secondary"
            icon="log-out-outline"
          />
        </View>

        <Card
          className="p-5"
          style={{
            borderColor: `${colors.danger}55`,
            backgroundColor: `${colors.danger}12`,
          }}
        >
          <Text className="mb-2 text-lg font-bold" style={{ color: colors.danger }}>
            Zona de perigo
          </Text>
          <Text className="mb-5 text-sm leading-6" style={{ color: colors.danger }}>
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
