import {
  useDeleteChatMessages,
  type DeleteMessagesPayload,
} from "@/hooks/chat/use-delete-chat-messages";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/useChatStore";
import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { IconSymbol } from "../ui/icon-symbol";

export const DeleteMessage = () => {
  const textColor = useThemeColor({}, "text");
  const clearSelection = useChatStore((s) => s.clearSelection);
  const selected = useChatStore((s) => s.selected);
  const userId = useAuthStore((s) => s.user?.id);
  const [open, setOpen] = useState(false);
  const onClose = () => {
    setOpen(false);
    clearSelection();
  };
  const { mutate, isPending } = useDeleteChatMessages();
  const count = selected.size;
  const canDeleteForEverOne = useMemo(() => {
    for (const select of selected.values()) {
      if (select.sender_id !== Number(userId)) return "other";
    }
    return "you";
  }, [selected, userId]);

  const handleDelete = (
    action: Exclude<DeleteMessagesPayload["action"], "clear_chat">,
  ) => {
    const chatMessages = Array.from(selected.values());
    const chat_id = chatMessages.at(0)?.chat_id;
    mutate(
      {
        data: {
          action,
          chat_id: chat_id,
          message_ids: chatMessages.map((el) => el.id),
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };
  return (
    <>
      <Pressable hitSlop={10} onPress={() => setOpen(true)}>
        <IconSymbol name="trash.fill" color={textColor} size={20} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <Pressable
          disabled={isPending}
          style={styles.backdrop}
          onPress={onClose}
        />
        <View style={styles.sheet}>
          <Text style={styles.title}>
            Delete {count > 1 ? count : ""} message{count > 1 ? "s" : ""}?
          </Text>
          {canDeleteForEverOne === "you" && (
            <Pressable
              disabled={isPending}
              onPress={() => handleDelete("everyone")}
              style={({ pressed }) => [
                styles.btn,
                styles.btnDanger,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.btnDangerTxt}>Delete for Everyone</Text>
            </Pressable>
          )}
          <Pressable
            disabled={isPending}
            onPress={() => handleDelete("self")}
            style={({ pressed }) => [
              styles.btn,
              styles.btnSecondary,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.btnSecondaryTxt}>Delete for Me</Text>
          </Pressable>
          <Pressable
            disabled={isPending}
            onPress={onClose}
            style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
          >
            <Text style={styles.cancelTxt}>Cancel</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 36,
    paddingHorizontal: 16,
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    marginBottom: 8,
  },
  btn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  btnDanger: { backgroundColor: "rgba(255,59,48,0.15)" },
  btnSecondary: { backgroundColor: "rgba(255,255,255,0.07)" },
  btnDangerTxt: { fontSize: 16, fontWeight: "600", color: "#FF3B30" },
  btnSecondaryTxt: { fontSize: 16, color: "#fff" },
  cancelTxt: { fontSize: 16, color: "rgba(255,255,255,0.4)" },
  pressed: { opacity: 0.65 },
});
