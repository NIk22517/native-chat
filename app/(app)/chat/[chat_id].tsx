import { ChatInput } from "@/components/chat/chat-footer-input";
import ChatList from "@/components/chat/chat-list";
import { DeleteMessage } from "@/components/chat/message-delete-modal";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  useGetSingleChatList,
  useMarkReadChat,
  type SingleChatListType,
} from "@/hooks/chat/use-chat-list";
import { useChatMsgSocket } from "@/hooks/chat/use-chat-msg-socket";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/useChatStore";
import { useHeaderHeight } from "@react-navigation/elements";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { KeyboardAvoidingView, Platform, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

  const selected = useChatStore((s) => s.selected);
  const clearSelection = useChatStore((s) => s.clearSelection);
  const isSelected = selected.size > 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: isSelected ? `${selected.size}` : getChatName(listData),
          headerStyle: {
            backgroundColor,
          },
          headerTitleStyle: {
            color: textColor,
            fontSize: 18,
            fontWeight: "600",
          },
          headerLeft: isSelected
            ? () => {
                return (
                  <Pressable
                    onPress={clearSelection}
                    hitSlop={12}
                    style={{ marginLeft: 4, marginRight: 10 }}
                  >
                    <IconSymbol name="xmark" color={textColor} size={20} />
                  </Pressable>
                );
              }
            : undefined,
          headerRight: isSelected
            ? () => {
                return (
                  <View>
                    <DeleteMessage />
                  </View>
                );
              }
            : undefined,
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
            chat_id={chat_id}
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
