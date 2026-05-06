import { useThemeColor } from "@/hooks/use-theme-color";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { IconSymbol } from "../ui/icon-symbol";
import { ScheduleMessageSheet } from "./schedule-message-sheet";

interface SendButtonProps {
  canSend: boolean;
  onPress: () => void;
  onSchedule: (scheduledAt: Date) => void;
}

export const SendButton = ({
  canSend,
  onPress,
  onSchedule,
}: SendButtonProps) => {
  const [open, setOpen] = useState(false);
  const borderColor = useThemeColor({}, "border");

  return (
    <>
      <ScheduleMessageSheet
        onClose={() => {
          setOpen(false);
        }}
        visible={open}
        onSchedule={(scheduledAt) => {
          onSchedule(scheduledAt);
        }}
      />

      <Pressable
        onLongPress={() => {
          if (!canSend) return;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setOpen(true);
        }}
        delayLongPress={300}
        onPress={onPress}
        disabled={!canSend}
        hitSlop={8}
        style={({ pressed }) => [
          styles.iconBtn,
          styles.sendBtn,
          canSend && styles.sendBtnActive,
          pressed && canSend && styles.sendBtnPressed,
        ]}
      >
        <IconSymbol
          name="paperplane.fill"
          size={16}
          color={canSend ? "#fff" : borderColor}
        />
      </Pressable>
    </>
  );
};

const styles = StyleSheet.create({
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 1,
  },
  iconBtnPressed: { opacity: 0.55 },
  sendBtn: { backgroundColor: "transparent" },
  sendBtnActive: { backgroundColor: "#0A7CFF" },
  sendBtnPressed: { opacity: 0.75, transform: [{ scale: 0.91 }] },
});
