import {
  useGetSingleChatList,
  useMarkReadChat,
  type SingleChatListType,
} from "@/hooks/chat/use-chat-list";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/store/authStore";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function ChatMessage() {
  const userId = useAuthStore((state) => state.user?.id);
  const { chat_id } = useLocalSearchParams<{
    chat_id: string;
  }>();
  const { data: listData } = useGetSingleChatList({
    chat_id,
  });
  const { mutate: mutateMarkChat } = useMarkReadChat();

  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");

  const getChatName = (item: SingleChatListType | undefined) => {
    if (!item) return "User Message";
    if (item.chat_type !== "single") {
      return item.chat_name;
    }
    return item.members?.find((el) => el.id !== userId)?.name ?? "User Message";
  };

  useEffect(() => {
    if (!listData || !listData?.unread_count || listData.unread_count < 0) {
      return;
    }
    mutateMarkChat({
      chat_id: listData.chat_id,
    });
  }, [listData?.unread_count, listData?.chat_id]);

  return (
    <>
      <Stack.Screen
        options={{
          title: getChatName(listData),
          headerStyle: {
            backgroundColor,
          },
          headerTitleStyle: {
            color: textColor,
            fontSize: 18,
            fontWeight: "600",
          },
        }}
      />

      <View
        style={{
          flex: 1,
          backgroundColor,
          padding: 16,
        }}
      >
        <Text style={{ color: textColor }}>Chat ID: {chat_id}</Text>
      </View>
    </>
  );
}
