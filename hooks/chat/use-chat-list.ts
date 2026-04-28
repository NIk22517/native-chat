import { services } from "@/services";
import { useAuthStore } from "@/store/authStore";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export interface ChatMember {
  id: number;
  name: string;
  email: string;
}

export interface LastMessage {
  message: string;
  attachments: any[];
  created_at: string;
  message_id: number;
}

export interface ChatItem {
  chat_id: number;
  chat_name: string;
  chat_type: "single" | "group" | "broadcast";
  created_at: string;
  members: ChatMember[];
  last_message: LastMessage | null;
  unread_count: number;
  is_pinned: boolean;
}

export const useGetChatList = () => {
  const token = useAuthStore((state) => state.user?.token);
  return useInfiniteQuery({
    queryKey: ["get_chat_list"],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const res = await services.chatServices.chatList({
        token,
        params: {
          limit: 10,
          offset: pageParam,
        },
      });
      if (res.status === 200) {
        return res?.data?.data as ChatItem[];
      }
      throw new Error(res?.data?.message);
    },
    getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => {
      if (lastPage?.length > 9) return allPages?.length * 10;
    },
  });
};

export type SingleChatListType = {
  chat_id: number;
  chat_name: string;
  chat_type: ChatItem["chat_type"];
  created_at: string;
  members: ChatMember[];
  unread_count: number;
};

export const useGetSingleChatList = ({
  chat_id,
}: {
  chat_id: string | undefined;
}) => {
  const token = useAuthStore((state) => state.user?.token);
  return useQuery<SingleChatListType>({
    queryKey: ["get_signle_chat_list", chat_id],
    queryFn: async () => {
      if (!chat_id) throw new Error("Chat Id not found");
      const res = await services.chatServices.singleChatList({
        token,
        chat_id,
      });
      if (res.status === 200) {
        return res?.data?.data;
      }
      throw new Error(res?.data?.message);
    },
  });
};

export const useMarkReadChat = () => {
  const token = useAuthStore((state) => state.user?.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ chat_id }: { chat_id: number }) => {
      const res = await services.chatServices.markRead({ token, chat_id });
      if (res.status === 200) {
        return res.data.data;
      }
      throw new Error(res?.data?.message);
    },
    onSuccess: (_, variables) => {
      queryClient.setQueryData(
        ["get_signle_chat_list", variables.chat_id],
        (old: SingleChatListType): SingleChatListType | undefined => {
          if (!old) return old;
          return {
            ...old,
            unread_count: 0,
          };
        },
      );
      queryClient.invalidateQueries({
        queryKey: ["get_chat_list"],
      });
    },
  });
};
