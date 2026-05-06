import { PickedAsset } from "@/components/chat/attachment-preview-screen";
import { services } from "@/services";
import { useAuthStore } from "@/store/authStore";
import { useMutation } from "@tanstack/react-query";
import { toUploadFile } from "./use-send-message";

export const useScheduleMessage = () => {
  const token = useAuthStore((s) => s.user?.token);
  return useMutation({
    mutationFn: async ({
      chat_id,
      message,
      assets,
      scheduledAt,
    }: {
      message: string;
      assets: PickedAsset[];
      chat_id: string | undefined;
      scheduledAt: Date;
    }) => {
      if (!chat_id) throw new Error("Chat id required");
      const form = new FormData();
      form.append("chat_id", chat_id);
      form.append("message", message);
      for (const asset of assets) {
        const file = toUploadFile(asset);
        form.append("files", {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as any);
      }
      form.append("scheduled_at", scheduledAt.toISOString());
      const res = await services.chatServices.scheduleMessage({
        token,
        data: form,
      });
      if (res.status === 200) {
        return res.data.data;
      }
      throw new Error(res?.data?.message);
    },
  });
};
