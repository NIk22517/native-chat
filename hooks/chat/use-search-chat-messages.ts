import { services } from "@/services";
import { useAuthStore } from "@/store/authStore";
import { useInfiniteQuery } from "@tanstack/react-query";

type MessageSearch = {
  id: number;
  message: string;
  highlighted_message: string;
  rank: number;
  created_at: string;
};

interface SearchMessagesType {
  data: MessageSearch[];
  nextCursor?: string | null;
}

interface SearchCursor {
  limit: number;
  cursor?: string | null;
}

export const useSearchMessages = ({
  chat_id,
  search_text,
}: {
  chat_id: string;
  search_text: string;
}) => {
  const token = useAuthStore((s) => s.user?.token);
  return useInfiniteQuery({
    queryKey: ["get_search_messages", chat_id, search_text],
    queryFn: async ({ pageParam }: { pageParam: SearchCursor }) => {
      const res = await services.chatServices.messagesSearch({
        chat_id,
        token,
        query: {
          search_text,
          limit: pageParam.limit,
          cursor: pageParam.cursor,
        },
      });

      if (res.status === 200) {
        return res?.data?.data as SearchMessagesType;
      }

      throw new Error(res?.data?.message || "Failed to fetch messages");
    },
    initialPageParam: { limit: 10, cursor: null } as SearchCursor,
    getNextPageParam: (lastPage) =>
      lastPage.nextCursor
        ? { limit: 10, cursor: lastPage.nextCursor }
        : undefined,

    enabled: !!search_text,
  });
};
