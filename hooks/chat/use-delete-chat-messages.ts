import { services } from "@/services";
import { useAuthStore } from "@/store/authStore";
import { useMutation } from "@tanstack/react-query";

export type DeleteMessagesPayload = {
  action: "self" | "everyone" | "clear_chat";
  chat_id: number | undefined;
  message_ids: number[];
};

export const useDeleteChatMessages = () => {
  const token = useAuthStore((s) => s.user?.token);
  return useMutation({
    mutationFn: async ({ data }: { data: DeleteMessagesPayload }) => {
      if (!data.chat_id) throw new Error("Chat id not provied");
      if (data.message_ids.length === 0)
        throw new Error("Plese Select Messages you want to be deleted");
      const res = await services.chatServices.deleteMessage({
        token,
        data,
      });
      if (res.status === 200) {
        return res.data.data;
      }
      throw new Error(res?.data?.message);
    },
  });
};
