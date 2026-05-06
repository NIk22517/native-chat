import {
  useGetChatMessages,
  type ChatMessage,
} from "@/hooks/chat/use-chat-messages";
import React, { useCallback, useMemo, useRef } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import ChatMessageItem from "./chat-message-item";

interface ChatListProps {
  currentUserId: number | undefined;
  textColor: string;
  isGroupChat?: boolean;
  chat_id: string;
}

export default function ChatList({
  currentUserId,
  textColor,
  isGroupChat = false,
  chat_id,
}: ChatListProps) {
  const flatListRef = useRef<FlatList>(null);

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useGetChatMessages({
      chat_id,
    });

  const allMessages = useMemo(
    () => (data?.pages ?? []).flatMap((el) => el.data),
    [data],
  );

  const shouldShowSenderName = useCallback(
    (index: number, item: ChatMessage) => {
      if (!isGroupChat) return false;
      if (item.message_type === "system") return false;
      if (item.sender_id === currentUserId) return false;

      const prev = allMessages[index - 1];
      return !prev || prev.sender_id !== item.sender_id;
    },
    [allMessages, currentUserId, isGroupChat],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: ChatMessage; index: number }) => (
      <ChatMessageItem
        msg={item}
        currentUserId={currentUserId}
        showSenderName={shouldShowSenderName(index, item)}
      />
    ),
    [currentUserId, shouldShowSenderName],
  );

  const keyExtractor = useCallback(
    (item: ChatMessage) => item.id.toString(),
    [],
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const listEmptyComponent = useCallback(() => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyIcon]}>💬</Text>
        <Text style={[styles.emptyTitle, { color: textColor }]}>
          No messages yet
        </Text>
        <Text style={styles.emptySubtitle}>
          Say hello and start the conversation
        </Text>
      </View>
    );
  }, []);

  return (
    <FlatList
      style={{ flex: 1 }}
      ref={flatListRef}
      data={allMessages}
      contentContainerStyle={styles.contentContainer}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      inverted={allMessages.length > 0}
      ListEmptyComponent={listEmptyComponent}
      removeClippedSubviews={true}
      windowSize={10}
      maxToRenderPerBatch={15}
      initialNumToRender={20}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? (
          <Text style={{ color: textColor, textAlign: "center", padding: 10 }}>
            Loading....
          </Text>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  emptySubtitle: {
    fontSize: 13.5,
    color: "rgba(255,255,255,0.4)",
  },
});
