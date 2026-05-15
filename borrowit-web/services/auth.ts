import { apiFetch } from "@/lib/api";

export const signIn = async (email: string, password: string) => {
  return apiFetch("/api/auth/signin", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const signUp = async (name: string, email: string, password: string) => {
  return apiFetch("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
};