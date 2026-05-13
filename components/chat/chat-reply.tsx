import { useChatStore } from "@/store/useChatStore";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { MessageReplyPreview } from "./message-reply-preview";

export const ChatReply = () => {
  const replyData = useChatStore((s) => s.replyData);
  const cancelReply = useChatStore((s) => s.cancelReply);
  const replyBarHeight = useSharedValue(0);
  const replyBarOpacity = useSharedValue(0);

  useEffect(() => {
    if (replyData) {
      const hasText = !!replyData.message;
      const hasAttachments = (replyData.attachments?.length ?? 0) > 0;

      let targetHeight = 0;
      targetHeight += 36;
      if (hasText) {
        targetHeight += 20;
      }
      if (hasAttachments) {
        targetHeight += 56;
      }
      replyBarHeight.value = withSpring(targetHeight, {
        damping: 16,
        stiffness: 180,
      });
      replyBarOpacity.value = withTiming(1, {
        duration: 150,
      });
    } else {
      replyBarHeight.value = withTiming(0, {
        duration: 150,
      });

      replyBarOpacity.value = withTiming(0, {
        duration: 150,
      });
    }
  }, [replyData]);

  const replyBarStyle = useAnimatedStyle(() => ({
    height: replyBarHeight.value,
    opacity: replyBarOpacity.value,
    overflow: "hidden",
  }));
  return (
    <Animated.View style={[styles.replyBar, replyBarStyle]}>
      {replyData && (
        <MessageReplyPreview
          isMine={false}
          reply={{
            attachments: replyData.attachments,
            created_at: replyData.created_at,
            id: replyData.id,
            message: replyData.message,
            sender_id: replyData.sender_id,
            sender_name: replyData.sender_name,
          }}
          onClose={cancelReply}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  replyBar: {
    backgroundColor: "#1C1C1E",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
    // borderRadius: 10,
  },
});
