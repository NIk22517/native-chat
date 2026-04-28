import { services } from "@/services";
import { useAuthStore } from "@/store/authStore";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { UserPayload } from "./use-sign-in";

export type SignUpPayload = {
  data: {
    email: string;
    password: string;
    name: string;
  };
};

export const useSignUp = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  return useMutation({
    mutationFn: async ({ data }: SignUpPayload) => {
      if (!data || !data.name || !data.email || !data.password) {
        throw new Error("Please Fill all the fields");
      }

      const res = await services.authServices.signUp({
        data,
      });

      if (res.status === 200) {
        return res.data.data as UserPayload;
      }

      throw new Error(res?.data?.message);
    },
    onSuccess: (data) => {
      setAuth(data);
      router.replace("/(app)/chat");
    },
  });
};
