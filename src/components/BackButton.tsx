import { Feather } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

interface BackButtonProps {
  color?: string;
  backgroundColor?: string;
  fallbackHref?: Href;
}

export function BackButton({
  color = "#344054",
  backgroundColor = "#FFFFFF",
  fallbackHref = "/(tabs)",
}: BackButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(fallbackHref);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel="Voltar"
      hitSlop={8}
      className="h-11 w-11 items-center justify-center rounded-full"
      style={{ backgroundColor }}
    >
      <Feather name="arrow-left" size={22} color={color} />
    </TouchableOpacity>
  );
}
