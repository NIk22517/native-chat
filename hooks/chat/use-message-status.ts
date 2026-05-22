import { services } from "@/services";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";

export type MessageStatus = {
  user_id: number;
  status: string;
  user_name: string;
  read_at?: string;
};

export const useGetMessageStatus = ({
  chat_id,
  message_id,
}: {
  chat_id: string;
  message_id: string;
}) => {
  const token = useAuthStore((s) => s.user?.token);
  return useQuery<MessageStatus[]>({
    queryKey: ["get_messages_status", { chat_id, message_id }],
    queryFn: async () => {
      if (!chat_id || !message_id) throw new Error("Params missing");
      const res = await services.chatServices.messageStatus({
        chat_id,
        message_id,
        token,
      });
      if (res.status === 200) {
        return res?.data?.data?.statuses;
      }
      throw new Error(res?.data?.message);
    },
  });
};
