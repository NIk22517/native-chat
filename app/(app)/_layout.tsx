import { useAuthStore } from "@/store/authStore";
import { useSocketStore } from "@/store/socketStore";
import { Stack } from "expo-router";
import { useEffect } from "react";

export default function AppLayout() {
  const token = useAuthStore((state) => state.user?.token);
  const socketConnect = useSocketStore((state) => state.connect);
  const socketDisconnect = useSocketStore((state) => state.disconnect);
  useEffect(() => {
    if (!token) return;
    socketConnect(token);
    return () => {
      socketDisconnect();
    };
  }, [token]);
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="chat" />
    </Stack>
  );
}
