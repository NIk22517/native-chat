import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { toast } from "sonner-native";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },

    mutations: {
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          toast.error(
            error.response?.data?.message ||
              error.message ||
              "Something went wrong",
          );
          return;
        }
        if (error instanceof Error) {
          toast.error(error.message);
          return;
        }
        toast.error("Something went wrong");
      },
    },
  },
});

const TanstackProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default TanstackProvider;
