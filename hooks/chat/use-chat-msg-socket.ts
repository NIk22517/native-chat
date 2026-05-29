import { useAuthStore } from "@/store/authStore";
import { useSocketStore } from "@/store/socketStore";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useMarkReadChat } from "./use-chat-list";
import type { ChatMessagesParam, ChatResponse } from "./use-chat-messages";

export const useChatMsgSocket = ({
  chat_id,
  message_id,
}: {
  chat_id: string;
  message_id: number | null;
}) => {
  const socket = useSocketStore((state) => state.socket);
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  const { mutate: mutateReadMsg } = useMarkReadChat();

  const chatIdRef = useRef(chat_id);
  const userIdRef = useRef(userId);

  useEffect(() => {
    chatIdRef.current = chat_id;
  }, [chat_id]);
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    if (!socket) return;

    const handleSendMessage = (eventdata: any) => {
      if (Number(chatIdRef.current) !== eventdata.chat_id) return;

      queryClient.setQueryData(
        [
          "get_chat_messages",
          eventdata.chat_id?.toString(),
          { around_id: message_id },
        ],
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

      if (eventdata.sender_id !== userIdRef.current) {
        mutateReadMsg({ chat_id: eventdata.chat_id });
      }
    };

    const handleMarkRead = (eventData: {
      chat_id: number;
      seen_by: number;
    }) => {
      if (
        userIdRef.current === eventData.seen_by ||
        Number(chatIdRef.current) !== eventData.chat_id
      )
        return;

      queryClient.setQueryData(
        [
          "get_chat_messages",
          eventData.chat_id?.toString(),
          { around_id: message_id },
        ],
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
                data: page.data.map((el) => ({
                  ...el,
                  read_status: "read",
                })),
              })),
            };
          }
        },
      );
    };

    const handleDeleteMessage = (eventData: {
      action: "self" | "everyone" | "clear_chat";
      chat_id: number;
      deleted_by: number;
      messages_ids: number[];
    }) => {
      if (Number(chatIdRef.current) !== eventData.chat_id) return;

      const msg_id = new Set(eventData.messages_ids);

      queryClient.setQueryData(
        [
          "get_chat_messages",
          eventData.chat_id?.toString(),
          { around_id: message_id },
        ],
        (
          old:
            | {
                pageParams: (ChatMessagesParam | undefined)[];
                pages: ChatResponse[];
              }
            | undefined,
        ) => {
          if (eventData.action === "clear_chat") {
            return {
              pageParams: [undefined],
              pages: [
                {
                  data: [],
                  paging: {
                    has_newer: false,
                    has_older: false,
                    oldest_id: null,
                    newest_id: null,
                    limit: 0,
                  },
                },
              ],
            };
          }

          if (old && Array.isArray(old.pages)) {
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.map((el) => {
                  if (msg_id.has(el.id)) {
                    return {
                      ...el,
                      delete_action: eventData.action,
                      delete_text:
                        userIdRef.current === eventData.deleted_by
                          ? `You deleted this message ${eventData.action === "self" ? "" : "for everyone"}`
                          : "This message is deleted by sender",
                    };
                  }
                  return el;
                }),
              })),
            };
          }
        },
      );
    };

    socket.on("sendMessage", handleSendMessage);
    socket.on("markReadMessage", handleMarkRead);
    socket.on("deleteMessage", handleDeleteMessage);

    return () => {
      socket.off("sendMessage", handleSendMessage);
      socket.off("markReadMessage", handleMarkRead);
      socket.off("deleteMessage", handleDeleteMessage);
    };
  }, [socket]);
};
