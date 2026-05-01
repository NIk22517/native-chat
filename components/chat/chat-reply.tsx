import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/useChatStore";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export const ChatReply = () => {
  const userId = useAuthStore((s) => s.user?.id);
  const replyData = useChatStore((s) => s.replyData);
  const cancelReply = useChatStore((s) => s.cancelReply);
  const replyBarHeight = useSharedValue(0);
  const replyBarOpacity = useSharedValue(0);

  useEffect(() => {
    if (replyData) {
      replyBarHeight.value = withSpring(64, { damping: 16, stiffness: 180 });
      replyBarOpacity.value = withTiming(1, { duration: 150 });
    } else {
      replyBarHeight.value = withTiming(0, { duration: 150 });
      replyBarOpacity.value = withTiming(0, { duration: 150 });
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
        <View style={styles.replyBarInner}>
          <View style={styles.replyAccent} />
          <View style={styles.replyContent}>
            <Text style={styles.replyName} numberOfLines={1}>
              {replyData.sender_id === userId ? "You" : replyData.sender_name}
            </Text>
            <Text style={styles.replyText} numberOfLines={1}>
              {replyData.attachments?.length
                ? "📎 Attachment"
                : replyData.message}
            </Text>
          </View>
          <Pressable
            onPress={cancelReply}
            hitSlop={10}
            style={({ pressed }) => [
              styles.cancelBtn,
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text style={styles.cancelTxt}>✕</Text>
          </Pressable>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  replyBar: {
    backgroundColor: "#1C1C1E",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  replyBarInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  replyAccent: {
    width: 3,
    height: 36,
    borderRadius: 2,
    backgroundColor: "#0A7CFF",
  },
  replyContent: { flex: 1, gap: 2 },
  replyName: { fontSize: 12.5, fontWeight: "700", color: "#0A7CFF" },
  replyText: { fontSize: 13, color: "rgba(255,255,255,0.55)" },
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
