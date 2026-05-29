import { useScheduleMessage } from "@/hooks/chat/use-schedule-messages";
import { useSendMessage } from "@/hooks/chat/use-send-message";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useChatStore } from "@/store/useChatStore";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, {
  interpolate,
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { IconSymbol } from "../ui/icon-symbol";
import {
  AttachmentPreviewScreen,
  type PickedAsset,
} from "./attachment-preview-screen";
import { ChatReply } from "./chat-reply";
import { SendButton } from "./send-button";

interface AttachOptionProps {
  emoji: string;
  label: string;
  color: string;
  onPress: () => void;
  index: number;
  progress: SharedValue<number>;
}

const AttachOption = ({
  emoji,
  label,
  color,
  onPress,
  index,
  progress,
}: AttachOptionProps) => {
  const animStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.6, 1], [0, 0, 1]),
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [24 + index * 8, 0]) },
      { scale: interpolate(progress.value, [0, 1], [0.8, 1]) },
    ],
  }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.attachOption,
          pressed && styles.attachOptionPressed,
        ]}
      >
        <View style={[styles.attachIconCircle, { backgroundColor: color }]}>
          <Text style={styles.attachEmoji}>{emoji}</Text>
        </View>
        <Text style={styles.attachLabel}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
};

export const ChatInput = ({ chat_id }: { chat_id: string }) => {
  const borderColor = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");

  const [message, setMessage] = useState("");
  const [assets, setAssets] = useState<PickedAsset[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const replyData = useChatStore((s) => s.replyData);
  const cancelReply = useChatStore((s) => s.cancelReply);

  const progress = useSharedValue(0);
  const { mutate, isPending } = useSendMessage();
  const { mutate: scheduleMutate, isPending: isSchedulePending } =
    useScheduleMessage();

  const canSend =
    (message.trim().length > 0 || assets.length > 0) &&
    !isPending &&
    !isSchedulePending;

  const openMenu = () => {
    Keyboard.dismiss();
    setShowAttachMenu(true);
    progress.value = withSpring(1, { damping: 16, stiffness: 140 });
  };

  const closeMenu = () => {
    progress.value = withTiming(0, { duration: 200 }, (finished) => {
      if (finished) runOnJS(setShowAttachMenu)(false);
    });
  };

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
  }));

  const menuStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.5, 1], [0, 0, 1]),
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [30, 0]) },
      { scale: interpolate(progress.value, [0, 1], [0.92, 1]) },
    ],
  }));

  const openPreviewWith = (incoming: PickedAsset[]) => {
    setAssets((prev) => {
      const merged = [...prev, ...incoming];
      setPreviewIndex(prev.length);
      return merged;
    });
    setShowPreview(true);
  };

  const handleRemove = (index: number) => {
    setAssets((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) setShowPreview(false);
      return next;
    });
  };

  const pickCamera = async () => {
    closeMenu();
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images", "videos"],
      quality: 0.85,
    });
    if (!result.canceled)
      openPreviewWith(
        result.assets.map((a) => ({ ...a, kind: "media" as const })),
      );
  };

  const pickImage = async () => {
    closeMenu();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.85,
    });
    if (!result.canceled)
      openPreviewWith(
        result.assets.map((a) => ({ ...a, kind: "media" as const })),
      );
  };

  const pickVideo = async () => {
    closeMenu();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      allowsMultipleSelection: true,
    });
    if (!result.canceled)
      openPreviewWith(
        result.assets.map((a) => ({ ...a, kind: "media" as const })),
      );
  };

  const pickDocument = async () => {
    closeMenu();
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (!result.canceled)
      openPreviewWith(
        result.assets.map((a) => ({ ...a, kind: "document" as const })),
      );
  };

  const handleAddMore = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsMultipleSelection: true,
      quality: 0.85,
    });
    if (!result.canceled)
      setAssets((prev) => [
        ...prev,
        ...result.assets.map((a) => ({ ...a, kind: "media" as const })),
      ]);
  };

  const handleSend = (caption: string) => {
    mutate(
      {
        chat_id,
        message: caption,
        assets,
        reply_message_id: replyData?.id ?? null,
      },
      {
        onSuccess: () => {
          setAssets([]);
          setShowPreview(false);
          setMessage("");
          cancelReply();
        },
      },
    );
  };

  const handleSchedule = ({
    message,
    scheduledAt,
  }: {
    scheduledAt: Date;
    message: string;
  }) => {
    scheduleMutate(
      {
        assets,
        message,
        chat_id,
        scheduledAt,
      },
      {
        onSuccess: () => {
          setAssets([]);
          setShowPreview(false);
          setMessage("");
          cancelReply();
        },
      },
    );
  };

  const ATTACH_OPTIONS = [
    { emoji: "📷", label: "Camera", color: "#FF6B6B", onPress: pickCamera },
    { emoji: "🖼️", label: "Photo", color: "#4ECDC4", onPress: pickImage },
    { emoji: "🎬", label: "Video", color: "#A78BFA", onPress: pickVideo },
    { emoji: "📄", label: "Document", color: "#F59E0B", onPress: pickDocument },
  ];

  return (
    <>
      {showPreview && assets.length > 0 && (
        <AttachmentPreviewScreen
          canSend={canSend}
          assets={assets}
          initialIndex={previewIndex}
          onClose={() => {
            setShowPreview(false);
            setAssets([]);
          }}
          onRemove={handleRemove}
          onSend={handleSend}
          onAddMore={handleAddMore}
          onSchedule={(date, msg) => {
            handleSchedule({ message: msg, scheduledAt: date });
          }}
        />
      )}

      {showAttachMenu && (
        <Modal
          transparent
          animationType="none"
          statusBarTranslucent
          onRequestClose={closeMenu}
        >
          <TouchableWithoutFeedback onPress={closeMenu}>
            <Animated.View style={[styles.backdrop, backdropStyle]} />
          </TouchableWithoutFeedback>
          <View style={styles.menuWrapper} pointerEvents="box-none">
            <Animated.View style={[styles.menuCard, menuStyle]}>
              <View style={styles.menuHeader}>
                <View style={styles.menuPill} />
              </View>
              <View style={styles.optionsRow}>
                {ATTACH_OPTIONS.map((opt, i) => (
                  <AttachOption
                    key={opt.label}
                    emoji={opt.emoji}
                    label={opt.label}
                    color={opt.color}
                    onPress={opt.onPress}
                    index={i}
                    progress={progress}
                  />
                ))}
              </View>
            </Animated.View>
          </View>
        </Modal>
      )}

      <ChatReply />

      <View style={[styles.container, { borderColor }]}>
        <Pressable
          onPress={showAttachMenu ? closeMenu : openMenu}
          hitSlop={8}
          style={({ pressed }) => [
            styles.iconBtn,
            pressed && styles.iconBtnPressed,
          ]}
        >
          <IconSymbol
            name="paperclip"
            size={20}
            color={showAttachMenu ? "#0A7CFF" : borderColor}
          />
        </Pressable>

        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Message"
          placeholderTextColor={borderColor}
          style={[styles.input, { color: textColor }]}
          multiline
          maxLength={2000}
        />

        <SendButton
          onPress={() => {
            handleSend(message);
          }}
          canSend={canSend}
          onSchedule={(scheduledAt) => {
            handleSchedule({ message, scheduledAt });
          }}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 4,
    marginTop: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 28,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
  },
  input: {
    flex: 1,
    fontSize: 15.5,
    lineHeight: 21,
    maxHeight: 120,
    paddingTop: 7,
    paddingBottom: 7,
    paddingHorizontal: 4,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 1,
  },
  iconBtnPressed: { opacity: 0.55 },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  menuWrapper: {
    position: "absolute",
    bottom: 90,
    left: 12,
    right: 12,
  },
  menuCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 22,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
  },
  menuHeader: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 18,
  },
  menuPill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 12,
  },
  attachOption: {
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 8,
  },
  attachOptionPressed: { opacity: 0.6, transform: [{ scale: 0.94 }] },
  attachIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  attachEmoji: { fontSize: 26 },
  attachLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    fontWeight: "500",
    letterSpacing: 0.2,
  },
});
