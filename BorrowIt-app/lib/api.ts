import Constants from "expo-constants";

/** API origin — trailing slash included */
export const BASE_URL: string =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  process.env.EXPO_PUBLIC_API_URL ??
  "http://localhost:4200/";
