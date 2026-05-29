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
import { useSearchMessages } from "@/hooks/chat/use-search-chat-messages";
import { useDebounce } from "@/hooks/use-debounce";
import { useDismissChatNotifications } from "@/hooks/use-push-notifications";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/useChatStore";
import { useHeaderHeight } from "@react-navigation/elements";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChatMessage() {
  const userId = useAuthStore((state) => state.user?.id);
  const { chat_id } = useLocalSearchParams<{
    chat_id: string;
  }>();
  const [openSearch, setOpenSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const { data: listData } = useGetSingleChatList({
    chat_id,
  });

  const { mutate: mutateMarkChat } = useMarkReadChat();

  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const secondaryBg = useThemeColor({}, "surface");
  const mutedColor = useThemeColor({}, "textMuted");
  const borderColor = useThemeColor({}, "border");

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
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height + 10);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!listData || !listData.unread_count || listData.unread_count < 0) {
      return;
    }

    mutateMarkChat({
      chat_id: listData.chat_id,
    });
  }, [listData?.unread_count, listData?.chat_id]);

  const selected = useChatStore((s) => s.selected);
  const clearSelection = useChatStore((s) => s.clearSelection);
  const isSelected = selected.size > 0;

  const debounceSearchText = useDebounce(searchText);

  const { data: searchData, isLoading: isSearching } = useSearchMessages({
    chat_id,
    search_text: debounceSearchText,
  });

  const searchResultIds =
    searchData?.pages?.flatMap((el) => el.data).map((el) => el.id) ?? [];

  const totalResults = searchResultIds.length;
  const activeMessageId =
    openSearch && totalResults
      ? (searchResultIds[currentResultIndex] ?? null)
      : null;

  const handlePrev = () => {
    setCurrentResultIndex((i) => Math.max(0, i - 1));
  };

  const handleNext = () => {
    setCurrentResultIndex((i) => Math.min(totalResults - 1, i + 1));
  };

  const KeyboardView = Platform.OS === "ios" ? KeyboardAvoidingView : View;

  const keyboardViewProps =
    Platform.OS === "ios"
      ? {
          behavior: "padding" as const,
          keyboardVerticalOffset: headerHeight,
          style: { flex: 1 },
        }
      : {
          style: { flex: 1, marginBottom: keyboardHeight },
        };

  useChatMsgSocket({
    chat_id,
    message_id: activeMessageId,
  });

  useDismissChatNotifications(Number(chat_id));

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: !openSearch,
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
            ? () => (
                <Pressable
                  onPress={clearSelection}
                  hitSlop={12}
                  style={{ marginLeft: 4, marginRight: 10 }}
                >
                  <IconSymbol name="xmark" color={textColor} size={20} />
                </Pressable>
              )
            : undefined,
          headerRight: isSelected
            ? () => (
                <View style={{ flexDirection: "row", gap: 20 }}>
                  <DeleteMessage />
                  {selected.size === 1 && (
                    <Pressable
                      hitSlop={12}
                      onPress={() => {
                        const message_id = Array.from(selected.keys())[0];
                        if (!message_id) return;
                        router.push({
                          pathname: "/chat/msg-status/[chat_id]/[message_id]",
                          params: {
                            chat_id,
                            message_id,
                          },
                        });
                      }}
                    >
                      <IconSymbol
                        name="info.circle"
                        color={textColor}
                        size={20}
                      />
                    </Pressable>
                  )}
                </View>
              )
            : !openSearch
              ? () => (
                  <Pressable hitSlop={12} onPress={() => setOpenSearch(true)}>
                    <IconSymbol
                      name="magnifyingglass"
                      color={textColor}
                      size={20}
                    />
                  </Pressable>
                )
              : undefined,
        }}
      />

      <KeyboardView {...keyboardViewProps}>
        <View
          style={{
            flex: 1,
            backgroundColor,
          }}
        >
          {openSearch && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 12,
                paddingVertical: 8,
                paddingTop: insets.top + 8,
                gap: 8,
                backgroundColor,
                borderBottomWidth: 0.5,
                borderBottomColor: borderColor,
              }}
            >
              <Pressable
                hitSlop={12}
                onPress={() => {
                  setOpenSearch(false);
                  setSearchText("");
                }}
              >
                <IconSymbol name="xmark" size={18} color={mutedColor} />
              </Pressable>

              <TextInput
                autoFocus
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Search messages..."
                placeholderTextColor={mutedColor}
                style={{
                  flex: 1,
                  backgroundColor: secondaryBg,
                  borderRadius: 10,
                  paddingVertical: 7,
                  paddingHorizontal: 12,
                  fontSize: 15,
                  color: textColor,
                }}
                returnKeyType="search"
              />

              {isSearching && debounceSearchText.length >= 2 ? (
                <ActivityIndicator size="small" />
              ) : debounceSearchText.length >= 2 ? (
                <Text
                  style={{
                    fontSize: 12,
                    color: mutedColor,
                    minWidth: 50,
                    textAlign: "center",
                  }}
                >
                  {totalResults === 0
                    ? "No results"
                    : `${currentResultIndex + 1} of ${totalResults}`}
                </Text>
              ) : null}

              <Pressable
                hitSlop={12}
                onPress={handlePrev}
                disabled={totalResults === 0 || currentResultIndex === 0}
                style={{
                  opacity:
                    totalResults === 0 || currentResultIndex === 0 ? 0.3 : 1,
                }}
              >
                <IconSymbol name="chevron.up" size={20} color={textColor} />
              </Pressable>

              <Pressable
                hitSlop={12}
                onPress={handleNext}
                disabled={
                  totalResults === 0 || currentResultIndex === totalResults - 1
                }
                style={{
                  opacity:
                    totalResults === 0 ||
                    currentResultIndex === totalResults - 1
                      ? 0.3
                      : 1,
                }}
              >
                <IconSymbol name="chevron.down" size={20} color={textColor} />
              </Pressable>
            </View>
          )}

          <ChatList
            chat_id={chat_id}
            currentUserId={userId}
            textColor={textColor}
            isGroupChat={listData?.chat_type !== "single"}
            searchMessageId={activeMessageId}
          />

          <View
            style={{
              paddingHorizontal: 5,
              paddingTop: 4,
              paddingBottom:
                keyboardHeight > 0 ? 6 : Math.max(insets.bottom, 8),
              backgroundColor,
            }}
          >
            <ChatInput chat_id={chat_id} />
          </View>
        </View>
      </KeyboardView>
    </>
  );
}
