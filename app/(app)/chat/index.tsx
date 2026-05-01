import {
  useGetChatList,
  useMarkReadChat,
  type ChatItem,
} from "@/hooks/chat/use-chat-list";
import { useChatListSocket } from "@/hooks/chat/use-chat-list-socket";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

export default function ChatScreen() {
  const { data } = useGetChatList();
  const { mutate: mutateMarkChat } = useMarkReadChat();

  const router = useRouter();

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const chatList = (data?.pages ?? []).flatMap((el) => el);

  const formatTime = (date?: string) => {
    if (!date) return "";

    const newDate = new Date(date);

    return newDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLastMessage = (item: ChatItem) => {
    if (!item.last_message) return "No messages yet";

    if (item.last_message?.attachments?.length > 0) {
      const attachment = item.last_message.attachments[0];

      if (attachment.resource_type === "image") {
        return "📷 Photo";
      }

      return "📎 Attachment";
    }

    return item.last_message.message || "No messages yet";
  };

  const getChatName = (item: ChatItem) => {
    if (item.chat_type !== "single") {
      return item.chat_name;
    }

    return item.members?.[0]?.name || "Unknown User";
  };

  const getAvatar = (item: any) => {
    if (item.chat_type !== "single") {
      return item.chat_image || null;
    }

    return item.members?.[0]?.profile_image || null;
  };
  useChatListSocket();
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
        },
      ]}
    >
      <FlatList
        data={chatList}
        keyExtractor={(item) => item.chat_id?.toString()}
        contentContainerStyle={{
          flexGrow: 1,
        }}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text
              style={{
                color: borderColor,
                fontSize: 22,
                fontWeight: "600",
              }}
            >
              No Chat Found
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const avatar = getAvatar(item);

          return (
            <Pressable
              style={({ pressed }) => [
                styles.chatCard,
                {
                  borderBottomWidth: 1,
                  borderBottomColor: borderColor,
                  backgroundColor: pressed ? "#e5e7eb" : backgroundColor,
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
              android_ripple={{ color: "rgba(0,0,0,0.08)" }}
              onPress={() => {
                if (item?.unread_count > 0) {
                  mutateMarkChat({
                    chat_id: item.chat_id,
                  });
                }
                router.push({
                  pathname: "/(app)/chat/[chat_id]",
                  params: { chat_id: item.chat_id },
                });
              }}
            >
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {getChatName(item)
                      ?.split(" ")
                      .map((el) => el[0])
                      .join("")
                      ?.slice(0, 2)
                      ?.toUpperCase()}
                  </Text>
                </View>
              )}

              <View style={styles.contentContainer}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.name,
                    {
                      color: textColor,
                    },
                  ]}
                >
                  {getChatName(item)}
                </Text>

                <Text
                  numberOfLines={1}
                  style={[
                    styles.message,
                    {
                      color: borderColor,
                    },
                  ]}
                >
                  {getLastMessage(item)}
                </Text>
              </View>

              <View style={styles.rightContainer}>
                <Text
                  style={[
                    styles.time,
                    {
                      color: borderColor,
                    },
                  ]}
                >
                  {formatTime(item?.last_message?.created_at)}
                </Text>

                {item.unread_count > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unread_count}</Text>
                  </View>
                )}
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 5,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 100,
  },

  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#D1D5DB",
  },

  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },

  contentContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
  },

  message: {
    marginTop: 4,
    fontSize: 14,
  },

  rightContainer: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    minHeight: 50,
  },

  time: {
    fontSize: 12,
  },

  unreadBadge: {
    marginTop: 8,
    minWidth: 22,
    height: 22,
    borderRadius: 20,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },

  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});
