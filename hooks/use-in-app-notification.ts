import { useAuthStore } from "@/store/authStore";
import { useSocketStore } from "@/store/socketStore";
import * as Notifications from "expo-notifications";
import { useGlobalSearchParams, useSegments } from "expo-router";
import { useEffect, useRef } from "react";

export const useInAppNotification = () => {
  const socket = useSocketStore((state) => state.socket);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const segments = useSegments();
  const { chat_id } = useGlobalSearchParams<{ chat_id: string }>();

  const chatIdRef = useRef(chat_id);
  const segmentsRef = useRef(segments);

  useEffect(() => {
    chatIdRef.current = chat_id;
  }, [chat_id]);

  useEffect(() => {
    segmentsRef.current = segments;
  }, [segments]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = async (message: any) => {
      if (message.sender_id === currentUserId) return;

      const segs = segmentsRef.current as string[];
      const currentChatId = chatIdRef.current;

      const isOnChatScreen =
        segs.includes("(app)") &&
        segs.includes("chat") &&
        segs.includes("[chat_id]");

      const isThisChat =
        isOnChatScreen && String(currentChatId) === String(message.chat_id);

      if (isThisChat) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: message.sender_name ?? "New message",
          body:
            message.message.length > 60
              ? message.message.slice(0, 57) + "..."
              : message.message,
          data: {
            screen: "Chat",
            chat_id: message.chat_id,
          },
          sound: "default",
          badge: 1,
        },
        trigger: null,
      });
    };

    socket.on("sendMessage", handleMessage);

    return () => {
      socket.off("sendMessage", handleMessage);
    };
  }, [socket, currentUserId]);
};
