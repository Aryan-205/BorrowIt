import { useMutation } from "@tanstack/react-query";
import { signIn, signUp, signOut } from "@/services/auth";

export const useSignIn = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => signIn(email, password),
  });
};

export const useSignUp = () => {
  return useMutation({
    mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) => signUp(name, email, password),
  });
};

export const useSignOut = () => {
  return useMutation({
    mutationFn: signOut,
  });
};