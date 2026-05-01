import { useAuthStore } from "@/store/authStore";
import { useSocketStore } from "@/store/socketStore";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useMarkReadChat } from "./use-chat-list";
import type { ChatMessagesParam, ChatResponse } from "./use-chat-messages";

export const useChatMsgSocket = ({ chat_id }: { chat_id: string }) => {
  const socket = useSocketStore((state) => state.socket);
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  const { mutate: mutateReadMsg } = useMarkReadChat();
  useEffect(() => {
    if (!socket) return;
    socket.on("sendMessage", (eventdata) => {
      if (Number(chat_id) !== eventdata.chat_id) return;
      queryClient.setQueryData(
        ["get_chat_messages", eventdata.chat_id?.toString()],
        (
          old:
            | {
                pageParams: (ChatMessagesParam | undefined)[];
                pages: ChatResponse[];
              }
            | undefined,
        ) => {
          if (old && Array.isArray(old.pages) && old.pages.length > 0) {
            const firstPage = old.pages[0];
            return {
              ...old,
              pages: [
                {
                  ...firstPage,
                  data: [eventdata, ...firstPage.data],
                },
                ...old.pages.slice(1),
              ],
            };
          }

          return {
            pageParams: [undefined],
            pages: [
              {
                data: [eventdata],
                paging: {
                  has_newer: false,
                  has_older: false,
                  oldest_id: eventdata.id,
                  newest_id: eventdata.id,
                  limit: 1,
                },
              },
            ],
          };
        },
      );

      if (eventdata.sender_id !== userId) {
        mutateReadMsg({
          chat_id: eventdata.chat_id,
        });
      }
    });

    socket.on(
      "markReadMessage",
      (eventData: { chat_id: number; seen_by: number }) => {
        if (
          userId === eventData.seen_by ||
          Number(chat_id) !== eventData.chat_id
        )
          return;

        queryClient.setQueryData(
          ["get_chat_messages", eventData.chat_id?.toString()],
          (
            old:
              | {
                  pageParams: (ChatMessagesParam | undefined)[];
                  pages: ChatResponse[];
                }
              | undefined,
          ) => {
            if (old && Array.isArray(old.pages)) {
              return {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  data: page.data.map((el) => {
                    return {
                      ...el,
                      read_status: "read",
                    };
                  }),
                })),
              };
            }
          },
        );
      },
    );
  }, [chat_id]);
};
