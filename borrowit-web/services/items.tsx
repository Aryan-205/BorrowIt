import { apiUrl } from "@/lib/env";

export const getItems = async () => {
  const res = await fetch(apiUrl(`/api/items`));
  return res.json();
};

export const createItem = async (data: any) => {
  const res = await fetch(apiUrl(`/api/items`), {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getItemById = async (itemId: string) => {
  const res = await fetch(apiUrl(`/api/items/${itemId}`));
  return res.json();
};

export const updateItem = async (itemId: string, data: any) => {
  const res = await fetch(apiUrl(`/api/items/${itemId}`), {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteItem = async (itemId: string) => {
  const res = await fetch(apiUrl(`/api/items/${itemId}`), {
    method: "DELETE",
  });
  return res.json();
};