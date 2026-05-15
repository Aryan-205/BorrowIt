import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth";

export const useAuth = () => {
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await authClient.signIn.email({ email, password });
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
  });
};