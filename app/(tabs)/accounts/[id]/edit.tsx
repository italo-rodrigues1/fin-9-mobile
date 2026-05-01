import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { FormScreen } from "../../../../src/components/layout/FormScreen";
import { Button } from "../../../../src/components/ui/Button";
import { Card } from "../../../../src/components/ui/Card";
import { Input } from "../../../../src/components/ui/Input";
import { ACCOUNT_COLORS, ACCOUNT_ICON_OPTIONS } from "../../../../src/constants";
import { useAccountStore } from "../../../../src/stores/accountStore";
import { useTheme } from "../../../../src/theme/useTheme";

export default function EditAccountScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors } = useTheme();
    const { accounts, update } = useAccountStore();

    const account = accounts.find((a) => a.id === id);

    const [name, setName] = useState(account?.name ?? "");
    const [institution, setInstitution] = useState(account?.institution ?? "");
    const [balance, setBalance] = useState(account ? String(account.balance) : "");
    const [selectedColor, setSelectedColor] = useState(account?.color ?? ACCOUNT_COLORS[0]);
    const [selectedIcon, setSelectedIcon] = useState(account?.icon ?? ACCOUNT_ICON_OPTIONS[0]);
    const [nameError, setNameError] = useState("");
    const [balanceError, setBalanceError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (account) {
            setName(account.name);
            setInstitution(account.institution);
            setBalance(String(account.balance));
            setSelectedColor(account.color);
            setSelectedIcon(account.icon);
        }
    }, [account]);

    if (!account) {
        return (
            <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: colors.background }}>
                <Text className="text-base" style={{ color: colors.textMuted }}>
                    Conta não encontrada.
                </Text>
            </View>
        );
    }

    const validate = (): boolean => {
        let valid = true;
        setNameError("");
        setBalanceError("");

        if (!name.trim()) {
            setNameError("Informe o nome da conta");
            valid = false;
        }
        const numBalance = Number(balance.replace(",", "."));
        if (balance === "" || isNaN(numBalance) || numBalance < 0) {
            setBalanceError("Informe um saldo válido (não negativo)");
            valid = false;
        }
        return valid;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await update(id, {
                name: name.trim(),
                institution: institution.trim(),
                balance: Number(balance.replace(",", ".")),
                color: selectedColor,
                icon: selectedIcon,
            });
            Toast.show({ type: "success", text1: "Conta atualizada com sucesso" });
            router.back();
        } catch (err: any) {
            Toast.show({
                type: "error",
                text1: "Erro",
                text2: err.response?.data?.message || "Não foi possível atualizar a conta",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <FormScreen>
            <View className="mb-6">
                <Text className="text-2xl font-bold" style={{ color: colors.text }}>
                    Editar conta
                </Text>
                <Text className="mt-1 text-sm" style={{ color: colors.textMuted }}>
                    Atualize os dados da sua conta.
                </Text>
            </View>

            <Card className="p-5">
                <Input
                    label="Nome da conta"
                    value={name}
                    onChangeText={(v) => { setName(v); setNameError(""); }}
                    placeholder="Ex: Reserva Nubank"
                    error={nameError}
                />
                <Input
                    label="Instituição"
                    value={institution}
                    onChangeText={setInstitution}
                    placeholder="Ex: Nubank, XP Investimentos"
                />
                <Input
                    label="Saldo atual (R$)"
                    value={balance}
                    onChangeText={(v) => { setBalance(v); setBalanceError(""); }}
                    placeholder="0,00"
                    keyboardType="decimal-pad"
                    error={balanceError}
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
                            <MaterialCommunityIcons name={icon as never} size={22} color={colors.text} />
                        </TouchableOpacity>
                    ))}
                </View>
            </Card>

            <View className="mt-6">
                <Button title="Salvar Alterações" onPress={handleSubmit} isLoading={isSubmitting} />
            </View>
        </FormScreen>
    );
}
