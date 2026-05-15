import { services } from "@/services";
import { useAuthStore } from "@/store/authStore";
import * as Application from "expo-application";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const usePushNotifications = () => {
  const token = useAuthStore((state) => state.user?.token);
  useEffect(() => {
    if (!token) return;
    registerToken(token);
  }, [token]);
};

const registerToken = async (token: string) => {
  if (!Device.isDevice) {
    console.warn("Must use a physical device for push notifications");
    return;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("messages", {
      name: "Messages",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      sound: "default",
      showBadge: true,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    return;
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;
  if (!projectId) {
    console.warn("Project Id not found");
    return;
  }
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId,
  });
  const deviceId =
    Platform.OS === "ios"
      ? ((await Application.getIosIdForVendorAsync()) ?? "unknown-ios")
      : (Application.getAndroidId() ?? "unknown-android");

  if (tokenData && deviceId) {
    await services.notificationServices
      .registerPushToken({
        token: token,
        data: {
          device_id: deviceId,
          platform: Platform.OS,
          token: tokenData.data,
        },
      })
      .catch((e) => {
        console.error(e, "notification token error");
      });
  }
};

export const useDismissChatNotifications = (chat_id: number | undefined) => {
  useEffect(() => {
    if (!chat_id) return;
    dismissChatNotifications(chat_id);
  }, [chat_id]);
};

export const dismissChatNotifications = async (chat_id: number) => {
  const delivered = await Notifications.getPresentedNotificationsAsync();

  const toDismiss = delivered.filter(
    (n) => n.request.content.data?.chat_id === chat_id,
  );

  await Promise.all(
    toDismiss.map((n) =>
      Notifications.dismissNotificationAsync(n.request.identifier),
    ),
  );

  const remaining = delivered.length - toDismiss.length;

  await Notifications.setBadgeCountAsync(remaining > 0 ? remaining : 0);
};
