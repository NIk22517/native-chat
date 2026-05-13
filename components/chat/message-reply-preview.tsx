import { ChatMessage } from "@/hooks/chat/use-chat-messages";
import { Image } from "expo-image";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { IconSymbol } from "../ui/icon-symbol";

interface MessageReplyPreviewProp {
  reply: NonNullable<ChatMessage["reply_data"]>;
  isMine: boolean;
  onClose?: () => void;
}

const MAX_VISIBLE = 4;

export const MessageReplyPreview = ({
  reply,
  isMine,
  onClose,
}: MessageReplyPreviewProp) => {
  return (
    <View
      style={[
        styles.container,
        isMine ? styles.replyPreviewMine : styles.replyPreviewOther,
      ]}
    >
      <View style={styles.replyContent}>
        <View style={styles.replyBar} />
        <View>
          <Text numberOfLines={1} style={styles.senderName}>
            {reply.sender_name}
          </Text>
          {reply?.attachments && reply?.attachments?.length > 0 && (
            <FlatList
              data={reply.attachments.slice(0, MAX_VISIBLE)}
              keyExtractor={(_, index) => index.toString()}
              numColumns={4}
              columnWrapperStyle={{
                gap: 4,
              }}
              contentContainerStyle={{
                gap: 4,
              }}
              renderItem={({ item, index }) => {
                const remaining =
                  (reply?.attachments?.length ?? 1) - MAX_VISIBLE;
                const isLastVisible =
                  index === MAX_VISIBLE - 1 && remaining > 0;

                return (
                  <View style={styles.attachmentContainer}>
                    {item.resource_type === "image" ? (
                      <Image
                        source={{
                          uri: item.secure_url,
                        }}
                        contentFit="cover"
                        style={{
                          width: "100%",
                          height: "100%",
                        }}
                      />
                    ) : (
                      <View style={styles.docContainer}>
                        <IconSymbol
                          name={
                            item.resource_type === "video"
                              ? "video.and.waveform.fill"
                              : "document"
                          }
                          size={20}
                          color="white"
                        />
                      </View>
                    )}

                    {isLastVisible && (
                      <View style={styles.overlay}>
                        <Text
                          style={{
                            color: "white",
                            fontWeight: "700",
                            fontSize: 16,
                          }}
                        >
                          +{remaining}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              }}
            />
          )}
          {reply.message && (
            <Text style={styles.replyText} numberOfLines={1}>
              {reply.message}
            </Text>
          )}
        </View>
      </View>

      {onClose && (
        <Pressable
          onPress={onClose}
          hitSlop={10}
          style={({ pressed }) => [
            styles.cancelBtn,
            pressed && { opacity: 0.6 },
          ]}
        >
          <Text style={styles.cancelTxt}>✕</Text>
        </Pressable>
      )}
    </View>
  );
};

const REPLY_BAR_COLOR = "#FFD60A";
const REPLY_MINE_BG = "rgba(255,255,255,0.12)";
const REPLY_OTHER_BG = "rgba(255,255,255,0.07)";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 8,
    gap: 8,
    marginBottom: 2,
    minWidth: 150,
    justifyContent: "space-between",
  },
  replyPreviewMine: {
    backgroundColor: REPLY_MINE_BG,
  },
  replyPreviewOther: {
    backgroundColor: REPLY_OTHER_BG,
  },
  replyContent: {
    flexDirection: "row",
    gap: 8,
    // flex: 1,
    alignItems: "stretch",
  },
  replyBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: REPLY_BAR_COLOR,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "700",
    color: REPLY_BAR_COLOR,
  },
  replyText: {
    fontSize: 12.5,
    color: "rgba(255,255,255,0.75)",
    flexShrink: 1,
    maxWidth: 200,
  },
  attachmentContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#1f1f1f",
  },
  docContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelTxt: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "700",
  },
});
