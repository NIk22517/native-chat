import { PickedAsset } from "@/components/chat/attachment-preview-screen";
import { services } from "@/services";
import { useAuthStore } from "@/store/authStore";
import { useMutation } from "@tanstack/react-query";

type UploadFile = {
  uri: string;
  name: string;
  type: string;
};

function toUploadFile(asset: PickedAsset): UploadFile {
  if (asset.kind === "media") {
    return {
      uri: asset.uri,
      name: asset.fileName || `file.${asset.mimeType?.split("/")[1] || "jpg"}`,
      type: asset.mimeType || "application/octet-stream",
    };
  }

  return {
    uri: asset.uri,
    name: asset.name,
    type: asset.mimeType || "application/octet-stream",
  };
}

export const useSendMessage = () => {
  const token = useAuthStore((state) => state.user?.token);
  return useMutation({
    mutationFn: async ({
      chat_id,
      message,
      assets,
      reply_message_id,
    }: {
      message: string;
      chat_id: string | undefined;
      assets: PickedAsset[];
      reply_message_id: number | null;
    }) => {
      if (!chat_id) throw new Error("Chat Not Found");
      const form = new FormData();
      form.append("message", message);
      form.append("chat_id", chat_id);
      for (const asset of assets) {
        const file = toUploadFile(asset);
        form.append("files", {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as any);
      }
      if (reply_message_id) {
        form.append("reply_message_id", String(reply_message_id));
      }
      const res = await services.chatServices.sendMessages({
        token,
        data: form,
      });
      if (res.status === 200) {
        return res.data?.data;
      }
      throw new Error(res?.data?.message);
    },
  });
};
