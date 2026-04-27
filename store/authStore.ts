import { UserPayload } from "@/hooks/auth/use-sign-in";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AuthState = {
  user: UserPayload | null;

  setAuth: (data: UserPayload) => void;

  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setAuth(data) {
        set({
          user: data,
        });
      },
      logout() {
        set({
          user: null,
        });
      },
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
