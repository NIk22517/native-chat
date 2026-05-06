import { AttachmentType } from "@/hooks/chat/use-chat-messages";
import { Image } from "expo-image";
import { useMemo } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MAX_WIDTH = SCREEN_WIDTH * 0.72;
const GAP = 4;

interface MessageAttachmentsProps {
  attachments: AttachmentType[];
}

type Cell = {
  index: number;
  colSpan?: number;
  rowSpan?: number;
};

const getLayoutConfig = (count: number): Cell[] => {
  if (count === 1) return [{ index: 0, colSpan: 2, rowSpan: 2 }];
  if (count === 2)
    return [
      { index: 0, rowSpan: 2 },
      { index: 1, rowSpan: 2 },
    ];
  if (count === 3)
    return [
      { index: 0, rowSpan: 1 },
      { index: 1, rowSpan: 1 },
      { index: 2, colSpan: 2, rowSpan: 1 },
    ];

  return [{ index: 0 }, { index: 1 }, { index: 2 }, { index: 3 }];
};

const formatBytes = (bytes?: number): string => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const fileIcon = (format?: string): string => {
  if (!format) return "📎";
  const f = format.toLowerCase();
  if (["pdf"].includes(f)) return "📄";
  if (["doc", "docx"].includes(f)) return "📝";
  if (["xls", "xlsx"].includes(f)) return "📊";
  if (["zip", "rar", "7z"].includes(f)) return "🗜️";
  if (["mp3", "wav", "ogg", "aac"].includes(f)) return "🎵";
  return "📎";
};

export const MessageAttachments = ({
  attachments,
}: MessageAttachmentsProps) => {
  const { media, files } = useMemo(() => {
    const media: AttachmentType[] = [];
    const files: AttachmentType[] = [];

    for (const att of attachments) {
      if (att.resource_type === "image" || att.resource_type === "video") {
        media.push(att);
      } else {
        files.push(att);
      }
    }

    return { media, files };
  }, [attachments]);

  const visible = media.slice(0, 4);
  const remaining = media.length - 4;
  const layout = getLayoutConfig(visible.length);

  const half = (MAX_WIDTH - GAP) / 2;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { width: MAX_WIDTH }]}>
        {layout.map((cell, i) => {
          const item = visible[cell.index];
          if (!item) return null;

          const width = cell.colSpan === 2 ? MAX_WIDTH : half;

          const height = cell.rowSpan === 2 ? half * 2 + GAP : half;

          const isLast = i === 3 && remaining > 0;

          return (
            <View
              key={i}
              style={[
                styles.item,
                {
                  width,
                  height,
                },
              ]}
            >
              <Image
                source={{ uri: item.secure_url }}
                contentFit="cover"
                style={styles.image}
              />

              {isLast && (
                <View style={styles.overlay}>
                  <Text style={styles.overlayText}>+{remaining}</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {files.length > 0 && (
        <View style={styles.fileList}>
          {files.map((file, idx) => (
            <View key={file.asset_id ?? idx} style={styles.fileRow}>
              <Text style={styles.fileIcon}>{fileIcon(file.format)}</Text>
              <View style={styles.fileMeta}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {file.original_filename ?? file.public_id ?? "File"}
                </Text>
                {file.bytes != null && (
                  <Text style={styles.fileSize}>{formatBytes(file.bytes)}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 4,
  },
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
  },
  item: {
    borderRadius: 14,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
  },
  overlayText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  fileList: {
    gap: 4,
    paddingTop: 2,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  fileIcon: { fontSize: 20 },
  fileMeta: { flex: 1, gap: 1 },
  fileName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#EAEAEA",
  },
  fileSize: {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
  },
});
