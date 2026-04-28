import { useThemeColor } from "@/hooks/use-theme-color";
import { Stack } from "expo-router";

export default function ChatLayout() {
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          title: "Chats",
          headerStyle: {
            backgroundColor: backgroundColor,
          },
          headerTitleStyle: {
            color: textColor,
            fontSize: 24,
            fontWeight: "700",
          },
          headerTitleAlign: "left",
          headerShadowVisible: true,
        }}
      />

      <Stack.Screen
        name="[chat_id]"
        options={{
          headerShown: true,
        }}
      />
    </Stack>
  );
}
