import { ChatMessage } from "@/hooks/chat/use-chat-messages";
import { create } from "zustand";

type ChatStore = {
  replyData: ChatMessage | null;
  setReply: (data: ChatMessage) => void;
  cancelReply: () => void;
};

export const useChatStore = create<ChatStore>((set, get) => ({
  replyData: null,
  setReply: (msg) => {
    set({ replyData: msg });
  },
  cancelReply: () => {
    set({ replyData: null });
  },
}));
