import { ChatMessage } from "@/hooks/chat/use-chat-messages";
import { create } from "zustand";

type ChatStore = {
  replyData: ChatMessage | null;
  setReply: (data: ChatMessage) => void;
  cancelReply: () => void;
  selected: Map<number, ChatMessage>;
  toggleSelected: (data: ChatMessage) => void;
  clearSelection: () => void;
};

export const useChatStore = create<ChatStore>((set, get) => ({
  replyData: null,
  setReply: (msg) => {
    set({ replyData: msg });
  },
  cancelReply: () => {
    set({ replyData: null });
  },
  selected: new Map(),
  toggleSelected: (data) => {
    const selectedValues = new Map(get().selected);
    if (selectedValues.has(data.id)) {
      selectedValues.delete(data.id);
    } else {
      selectedValues.set(data.id, data);
    }
    set({ selected: selectedValues });
  },
  clearSelection: () => {
    set({ selected: new Map() });
  },
}));
