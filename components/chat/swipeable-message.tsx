import { useThemeColor } from "@/hooks/use-theme-color";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { IconSymbol } from "../ui/icon-symbol";

const SWIPE_THRESHOLD = 72;
const MAX_DRAG = 90;

interface SwipeableMessageProps {
  children: React.ReactNode;
  isMine: boolean;
  onReply: () => void;
}

export const SwipeableMessage = ({
  children,
  isMine,
  onReply,
}: SwipeableMessageProps) => {
  const translateX = useSharedValue(0);
  const triggered = useSharedValue(false);

  const triggerReply = useCallback(() => {
    onReply();
  }, [onReply]);

  const panGesture = Gesture.Pan()
    .activeOffsetX(isMine ? [-10, 999] : [-999, 10])
    .failOffsetY([-8, 8])
    .onUpdate((e) => {
      if (isMine) {
        const drag = Math.max(e.translationX, -MAX_DRAG);
        translateX.value = drag < 0 ? drag : 0;
      } else {
        const drag = Math.min(e.translationX, MAX_DRAG);
        translateX.value = drag > 0 ? drag : 0;
      }
      const abs = Math.abs(translateX.value);
      if (abs >= SWIPE_THRESHOLD && !triggered.value) {
        triggered.value = true;
        runOnJS(triggerReply)();
      }
    })
    .onEnd(() => {
      translateX.value = withSpring(0, { damping: 18, stiffness: 200 });
      triggered.value = false;
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const iconProgress = useAnimatedStyle(() => {
    const abs = Math.abs(translateX.value);
    const opacity = interpolate(abs, [10, SWIPE_THRESHOLD], [0, 1], "clamp");
    const scale = interpolate(abs, [10, SWIPE_THRESHOLD], [0.5, 1], "clamp");
    return { opacity, transform: [{ scale }] };
  });

  const iconSide = isMine ? { left: 12 } : { right: 12 };

  return (
    <View style={styles.wrapper}>
      {/* Reply icon revealed behind the message */}
      <Animated.View style={[styles.replyIcon, iconSide, iconProgress]}>
        <ReplyArrow mirrored={isMine} />
      </Animated.View>

      {/* Sliding message row */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={rowStyle}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
};

function ReplyArrow({ mirrored }: { mirrored: boolean }) {
  const color = useThemeColor({}, "border");
  return (
    <IconSymbol
      name="0.circle"
      style={[mirrored && { transform: [{ scaleX: -1 }] }]}
      color={color}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    justifyContent: "center",
  },
  replyIcon: {
    position: "absolute",
    zIndex: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});
