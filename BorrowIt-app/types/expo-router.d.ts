declare module "expo-router" {
  export {
    useRouter,
    useUnstableGlobalHref,
    usePathname,
    useNavigationContainerRef,
    useGlobalSearchParams,
    useLocalSearchParams,
    useSegments,
    useRootNavigation,
    useRootNavigationState,
  } from "expo-router/build/hooks";

  export { router, Router } from "expo-router/build/imperative-api";
  export { Stack } from "expo-router/build/layouts/Stack";
  export { Tabs } from "expo-router/build/layouts/Tabs";
  export { Link, Redirect } from "expo-router/build/link/Link";
  export { Slot, Navigator } from "expo-router/build/views/Navigator";
}
