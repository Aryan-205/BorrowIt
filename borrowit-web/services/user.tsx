import { apiUrl } from "@/lib/env";

export const getUser = async (userId: string) => {
  const res = await fetch(apiUrl(`/api/users/${userId}`));
  return res.json();
};

export const getUserById = async (userId: string) => {
  const res = await fetch(apiUrl(`/api/users/${userId}`));
  return res.json();
};

export const createUser = async (data: any) => {
  const res = await fetch(apiUrl(`/api/users`), {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateUser = async (userId: string, data: any) => {
  const res = await fetch(apiUrl(`/api/users/${userId}`), {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteUser = async (userId: string) => {
  const res = await fetch(apiUrl(`/api/users/${userId}`), {
    method: "DELETE",
  });
  return res.json();
};