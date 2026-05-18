import type { ConfigContext, ExpoConfig } from "expo/config";

/** Local backend at localhost:4000 (see .env) */
const defaultApiUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000/";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  extra: {
    ...config.extra,
    apiUrl: defaultApiUrl,
  },
});
