import { services } from "@/services";
import { useAuthStore } from "@/store/authStore";
import { useInfiniteQuery } from "@tanstack/react-query";

export type AttachmentType = {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: "image" | "video";
  created_at: string;
  tags: string[];
  pages: number;
  bytes: number;
  type: "upload";
  etag: string;
  placeholder: false;
  url: string;
  secure_url: string;
  original_filename: string;
  audio?: {
    codec: string;
    frequency: number;
    channels: number;
    channel_layout: string;
  };
  duration?: number;
};

type SystemEventType =
  | "group_created"
  | "users_added"
  | "user_removed"
  | "user_left"
  | "group_name_changed"
  | "group_avatar_changed"
  | "message_pinned";

export interface ChatMessage {
  chat_id: number;
  id: number;
  message: string;
  attachments: AttachmentType[] | null;
  sender_id: number;
  created_at: string;
  read_status: "read" | "unread";
  message_type: "user" | "system";
  sender_name: string;
  delete_action: string | null;
  delete_text: string | null;
  reply_data?: {
    id: number;
    message: string;
    attachments: AttachmentType[] | null;
    sender_id: number;
    created_at: string;
    sender_name: string;
  };
  system_data: {
    event: SystemEventType;
    actor: {
      id: number;
      name: string;
    };
    targets?: {
      id: number;
      name: string;
    }[];
  } | null;
}

export type ChatMessagesParam = {
  limit: number;
  before_id?: number;
  after_id?: number;
  around_id?: number;
};

export type ChatResponse = {
  data: ChatMessage[];
  paging: {
    has_older: boolean;
    has_newer: boolean;
    oldest_id: number;
    newest_id: number;
    limit: number;
  };
};

export const useGetChatMessages = ({ chat_id }: { chat_id: string }) => {
  const token = useAuthStore((state) => state.user?.token);
  return useInfiniteQuery({
    queryKey: ["get_chat_messages", chat_id],
    initialPageParam: {
      limit: 10,
    },
    queryFn: async ({ pageParam }) => {
      const res = await services.chatServices.getMessages({
        token,
        chat_id,
        query: {
          ...pageParam,
        },
      });
      if (res.status === 200) {
        return res.data.data as ChatResponse;
      }
      throw new Error(res?.data?.message);
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.paging?.has_older) return undefined;
      return {
        limit: lastPage.paging.limit,
        before_id: lastPage.paging.oldest_id!,
      } satisfies ChatMessagesParam;
    },
    getPreviousPageParam: (firstPage) => {
      if (!firstPage?.paging.has_newer) return undefined;
      return {
        limit: firstPage.paging.limit,
        after_id: firstPage.paging.newest_id!,
      } satisfies ChatMessagesParam;
    },
  });
};
