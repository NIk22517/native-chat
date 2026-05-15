import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect, useRef } from "react";

export const useNotificationHandler = () => {
  const foregroundSub = useRef<Notifications.EventSubscription | null>(null);
  const responseSub = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    foregroundSub.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        const data = notification.request.content.data;
        console.log("Foreground notification:", data);
      },
    );

    responseSub.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        handleNotificationTap(data);
      },
    );

    return () => {
      foregroundSub.current?.remove();
      responseSub.current?.remove();
    };
  }, []);

  useEffect(() => {
    const response = Notifications.getLastNotificationResponse();
    if (!response) return;
    const data = response.notification.request.content.data;
    setTimeout(() => handleNotificationTap(data), 500);
  }, []);
};

function handleNotificationTap(data: any) {
  if (!data?.screen) return;

  if (data.screen === "Chat" && data.chat_id) {
    router.push({
      pathname: "/(app)/chat/[chat_id]",
      params: { chat_id: data.chat_id },
    });
  }
}
