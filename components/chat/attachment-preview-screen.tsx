import * as DocumentPicker from "expo-document-picker";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRef, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChatReply } from "./chat-reply";

const { width: SW, height: SH } = Dimensions.get("window");

export type PickedAsset =
  | (ImagePicker.ImagePickerAsset & { kind: "media" })
  | (DocumentPicker.DocumentPickerAsset & { kind: "document" });

interface AttachmentPreviewProps {
  assets: PickedAsset[];
  initialIndex?: number;
  onClose: () => void;
  onRemove: (index: number) => void;
  onSend: (caption: string) => void;
  onAddMore: () => void;
}

function DocPreview({ asset }: { asset: PickedAsset }) {
  const name =
    asset.kind === "document" ? asset.name : (asset.fileName ?? "File");
  const size =
    asset.kind === "document" && asset.size
      ? `${(asset.size / 1024).toFixed(1)} KB`
      : null;

  return (
    <View style={docStyles.container}>
      <View style={docStyles.iconBox}>
        <Text style={docStyles.icon}>📄</Text>
      </View>
      <Text style={docStyles.name} numberOfLines={3}>
        {name}
      </Text>
      {size && <Text style={docStyles.size}>{size}</Text>}
    </View>
  );
}

const docStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 40,
  },
  iconBox: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: { fontSize: 52 },
  name: {
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    lineHeight: 24,
  },
  size: { fontSize: 13, color: "rgba(255,255,255,0.45)" },
});

function Slide({ asset }: { asset: PickedAsset }) {
  const isImage = asset.kind === "media" && asset.type === "image";
  const isVideo = asset.kind === "media" && asset.type === "video";

  if (isImage && asset.kind === "media") {
    return (
      <Image
        source={{ uri: asset.uri }}
        style={slideStyles.image}
        contentFit="contain"
      />
    );
  }

  if (isVideo && asset.kind === "media") {
    return (
      <View style={slideStyles.videoContainer}>
        <Image
          source={{ uri: asset.uri }}
          style={slideStyles.image}
          contentFit="contain"
        />
        <View style={slideStyles.playOverlay}>
          <View style={slideStyles.playBtn}>
            <Text style={slideStyles.playIcon}>▶</Text>
          </View>
        </View>
      </View>
    );
  }

  return <DocPreview asset={asset} />;
}

const slideStyles = StyleSheet.create({
  image: { width: SW, height: "100%" },
  videoContainer: { width: SW, height: "100%" },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  playIcon: { fontSize: 28, color: "#fff", marginLeft: 4 },
});

function ThumbItem({
  asset,
  active,
  onPress,
  onRemove,
}: {
  asset: PickedAsset;
  active: boolean;
  onPress: () => void;
  onRemove: () => void;
}) {
  const isMedia = asset.kind === "media";

  return (
    <Pressable
      onPress={onPress}
      style={[thumbStyles.thumb, active && thumbStyles.thumbActive]}
    >
      {isMedia && asset.kind === "media" ? (
        <Image
          source={{ uri: asset.uri }}
          style={thumbStyles.img}
          contentFit="cover"
        />
      ) : (
        <View style={thumbStyles.docThumb}>
          <Text style={{ fontSize: 20 }}>📄</Text>
        </View>
      )}
      {active && <View style={thumbStyles.activeBorder} />}
      <Pressable onPress={onRemove} hitSlop={4} style={thumbStyles.removeBtn}>
        <Text style={thumbStyles.removeTxt}>✕</Text>
      </Pressable>
    </Pressable>
  );
}

const thumbStyles = StyleSheet.create({
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    overflow: "visible",
    position: "relative",
  },
  thumbActive: {},
  img: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  docThumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  activeBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: "#0A7CFF",
  },
  removeBtn: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  removeTxt: { fontSize: 9, color: "#fff", fontWeight: "800" },
});

export function AttachmentPreviewScreen({
  assets,
  initialIndex = 0,
  onClose,
  onRemove,
  onSend,
  onAddMore,
}: AttachmentPreviewProps) {
  const [caption, setCaption] = useState("");
  const thumbScrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const activeIndexSV = useSharedValue(initialIndex);
  const translateX = useSharedValue(-initialIndex * SW);

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(assets.length - 1, index));

    setActiveIndex(clamped);
    activeIndexSV.value = clamped;

    translateX.value = withSpring(-clamped * SW, {
      damping: 20,
      stiffness: 180,
    });

    thumbScrollRef.current?.scrollTo({
      x: clamped * 70 - SW / 2 + 28,
      animated: true,
    });
  };

  const startX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate((e) => {
      const next = startX.value + e.translationX;
      const minX = -(assets.length - 1) * SW;

      if (next > 0) {
        translateX.value = next * 0.2;
      } else if (next < minX) {
        translateX.value = minX + (next - minX) * 0.2;
      } else {
        translateX.value = next;
      }
    })
    .onEnd((e) => {
      const threshold = SW * 0.25;

      if (e.translationX < -threshold) {
        runOnJS(goTo)(activeIndexSV.value + 1);
      } else if (e.translationX > threshold) {
        runOnJS(goTo)(activeIndexSV.value - 1);
      } else {
        translateX.value = withSpring(-activeIndexSV.value * SW, {
          damping: 20,
          stiffness: 180,
        });
      }
    });

  const stripStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleRemove = (index: number) => {
    onRemove(index);
    if (assets.length === 1) {
      onClose();
      return;
    }
    const next = index >= assets.length - 1 ? index - 1 : index;
    activeIndexSV.value = next;
    translateX.value = -next * SW;
    setActiveIndex(next);
  };

  const showDots = assets.length <= 8;

  return (
    <Modal
      visible
      transparent={false}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <View style={s.root}>
            <SafeAreaView style={s.topBar}>
              <Pressable onPress={onClose} hitSlop={12} style={s.closeBtn}>
                <Text style={s.closeTxt}>✕</Text>
              </Pressable>

              <Text style={s.counter}>
                {activeIndex + 1} / {assets.length}
              </Text>

              <View style={{ width: 44 }} />
            </SafeAreaView>

            <GestureDetector gesture={panGesture}>
              <Animated.View
                style={[s.strip, { width: SW * assets.length }, stripStyle]}
              >
                {assets.map((asset, i) => (
                  <View key={i} style={{ width: SW, height: "100%" }}>
                    <Slide asset={asset} />
                  </View>
                ))}
              </Animated.View>
            </GestureDetector>

            {showDots && assets.length > 1 && (
              <View style={s.dots}>
                {assets.map((_, i) => (
                  <Pressable key={i} onPress={() => goTo(i)}>
                    <View style={[s.dot, i === activeIndex && s.dotActive]} />
                  </Pressable>
                ))}
              </View>
            )}

            <View style={s.bottom}>
              <ScrollView
                ref={thumbScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.thumbStrip}
              >
                {assets.map((asset, i) => (
                  <ThumbItem
                    key={i}
                    asset={asset}
                    active={i === activeIndex}
                    onPress={() => goTo(i)}
                    onRemove={() => handleRemove(i)}
                  />
                ))}

                <Pressable onPress={onAddMore} style={s.addMoreBtn}>
                  <Text style={s.addMoreIcon}>+</Text>
                </Pressable>
              </ScrollView>

              <ChatReply />

              <View style={s.captionRow}>
                <TextInput
                  value={caption}
                  onChangeText={setCaption}
                  placeholder="Add a caption…"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  style={s.captionInput}
                  multiline
                  textAlignVertical="top"
                  maxLength={500}
                />
                <Pressable
                  onPress={() => onSend(caption)}
                  style={({ pressed }) => [
                    s.sendBtn,
                    pressed && s.sendBtnPressed,
                  ]}
                >
                  <Text style={s.sendIcon}>➤</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 8 : 0,
    paddingBottom: 12,
    zIndex: 10,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeTxt: { fontSize: 15, color: "#fff", fontWeight: "700" },
  counter: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    letterSpacing: 0.5,
  },

  strip: {
    flex: 1,
    flexDirection: "row",
  },

  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  dotActive: {
    backgroundColor: "#fff",
    width: 18,
    borderRadius: 3,
  },

  bottom: {
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
    gap: 12,
  },
  thumbStrip: {
    paddingHorizontal: 16,
    gap: 10,
    alignItems: "center",
  },
  addMoreBtn: {
    width: 56,
    height: 56,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  addMoreIcon: { fontSize: 26, color: "rgba(255,255,255,0.5)" },

  captionRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginHorizontal: 12,
    gap: 10,
  },
  captionInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15.5,
    color: "#fff",
    maxHeight: 100,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.15)",
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#0A7CFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0A7CFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  sendBtnPressed: { opacity: 0.8, transform: [{ scale: 0.93 }] },
  sendIcon: { fontSize: 18, color: "#fff", marginLeft: 2 },
});
