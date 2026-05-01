import { useAuthStore } from "@/store/authStore";
import { useSocketStore } from "@/store/socketStore";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useGetChatList } from "./use-chat-list";

export const useChatListSocket = () => {
  const socket = useSocketStore((state) => state.socket);
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  const { data } = useGetChatList();

  useEffect(() => {
    if (!socket || !data) return;
    socket?.on("sendMessage", (eventdata) => {
      console.log("list", eventdata);
      const updatedPages = data.pages.map((pageGroup) =>
        pageGroup.map((chatItem) => {
          if (chatItem.chat_id === eventdata.chat_id) {
            return {
              ...chatItem,
              last_message: {
                attachments: eventdata.attachments,
                created_at: eventdata.created_at,
                message: eventdata.message,
              },
              unread_count:
                userId === eventdata.sender_id
                  ? chatItem.unread_count
                  : Number(chatItem.unread_count) + 1,
            };
          }
          return chatItem;
        }),
      );

      queryClient.setQueryData(["get_chat_list"], {
        ...data,
        pages: updatedPages,
      });
    });

    socket.on(
      "markReadMessage",
      (eventData: { chat_id: number; seen_by: number }) => {
        if (userId !== eventData.seen_by) return;
        const updatedPages = data.pages.map((pageGroup) =>
          pageGroup.map((chatItem) => {
            if (chatItem.chat_id === eventData.chat_id) {
              return {
                ...chatItem,
                unread_count: "0",
              };
            }
            return chatItem;
          }),
        );
        queryClient.setQueryData(["get_chat_list"], {
          ...data,
          pages: updatedPages,
        });
      },
    );
  }, [data]);
};
