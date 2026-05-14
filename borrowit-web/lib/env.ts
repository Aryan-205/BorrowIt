/** API origin without trailing slash (matches BorrowIt-app `apiUrl` / EXPO_PUBLIC_API_URL). */
export function apiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4200";
  return raw.replace(/\/?$/, "");
}

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${apiBase()}${p}`;
}
