import { ChatInput } from "@/components/chat/chat-footer-input";
import ChatList from "@/components/chat/chat-list";
import {
  useGetSingleChatList,
  useMarkReadChat,
  type SingleChatListType,
} from "@/hooks/chat/use-chat-list";
import { useGetChatMessages } from "@/hooks/chat/use-chat-messages";
import { useChatMsgSocket } from "@/hooks/chat/use-chat-msg-socket";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/store/authStore";
import { useHeaderHeight } from "@react-navigation/elements";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChatMessage() {
  const userId = useAuthStore((state) => state.user?.id);
  const { chat_id } = useLocalSearchParams<{
    chat_id: string;
  }>();

  const { data } = useGetChatMessages({
    chat_id,
  });

  const { data: listData } = useGetSingleChatList({
    chat_id,
  });

  const { mutate: mutateMarkChat } = useMarkReadChat();

  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");

  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const getChatName = (item: SingleChatListType | undefined) => {
    if (!item) return "User Message";

    if (item.chat_type !== "single") {
      return item.chat_name;
    }

    return item.members?.find((el) => el.id !== userId)?.name ?? "User Message";
  };

  useEffect(() => {
    if (!listData || !listData.unread_count || listData.unread_count < 0) {
      return;
    }

    mutateMarkChat({
      chat_id: listData.chat_id,
    });
  }, [listData?.unread_count, listData?.chat_id]);

  useChatMsgSocket({
    chat_id,
  });

  const allMessages = (data?.pages ?? []).flatMap((el) => el.data);

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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}
      >
        <View
          style={{
            flex: 1,
            backgroundColor,
          }}
        >
          <ChatList
            allMessages={allMessages}
            currentUserId={userId}
            textColor={textColor}
            isGroupChat={listData?.chat_type !== "single"}
          />

          <View
            style={{
              paddingHorizontal: 5,
              paddingTop: 4,
              paddingBottom: Math.max(insets.bottom, 8),
              backgroundColor,
            }}
          >
            <ChatInput chat_id={chat_id} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
