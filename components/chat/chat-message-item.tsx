import { ChatMessage } from "@/hooks/chat/use-chat-messages";
import { useChatStore } from "@/store/useChatStore";
import React, { memo } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { MessageAttachments } from "./message-attachments";
import { MessageReplyPreview } from "./message-reply-preview";
import { SwipeableMessage } from "./swipeable-message";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BUBBLE_MAX_WIDTH = SCREEN_WIDTH * 0.72;

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function systemEventText(msg: ChatMessage): string {
  const { system_data } = msg;
  if (!system_data) return "";
  const actor = system_data.actor.name;
  const targets = system_data.targets?.map((t) => t.name).join(", ") ?? "";

  switch (system_data.event) {
    case "group_created":
      return `${actor} created the group`;
    case "users_added":
      return `${actor} added ${targets}`;
    case "user_removed":
      return `${actor} removed ${targets}`;
    case "user_left":
      return `${actor} left the group`;
    case "group_name_changed":
      return `${actor} changed the group name`;
    case "group_avatar_changed":
      return `${actor} changed the group photo`;
    case "message_pinned":
      return `${actor} pinned a message`;
    default:
      return "";
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const ReadTick = ({ status }: { status: "read" | "unread" }) => (
  <Text style={[styles.tick, status === "read" && styles.tickRead]}>
    {status === "read" ? "✓✓" : "✓"}
  </Text>
);

// ─── System Event ────────────────────────────────────────────────────────────

const SystemEventBubble = ({ msg }: { msg: ChatMessage }) => (
  <View style={styles.systemEventRow}>
    <View style={styles.systemEventPill}>
      <Text style={styles.systemEventText}>{systemEventText(msg)}</Text>
    </View>
  </View>
);

// ─── Main Message Item ────────────────────────────────────────────────────────

interface ChatMessageItemProps {
  msg: ChatMessage;
  currentUserId: number | undefined;
  showSenderName?: boolean; // pass true in group chats when different sender
}

const ChatMessageItem = ({
  msg,
  currentUserId,
  showSenderName = false,
}: ChatMessageItemProps) => {
  if (msg.message_type === "system") {
    return <SystemEventBubble msg={msg} />;
  }

  const setReply = useChatStore((s) => s.setReply);
  const toggleSelect = useChatStore((s) => s.toggleSelected);
  const selectedMessage = useChatStore((s) => s.selected);

  const isMine = msg.sender_id === currentUserId;
  const isDeleted = !!msg.delete_action;
  const hasAttachments = msg.attachments && msg.attachments.length > 0;
  const hasText = !!msg.message;
  const hasReply = !!msg.reply_data;

  if (isDeleted) {
    return (
      <View
        style={[
          styles.messageRow,
          isMine ? styles.messageRowMine : styles.messageRowOther,
          styles.bubble,
          isMine ? styles.bubbleMine : styles.bubbleOther,
          !hasText && !hasReply && hasAttachments && styles.bubbleMedia,
          {
            backgroundColor: "#f3eeee51",
            ...(isMine ? { marginRight: 8 } : { marginLeft: 8 }),
            marginTop: 4,
          },
        ]}
      >
        <Text style={styles.deletedText}>{msg.delete_text}</Text>
      </View>
    );
  }

  return (
    <SwipeableMessage
      isSelected={selectedMessage.has(msg.id)}
      isMine={isMine}
      onReply={() => {
        setReply(msg);
      }}
      onLongPress={() => {
        toggleSelect(msg);
      }}
    >
      <View
        style={[
          styles.messageRow,
          isMine ? styles.messageRowMine : styles.messageRowOther,
        ]}
      >
        {!isMine && showSenderName && (
          <Text style={styles.senderName}>{msg.sender_name}</Text>
        )}

        <View
          style={[
            styles.bubble,
            isMine ? styles.bubbleMine : styles.bubbleOther,
            !hasText && !hasReply && hasAttachments && styles.bubbleMedia,
          ]}
        >
          {hasReply && (
            <MessageReplyPreview reply={msg.reply_data!} isMine={isMine} />
          )}

          {/* Attachments */}
          {hasAttachments && (
            <MessageAttachments attachments={msg.attachments!} />
          )}

          {hasText && (
            <Text
              style={[
                styles.messageText,
                isMine ? styles.messageTextMine : styles.messageTextOther,
              ]}
            >
              {msg.message}
            </Text>
          )}

          <View
            style={[
              styles.footer,
              isMine ? styles.footerMine : styles.footerOther,
            ]}
          >
            <Text style={styles.timeText}>{formatTime(msg.created_at)}</Text>
            {isMine && <ReadTick status={msg.read_status} />}
          </View>
        </View>
      </View>
    </SwipeableMessage>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const MINE_BG = "#0A7CFF";
const OTHER_BG = "#2A2A2E";
const SYSTEM_BG = "rgba(255,255,255,0.08)";
const TEXT_MUTED = "rgba(255,255,255,0.45)";

const styles = StyleSheet.create({
  // ── Rows ──
  messageRow: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    maxWidth: BUBBLE_MAX_WIDTH,
  },
  messageRowMine: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  messageRowOther: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },

  // ── Sender ──
  senderName: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#FFD60A",
    marginBottom: 3,
    marginLeft: 14,
    letterSpacing: 0.2,
  },

  // ── Bubble ──
  bubble: {
    borderRadius: 18,
    overflow: "hidden",
    paddingHorizontal: 13,
    paddingVertical: 8,
    gap: 4,
  },
  bubbleMine: {
    backgroundColor: MINE_BG,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: OTHER_BG,
    borderBottomLeftRadius: 4,
  },
  bubbleMedia: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },

  // ── Message text ──
  messageText: {
    fontSize: 15.5,
    lineHeight: 21,
    letterSpacing: 0.1,
  },
  messageTextMine: {
    color: "#FFFFFF",
  },
  messageTextOther: {
    color: "#EAEAEA",
  },

  // ── Deleted ──
  deletedText: {
    fontSize: 14,
    fontStyle: "italic",
    color: TEXT_MUTED,
  },

  // ── Footer ──
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 1,
  },
  footerMine: {
    justifyContent: "flex-end",
  },
  footerOther: {
    justifyContent: "flex-start",
  },

  //time
  timeText: {
    fontSize: 10.5,
    color: TEXT_MUTED,
  },

  //msg read
  tick: {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    fontWeight: "600",
  },
  tickRead: {
    color: "#4FC3F7",
  },

  // ── System event ──
  systemEventRow: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  systemEventPill: {
    backgroundColor: SYSTEM_BG,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.1)",
  },
  systemEventText: {
    fontSize: 12,
    color: TEXT_MUTED,
    textAlign: "center",
  },
});

export default memo(ChatMessageItem);
