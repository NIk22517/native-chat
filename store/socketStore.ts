import { io, Socket } from "socket.io-client";
import { create } from "zustand";

interface SocketState {
  socket: Socket | null;
  connected: boolean;
  connect: (token: string) => void;
  disconnect: () => void;
  emit: (event: string, data?: unknown) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  connected: false,
  connect(token) {
    const existing = get().socket;
    if (existing?.connected) return;
    if (existing?.disconnect) {
      existing.disconnect();
    }

    const socket = io("ws://192.168.1.33:8080", {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => {
      console.log("Socket Connect");
      set({ connected: true });
    });

    socket.on("disconnect", () => {
      console.log("Socket Disconnected");
      set({ connected: false });
    });

    socket.on("connect_error", (err) => {
      console.error("Socket error:", err.message);
    });

    set({ socket });
  },
  disconnect() {
    get().socket?.disconnect();
    set({ socket: null, connected: false });
  },
  emit(event, data) {
    const socket = get().socket;
    if (!socket?.connected) {
      console.warn("Socket not connected, dropping emit:", event);
      return;
    }
    socket.emit(event, data);
  },
}));
