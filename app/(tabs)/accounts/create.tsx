import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FormScreen } from "../../../src/components/layout/FormScreen";
import { Button } from "../../../src/components/ui/Button";
import { Card } from "../../../src/components/ui/Card";
import { Input } from "../../../src/components/ui/Input";
import { ACCOUNT_COLORS, ACCOUNT_ICON_OPTIONS } from "../../../src/constants";
import { accountService } from "../../../src/services/accountService";
import { useTheme } from "../../../src/theme/useTheme";

export default function CreateAccountScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [balance, setBalance] = useState("");
  const [selectedColor, setSelectedColor] = useState(ACCOUNT_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(ACCOUNT_ICON_OPTIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { colors } = useTheme();

  const handleSubmit = async () => {
    if (!name.trim()) {
      return Toast.show({
        type: "error",
        text1: "Atenção",
        text2: "Informe o nome da conta",
      });
    }
    if (!institution.trim()) {
      return Toast.show({
        type: "error",
        text1: "Atenção",
        text2: "Informe a instituição",
      });
    }
    if (!balance || Number(balance.replace(',', '.')) < 0) {
      return Toast.show({
        type: "error",
        text1: "Atenção",
        text2: "Informe um saldo válido",
      });
    }

    setIsSubmitting(true);
    try {
      await accountService.create({
        name: name.trim(),
        institution: institution.trim(),
        balance: Number(balance.replace(',', '.')),
        color: selectedColor,
        icon: selectedIcon,
      });
      router.replace("/(tabs)");
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: err.response?.data?.message || "Não foi possível cadastrar a conta",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormScreen>
      <View className="mb-6">
        <Text className="text-2xl font-bold" style={{ color: colors.text }}>
          Cadastrar conta
        </Text>
        <Text className="mt-1 text-sm" style={{ color: colors.textMuted }}>
          Adicione bancos, corretoras e outras contas para acompanhar seus saldos.
        </Text>
      </View>

      <Card className="p-5">
        <Input label="Nome da conta" value={name} onChangeText={setName} placeholder="Ex: Reserva Nubank" />
        <Input
          label="Instituição"
          value={institution}
          onChangeText={setInstitution}
          placeholder="Ex: Nubank, XP Investimentos"
        />
        <Input
          label="Saldo atual (R$)"
          value={balance}
          onChangeText={setBalance}
          placeholder="0,00"
          keyboardType="decimal-pad"
        />

        <Text className="mb-3 ml-1 mt-2 text-sm font-medium" style={{ color: colors.textSecondary }}>
          Cor do cartão
        </Text>
        <View className="mb-6 flex-row flex-wrap gap-3">
          {ACCOUNT_COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              onPress={() => setSelectedColor(color)}
              className="h-11 w-11 rounded-full"
              style={{
                backgroundColor: color,
                borderWidth: selectedColor === color ? 3 : 0,
                borderColor: colors.surface,
              }}
            />
          ))}
        </View>

        <Text className="mb-3 ml-1 text-sm font-medium" style={{ color: colors.textSecondary }}>
          Ícone
        </Text>
        <View className="mb-2 flex-row flex-wrap gap-3">
          {ACCOUNT_ICON_OPTIONS.map((icon) => (
            <TouchableOpacity
              key={icon}
              onPress={() => setSelectedIcon(icon)}
              className="h-12 w-12 items-center justify-center rounded-2xl border"
              style={{
                borderColor: selectedIcon === icon ? colors.text : colors.border,
                backgroundColor:
                  selectedIcon === icon ? colors.backgroundMuted : colors.surfaceSecondary,
              }}
            >
              <MaterialCommunityIcons
                name={icon as never}
                size={22}
                color={colors.text}
              />
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <View className="mt-6">
        <Button title="Salvar Conta" onPress={handleSubmit} isLoading={isSubmitting} />
      </View>
    </FormScreen>
  );
}
