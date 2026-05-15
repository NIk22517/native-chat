import { useAuthStore } from "@/store/authStore";
import { useSocketStore } from "@/store/socketStore";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useGetChatList } from "./use-chat-list";

export const useChatListSocket = () => {
  const socket = useSocketStore((state) => state.socket);
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  const { data } = useGetChatList();

  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    if (!socket) return;

    socket.on("sendMessage", (eventData) => {
      const currentData = dataRef.current;
      if (!currentData) return;

      const updatedPages = currentData.pages.map((pageGroup) =>
        pageGroup.map((chatItem) => {
          if (chatItem.chat_id === eventData.chat_id) {
            return {
              ...chatItem,
              last_message: {
                attachments: eventData.attachments,
                created_at: eventData.created_at,
                message: eventData.message,
              },
              unread_count:
                userId === eventData.sender_id
                  ? chatItem.unread_count
                  : Number(chatItem.unread_count) + 1,
            };
          }
          return chatItem;
        }),
      );

      queryClient.setQueryData(["get_chat_list"], {
        ...currentData,
        pages: updatedPages,
      });
    });

    socket.on(
      "markReadMessage",
      (eventData: { chat_id: number; seen_by: number }) => {
        const currentData = dataRef.current;
        if (!currentData) return;
        if (userId !== eventData.seen_by) return;

        const updatedPages = currentData.pages.map((pageGroup) =>
          pageGroup.map((chatItem) => {
            if (chatItem.chat_id === eventData.chat_id) {
              return { ...chatItem, unread_count: "0" };
            }
            return chatItem;
          }),
        );

        queryClient.setQueryData(["get_chat_list"], {
          ...currentData,
          pages: updatedPages,
        });
      },
    );

    socket.on(
      "deleteMessage",
      (eventData: {
        action: "self" | "everyone" | "clear_chat";
        chat_id: number;
        deleted_by: number;
        messages_ids: number[];
      }) => {
        const currentData = dataRef.current;
        if (!currentData) return;

        const updatedPages = currentData.pages.map((pageGroup) =>
          pageGroup.map((chatItem) => {
            if (
              eventData.chat_id === chatItem.chat_id &&
              eventData.messages_ids.some(
                (id) => chatItem?.last_message?.message_id === id,
              )
            ) {
              return {
                ...chatItem,
                last_message: {
                  ...chatItem.last_message,
                  attachments: [],
                  message: "This message is deleted",
                },
              };
            }
            return chatItem;
          }),
        );

        queryClient.setQueryData(["get_chat_list"], {
          ...currentData,
          pages: updatedPages,
        });
      },
    );

    return () => {
      socket.off("sendMessage");
      socket.off("markReadMessage");
      socket.off("deleteMessage");
    };
  }, [socket, userId]);
};
