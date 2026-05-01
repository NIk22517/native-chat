import { AttachmentType, ChatMessage } from "@/hooks/chat/use-chat-messages";
import React, { memo } from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";

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

const ReplyPreview = ({
  reply,
  isMine,
}: {
  reply: NonNullable<ChatMessage["reply_data"]>;
  isMine: boolean;
}) => {
  const hasImage =
    reply.attachments?.some((a) => a.resource_type === "image") ?? false;
  const firstImage = reply.attachments?.find(
    (a) => a.resource_type === "image",
  );

  return (
    <View
      style={[
        styles.replyPreview,
        isMine ? styles.replyPreviewMine : styles.replyPreviewOther,
      ]}
    >
      <View style={styles.replyBar} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.replySenderName} numberOfLines={1}>
          {reply.sender_name}
        </Text>
        {firstImage ? (
          <View style={styles.replyImageRow}>
            <Image
              source={{ uri: firstImage.secure_url }}
              style={styles.replyThumb}
            />
            {reply.message ? (
              <Text style={styles.replyText} numberOfLines={1}>
                {reply.message}
              </Text>
            ) : (
              <Text style={styles.replyTextMuted}>Photo</Text>
            )}
          </View>
        ) : (
          <Text style={styles.replyText} numberOfLines={2}>
            {reply.message || "Attachment"}
          </Text>
        )}
      </View>
    </View>
  );
};

const AttachmentGrid = ({ attachments }: { attachments: AttachmentType[] }) => {
  const images = attachments.filter((a) => a.resource_type === "image");
  const videos = attachments.filter((a) => a.resource_type === "video");
  const all = [...images, ...videos];

  if (all.length === 0) return null;

  const isSingle = all.length === 1;
  const isDouble = all.length === 2;

  return (
    <View
      style={[
        styles.attachmentGrid,
        isSingle && styles.attachmentGridSingle,
        isDouble && styles.attachmentGridDouble,
      ]}
    >
      {all.slice(0, 4).map((att, idx) => {
        const isVideo = att.resource_type === "video";
        const isLastAndMore = idx === 3 && attachments.length > 4;
        const remaining = attachments.length - 4;

        return (
          <View
            key={att.asset_id}
            style={[
              styles.attachmentCell,
              isSingle && styles.attachmentCellSingle,
              isDouble && styles.attachmentCellDouble,
            ]}
          >
            <Image
              source={{ uri: att.secure_url }}
              style={styles.attachmentImage}
              resizeMode="cover"
            />
            {isVideo && (
              <View style={styles.videoOverlay}>
                <View style={styles.playButton}>
                  <Text style={styles.playIcon}>▶</Text>
                </View>
                {att.duration !== undefined && (
                  <Text style={styles.videoDuration}>
                    {Math.floor(att.duration / 60)}:
                    {String(Math.floor(att.duration % 60)).padStart(2, "0")}
                  </Text>
                )}
              </View>
            )}
            {isLastAndMore && (
              <View style={styles.moreOverlay}>
                <Text style={styles.moreText}>+{remaining + 1}</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const ReadTick = ({ status }: { status: "read" | "unread" }) => (
  <Text style={[styles.tick, status === "read" && styles.tickRead]}>
    {status === "read" ? "✓✓" : "✓"}
  </Text>
);

const DeletedMessage = ({
  isMine,
  text,
}: {
  isMine: boolean;
  text: string;
}) => (
  <Text style={[styles.deletedText, { textAlign: isMine ? "right" : "left" }]}>
    🚫 {text}
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

  const isMine = msg.sender_id === currentUserId;
  const isDeleted = !!msg.delete_action;
  const hasAttachments = msg.attachments && msg.attachments.length > 0;
  const hasText = !!msg.message;
  const hasReply = !!msg.reply_data;

  return (
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
        {/* Reply preview */}
        {hasReply && <ReplyPreview reply={msg.reply_data!} isMine={isMine} />}

        {/* Attachments */}
        {hasAttachments && <AttachmentGrid attachments={msg.attachments!} />}

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
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const MINE_BG = "#0A7CFF";
const OTHER_BG = "#2A2A2E";
const REPLY_MINE_BG = "rgba(255,255,255,0.12)";
const REPLY_OTHER_BG = "rgba(255,255,255,0.07)";
const SYSTEM_BG = "rgba(255,255,255,0.08)";
const TEXT_PRIMARY = "#FFFFFF";
const TEXT_MUTED = "rgba(255,255,255,0.45)";
const REPLY_BAR_COLOR = "#FFD60A";

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

  // ── Reply preview ──
  replyPreview: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 8,
    gap: 8,
    marginBottom: 2,
  },
  replyPreviewMine: {
    backgroundColor: REPLY_MINE_BG,
  },
  replyPreviewOther: {
    backgroundColor: REPLY_OTHER_BG,
  },
  replyBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: REPLY_BAR_COLOR,
    alignSelf: "stretch",
  },
  replySenderName: {
    fontSize: 12,
    fontWeight: "700",
    color: REPLY_BAR_COLOR,
  },
  replyText: {
    fontSize: 12.5,
    color: "rgba(255,255,255,0.75)",
    flexShrink: 1,
  },
  replyTextMuted: {
    fontSize: 12.5,
    color: TEXT_MUTED,
    fontStyle: "italic",
  },
  replyImageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  replyThumb: {
    width: 36,
    height: 36,
    borderRadius: 6,
  },

  // ── Attachments ──
  attachmentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
    borderRadius: 14,
    overflow: "hidden",
  },
  attachmentGridSingle: {},
  attachmentGridDouble: {},
  attachmentCell: {
    width: (BUBBLE_MAX_WIDTH - 4) / 2,
    height: (BUBBLE_MAX_WIDTH - 4) / 2,
    position: "relative",
  },
  attachmentCellSingle: {
    width: BUBBLE_MAX_WIDTH,
    height: BUBBLE_MAX_WIDTH * 0.75,
  },
  attachmentCellDouble: {
    width: (BUBBLE_MAX_WIDTH - 2) / 2,
    height: (BUBBLE_MAX_WIDTH - 2) / 2,
  },
  attachmentImage: {
    width: "100%",
    height: "100%",
  },

  // ── Video overlay ──
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  playIcon: {
    fontSize: 16,
    color: "#000",
    marginLeft: 3,
  },
  videoDuration: {
    position: "absolute",
    bottom: 6,
    right: 8,
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // ── More overlay ──
  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  moreText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
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
  timeText: {
    fontSize: 10.5,
    color: TEXT_MUTED,
  },
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
