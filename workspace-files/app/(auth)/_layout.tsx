import { Stack } from "expo-router";

/** AsyncStorage key used by login/register dev bypass */
export const DEV_BYPASS_KEY = "borrowit_dev_bypass";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_bottom" }} />
  );
}
