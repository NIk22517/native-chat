import { MessageAttachments } from "@/components/chat/message-attachments";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  MessageStatus,
  useGetMessageStatus,
} from "@/hooks/chat/use-message-status";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useChatStore } from "@/store/useChatStore";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { SymbolViewProps } from "expo-symbols";
import { Pressable, ScrollView, Text, View } from "react-native";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(dateStr).toLocaleDateString();
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const AVATAR_COLORS = [
  { bg: "#E6F1FB", text: "#0C447C" },
  { bg: "#E1F5EE", text: "#085041" },
  { bg: "#EEEDFE", text: "#3C3489" },
  { bg: "#FAEEDA", text: "#633806" },
  { bg: "#FAECE7", text: "#712B13" },
];

function getAvatarColor(name: string) {
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export default function MessageInfo() {
  const { chat_id, message_id } = useLocalSearchParams<{
    chat_id: string;
    message_id: string;
  }>();

  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "border");
  const mutedColor = useThemeColor({}, "tint");

  const clearSelection = useChatStore((s) => s.clearSelection);
  const selected = useChatStore((s) => s.selected);
  const message = selected.get(Number(message_id));

  const { data } = useGetMessageStatus({ chat_id, message_id });

  const readMessages = data?.filter((item) => item.status === "read") ?? [];
  const deliveredMessages =
    data?.filter((item) => item.status !== "read") ?? [];

  return (
    <>
      <Stack.Screen
        options={{
          title: "Message info",
          headerStyle: { backgroundColor },
          headerTitleStyle: {
            color: textColor,
            fontSize: 17,
            fontWeight: "600",
          },
          headerLeft: ({ canGoBack }) => {
            if (!canGoBack) return null;
            return (
              <Pressable
                hitSlop={10}
                onPress={() => {
                  clearSelection();
                  router.back();
                }}
                style={{ marginLeft: 4, marginRight: 10 }}
              >
                <IconSymbol name="backward" color={textColor} size={20} />
              </Pressable>
            );
          },
        }}
      />

      <ScrollView style={{ flex: 1, backgroundColor }}>
        {message && (
          <View
            style={{
              padding: 16,
              borderBottomWidth: 0.5,
              borderBottomColor: borderColor,
            }}
          >
            <View
              style={{
                backgroundColor,
                borderRadius: 12,
                borderTopRightRadius: 2,
                borderWidth: 0.5,
                borderColor,
                padding: 10,
                alignSelf: "flex-end",
              }}
            >
              {message.attachments && message.attachments.length > 0 && (
                <View style={{ marginBottom: 6 }}>
                  <MessageAttachments attachments={message.attachments} />
                </View>
              )}
              {!!message.message && (
                <Text
                  style={{ color: textColor, fontSize: 15, lineHeight: 22 }}
                >
                  {message.message}
                </Text>
              )}
            </View>
          </View>
        )}

        {readMessages.length > 0 && (
          <StatusSection
            title="Read"
            items={readMessages}
            textColor={textColor}
            mutedColor={mutedColor}
            borderColor={borderColor}
            iconColor="#53BDEB"
            iconName="checkmark.message.fill"
            isRead
          />
        )}

        {deliveredMessages.length > 0 && (
          <StatusSection
            title="Delivered"
            items={deliveredMessages}
            textColor={textColor}
            mutedColor={mutedColor}
            borderColor={borderColor}
            iconColor="#9CA3AF"
            iconName="checkmark.circle.fill"
            isRead={false}
          />
        )}
      </ScrollView>
    </>
  );
}

function StatusSection({
  title,
  items,
  textColor,
  mutedColor,
  borderColor,
  iconColor,
  iconName,
  isRead,
}: {
  title: string;
  items: MessageStatus[];
  textColor: string;
  mutedColor: string;
  borderColor: string;
  iconColor: string;
  iconName: SymbolViewProps["name"];
  isRead: boolean;
}) {
  return (
    <View>
      <Text
        style={{
          fontSize: 12,
          fontWeight: "500",
          color: mutedColor,
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 8,
          textTransform: "uppercase",
          letterSpacing: 0.6,
        }}
      >
        {title}
      </Text>

      {items.map((item, index) => {
        const avatarColor = getAvatarColor(item.user_name);
        const isLast = index === items.length - 1;

        return (
          <View
            key={item.user_id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderBottomWidth: isLast ? 0 : 0.5,
              borderBottomColor: borderColor,
              gap: 12,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: avatarColor.bg,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: avatarColor.text,
                }}
              >
                {getInitials(item.user_name)}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text
                numberOfLines={1}
                style={{ fontSize: 15, fontWeight: "500", color: textColor }}
              >
                {item.user_name}
              </Text>
              {!!item.read_at && (
                <Text style={{ fontSize: 12, color: mutedColor, marginTop: 2 }}>
                  {timeAgo(item.read_at)}
                </Text>
              )}
            </View>

            <IconSymbol name={iconName} size={18} color={iconColor} />
          </View>
        );
      })}
    </View>
  );
}
