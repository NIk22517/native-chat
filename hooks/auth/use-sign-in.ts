import { services } from "@/services";
import { useAuthStore } from "@/store/authStore";
import { useMutation } from "@tanstack/react-query";

export type SignInPayload = {
  data: {
    email: string;
    password: string;
  };
};

export type UserPayload = {
  avatar_url: string | null;
  created_at: string;
  email: string;
  id: number;
  name: string;
  token: string;
};

export const useSignIn = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  return useMutation({
    mutationFn: async ({ data }: SignInPayload) => {
      if (!data?.email || !data?.password) {
        throw new Error("Please enter input fields");
      }
      const res = await services.authServices.logIn({
        data,
      });

      console.log(res.data.data, "res.data.data");

      if (res.status === 200) {
        return res.data.data as UserPayload;
      }
      throw new Error(
        res?.data?.error?.details?.message ||
          res?.data?.message ||
          "Login failed",
      );
    },
    onSuccess: (data) => {
      setAuth(data);
    },
  });
};
